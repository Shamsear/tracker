'use client';

import React from 'react';
import { ProjectSummary, Project } from '@/lib/ledger';
import { ProjectGrid } from './ProjectGrid';

interface DashboardClientViewProps {
  summaries: ProjectSummary[];
  allProjects: Project[];
}

export function DashboardClientView({
  summaries,
}: DashboardClientViewProps) {
  return (
    <ProjectGrid summaries={summaries} />
  );
}
