import React from 'react';
import { notFound } from 'next/navigation';
import { getProjectLedger, getAllProjects, getProjectById } from '@/lib/ledger';
import { ProjectLedgerView } from '@/components/ProjectLedgerView';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const { summary, ledger } = await getProjectLedger(id);
  const allProjects = await getAllProjects();

  return (
    <ProjectLedgerView
      project={project}
      summary={summary}
      ledger={ledger}
      allProjects={allProjects}
    />
  );
}
