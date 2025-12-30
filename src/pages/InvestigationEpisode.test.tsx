import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test-utils/test-utils';
import InvestigationEpisode from './InvestigationEpisode';
import * as investigationService from '@/services/investigationService';

// Mock dependencies
vi.mock('@/services/investigationService', () => ({
  getInvestigation: vi.fn(),
  formatInvestigationTime: vi.fn((time) => time),
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
}));

// Mock data based on episode-inference.json
const mockInvestigation = {
  "id": "35hg22pih957389",
  "user_id": "4ktdt4jgm7xnm57",
  "agent_id": "wfta27ppaniafcx",
  "episode_id": "019b5089-c7a0-72c2-86ee-52d87ccb5463",
  "user_prompt": "How are system metrics looking?",
  "priority": "medium",
  "status": "completed",
  "resolution_plan": "1. **Prioritize critical applications**...",
  "initiated_at": "2025-12-24T14:25:00Z",
  "completed_at": "2025-12-24T13:27:39.335Z",
  "created_at": "2025-12-24T14:25:00Z",
  "updated_at": "2025-12-24T14:25:00Z",
  "metadata": {
    "inferences": [
      {
        "id": "019b5089-c7a0-72c2-86ee-52c0a7604394",
        "function_name": "diagnose_and_heal_application",
        "variant_name": "v1",
        "timestamp": "2025-12-24T14:25:00Z",
        "processing_time_ms": 29717,
        "input": {
          "messages": [
            {
              "content": [
                {
                  "text": "SYSTEM INFORMATION:...",
                  "type": "text"
                }
              ],
              "role": "user"
            }
          ]
        },
        "output": {
          "commands": [
            "top -bn1"
          ],
          "ebpf_programs": [],
          "reasoning": "The system shows elevated load...",
          "response_type": "diagnostic"
        },
        "usage": {
            "input_tokens": 100,
            "output_tokens": 50,
            "total_tokens": 150
        }
      }
    ]
  },
  "inference_count": 1,
  "agent": {
    "id": "wfta27ppaniafcx",
    "hostname": "test-agent",
    "status": "active"
  }
};

describe('InvestigationEpisode Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render investigation details and inferences from metadata', async () => {
    (investigationService.getInvestigation as any).mockResolvedValue(mockInvestigation);

    renderWithProviders(
      <Routes>
        <Route path="/investigations/:investigationId" element={<InvestigationEpisode />} />
      </Routes>,
      {
        route: '/investigations/35hg22pih957389'
      }
    );

    // Verify loading state
    expect(screen.getByText(/Loading investigation/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Investigation Details')).toBeInTheDocument();
    });

    // Verify investigation details
    expect(screen.getByText('How are system metrics looking?')).toBeInTheDocument();
    expect(screen.getByText('35hg22pih957389')).toBeInTheDocument();
    expect(screen.getByText('test-agent')).toBeInTheDocument();

    // Verify inference list
    expect(screen.getByText('Episode Inferences (1)')).toBeInTheDocument();
    expect(screen.getByText('Inference #1')).toBeInTheDocument();
    expect(screen.getByText('diagnose_and_heal_application')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    
    // Verify token usage calculation
    expect(screen.getByText('Total Tokens')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });
});
