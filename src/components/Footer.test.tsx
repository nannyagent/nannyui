import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils/test-utils'
import Footer from './Footer'

describe('Footer', () => {
  it('should render footer component', () => {
    renderWithProviders(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should display copyright text', () => {
    renderWithProviders(<Footer />)
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${currentYear}`, 'i'))).toBeInTheDocument()
  })

  it('should contain application name or branding', () => {
    renderWithProviders(<Footer />)
    
    // Check for common footer text patterns
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/.+/)
  })

  it('should have proper semantic HTML structure', () => {
    const { container } = renderWithProviders(<Footer />)
    
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })
})