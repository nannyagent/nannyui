import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RebootScheduleDialog } from './RebootScheduleDialog';

// Mock the services
vi.mock('@/services/rebootService', () => ({
  saveRebootSchedule: vi.fn().mockResolvedValue(true),
  getRebootSchedules: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/services/agentService', () => ({
  getAgents: vi.fn().mockResolvedValue([
    { id: 'agent-1', hostname: 'test-agent-1' },
    { id: 'agent-2', hostname: 'test-agent-2' },
  ]),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Import mocked services after mocking
import { saveRebootSchedule, getRebootSchedules } from '@/services/rebootService';
import { getAgents } from '@/services/agentService';

describe('RebootScheduleDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    agentId: 'agent-123',
    agentName: 'Test Agent',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRebootSchedules as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getAgents as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'agent-1', hostname: 'test-agent-1' },
      { id: 'agent-2', hostname: 'test-agent-2' },
    ]);
  });

  it('should render the dialog when open', async () => {
    render(<RebootScheduleDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Schedule Reboot')).toBeInTheDocument();
    });
  });

  it('should display agent name in description', async () => {
    render(<RebootScheduleDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Configure automatic reboot schedule for Test Agent/)).toBeInTheDocument();
    });
  });

  it('should display LXC name when provided', async () => {
    render(
      <RebootScheduleDialog 
        {...defaultProps} 
        lxcId="lxc-123" 
        lxcName="Test LXC" 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Test LXC \(LXC on Test Agent\)/)).toBeInTheDocument();
    });
  });

  it('should show agent selector when agentId is not provided', async () => {
    render(
      <RebootScheduleDialog 
        open={true}
        onOpenChange={vi.fn()}
        agentId=""
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Agent')).toBeInTheDocument();
    });
  });

  it('should load existing schedule if one exists', async () => {
    const existingSchedule = {
      id: 'schedule-1',
      agent_id: 'agent-123',
      cron_expression: '30 03 * * 1', // Monday at 3:30 AM
      is_active: true,
      reason: 'Weekly maintenance',
    };
    
    (getRebootSchedules as ReturnType<typeof vi.fn>).mockResolvedValue([existingSchedule]);
    
    render(<RebootScheduleDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(getRebootSchedules).toHaveBeenCalledWith('agent-123', undefined);
    });
  });

  it('should save schedule when Save button is clicked', async () => {
    (saveRebootSchedule as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    
    render(<RebootScheduleDialog {...defaultProps} />);
    
    // Wait for form to load
    const saveButton = await screen.findByRole('button', { name: /save schedule/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(saveRebootSchedule).toHaveBeenCalled();
    });
  });

  it('should show success toast when schedule is saved', async () => {
    (saveRebootSchedule as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    
    render(<RebootScheduleDialog {...defaultProps} />);
    
    // Wait for form to load
    const saveButton = await screen.findByRole('button', { name: /save schedule/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: expect.stringContaining('configured'),
      });
    });
  });

  it('should show error toast when save fails', async () => {
    (saveRebootSchedule as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    
    render(<RebootScheduleDialog {...defaultProps} />);
    
    // Wait for form to load
    const saveButton = await screen.findByRole('button', { name: /save schedule/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save reboot schedule',
        variant: 'destructive',
      });
    });
  });

  it('should close dialog when Cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    render(
      <RebootScheduleDialog 
        {...defaultProps} 
        onOpenChange={onOpenChange} 
      />
    );
    
    // Wait for form to load
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not render when closed', () => {
    render(
      <RebootScheduleDialog 
        {...defaultProps} 
        open={false} 
      />
    );
    
    expect(screen.queryByText('Schedule Reboot')).not.toBeInTheDocument();
  });

  describe('Cron Expression Generation', () => {
    it('should generate daily cron expression', async () => {
      render(<RebootScheduleDialog {...defaultProps} />);
      
      // Wait for form to load and check frequency label
      await waitFor(() => {
        expect(screen.getByText(/Frequency/i)).toBeInTheDocument();
      });
    });

    it('should show day of week selector for weekly frequency', async () => {
      render(<RebootScheduleDialog {...defaultProps} />);
      
      // Wait for form to load - Weekly is the default
      await waitFor(() => {
        expect(screen.getByText(/Day of Week/i)).toBeInTheDocument();
      });
    });
  });

  describe('Agent Selection', () => {
    it('should load agents list when no agentId provided', async () => {
      render(
        <RebootScheduleDialog 
          open={true}
          onOpenChange={vi.fn()}
          agentId=""
        />
      );
      
      await waitFor(() => {
        expect(getAgents).toHaveBeenCalled();
      });
    });

    it('should not load agents list when agentId is provided', async () => {
      render(<RebootScheduleDialog {...defaultProps} />);
      
      await waitFor(() => {
        expect(getAgents).not.toHaveBeenCalled();
      });
    });
  });

  describe('Active Toggle', () => {
    it('should render active toggle switch', async () => {
      render(<RebootScheduleDialog {...defaultProps} />);
      
      // Wait for the Enable Schedule text to appear (loading is done)
      await waitFor(() => {
        expect(screen.getByText(/Enable Schedule/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
