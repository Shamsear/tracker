import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE_NAME = "tracker_auth_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "tracker-enterprise-production-secure-key-2026"
);

export interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Sign a secure JWT session token for authenticated users
 */
export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

/**
 * Verify session token (Edge and Node compatible)
 */
export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload || !payload.email || !payload.id) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || "Admin",
      role: (payload.role as string) || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Get current session from Next.js server cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Save authenticated session to secure HttpOnly cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Remove session cookie (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Authenticate credentials against Neon PostgreSQL user records
 */
export async function authenticateUser(email: string, password: string): Promise<{ user: AuthSession | null; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Ensure admin user exists if table is empty
    await ensureInitialAdmin();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return { user: null, error: "Invalid credentials" };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { user: null, error: "Invalid credentials" };
    }

    const session: AuthSession = {
      id: user.id,
      email: user.email,
      name: user.name || "Administrator",
      role: user.role,
    };

    return { user: session };
  } catch (err: unknown) {
    console.error("Authentication error:", err instanceof Error ? err.message : String(err));
    return { user: null, error: "Authentication system temporarily unavailable. Please try again." };
  }
}

/**
 * Seed initial administrative account if no users exist
 */
export async function ensureInitialAdmin() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.create({
        data: {
          id: "admin-master",
          email: "admin@tracker.com",
          name: "Project Administrator",
          passwordHash: hashedPassword,
          role: "admin",
        },
      });
      console.log("Initialized default admin user: admin@tracker.com");
    }
  } catch (err) {
    console.warn("Could not check/seed admin user:", err instanceof Error ? err.message : String(err));
  }
}
