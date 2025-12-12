import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test-utils/test-utils'
import { mockAgent } from '@/test-utils/mock-data'
import AgentDeleteDialog from './AgentDeleteDialog'

describe('AgentDeleteDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    // Use getAllByText since "Delete Agent" appears in both title and button
    const deleteElements = screen.getAllByText(/delete agent/i)
    expect(deleteElements.length).toBeGreaterThan(0)
    // Text is split across multiple elements, use more flexible matcher
    expect(screen.getByText(/Test Agent/)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderWithProviders(
      <AgentDeleteDialog
        open={false}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.queryByText(/delete agent/i)).not.toBeInTheDocument()
  })

  it('should call onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should call onConfirm when delete is confirmed', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete agent/i })
    await user.click(deleteButton)

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('should show loading state during deletion', () => {
    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /deleting/i })
    expect(deleteButton).toBeDisabled()
  })

  it('should display warning message', () => {
    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName={mockAgent.name}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()
  })

  it('should display agent name in the confirmation message', () => {
    renderWithProviders(
      <AgentDeleteDialog
        open={true}
        agentName="MyTestAgent"
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/MyTestAgent/i)).toBeInTheDocument()
  })
})