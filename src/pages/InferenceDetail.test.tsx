import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InferenceDetail from './InferenceDetail';
import * as investigationService from '@/services/investigationService';

// Mock dependencies
vi.mock('@/services/investigationService', () => ({
  getInferenceById: vi.fn(),
  getInvestigation: vi.fn(),
}));

vi.mock('@/utils/withAuth', () => ({
  default: (Component: any) => Component,
}));

const mockInference = {
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
};

const mockInvestigation = {
  metadata: {
    inferences: [mockInference]
  }
};

describe('InferenceDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render inference details from investigation metadata', async () => {
    (investigationService.getInvestigation as any).mockResolvedValue(mockInvestigation);

    render(
      <MemoryRouter initialEntries={['/investigations/inv-1/inference/019b5089-c7a0-72c2-86ee-52c0a7604394']}>
        <Routes>
          <Route path="/investigations/:investigationId/inference/:inferenceId" element={<InferenceDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Inference Details')).toBeInTheDocument();
    });

    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Input tokens
    expect(screen.getByText('50')).toBeInTheDocument(); // Output tokens
    
    // Check for bash format rendering
    // Input tab is default
    expect(screen.getByText('SYSTEM INFORMATION')).toBeInTheDocument();
  });
});
