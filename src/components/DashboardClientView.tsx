'use client';

import React, { useState } from 'react';
import { ProjectSummary, Project } from '@/lib/ledger';
import { ProjectGrid } from './ProjectGrid';
import { TransactionModal } from './TransactionModal';

interface DashboardClientViewProps {
  summaries: ProjectSummary[];
  allProjects: Project[];
}

export function DashboardClientView({
  summaries,
  allProjects,
}: DashboardClientViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'fund' | 'expense'>('expense');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');

  const handleOpenAddModal = (projectId: string, mode: 'fund' | 'expense') => {
    setSelectedProjectId(projectId);
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <>
      <ProjectGrid
        summaries={summaries}
        onOpenAddModal={handleOpenAddModal}
      />

      {modalOpen && (
        <TransactionModal
          isOpen={modalOpen}
          initialMode={modalMode}
          projects={allProjects}
          defaultProjectId={selectedProjectId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
