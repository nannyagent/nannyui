import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CronScheduleDialog } from './CronScheduleDialog';
import * as patchManagementService from '@/services/patchManagementService';

vi.mock('@/services/patchManagementService');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('CronScheduleDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockAgentId = 'agent-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <CronScheduleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        agentId={mockAgentId}
      />
    );

    expect(screen.getByText('Schedule Patch Updates')).toBeInTheDocument();
    expect(screen.getByText('Frequency')).toBeInTheDocument();
  });

  it('should call saveCronSchedule when saved', async () => {
    (patchManagementService.saveCronSchedule as any).mockResolvedValue(true);

    render(
      <CronScheduleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        agentId={mockAgentId}
      />
    );

    // Click save
    fireEvent.click(screen.getByText('Save Schedule'));

    await waitFor(() => {
      expect(patchManagementService.saveCronSchedule).toHaveBeenCalledWith(
        mockAgentId,
        expect.any(String), // cron expression
        true, // isActive default
        undefined // lxcId default
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should pass lxcId to saveCronSchedule', async () => {
    (patchManagementService.saveCronSchedule as any).mockResolvedValue(true);

    render(
      <CronScheduleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        agentId={mockAgentId}
        lxcId="lxc-123"
      />
    );

    fireEvent.click(screen.getByText('Save Schedule'));

    await waitFor(() => {
      expect(patchManagementService.saveCronSchedule).toHaveBeenCalledWith(
        mockAgentId,
        expect.any(String),
        true,
        "lxc-123"
      );
    });
  });
});
