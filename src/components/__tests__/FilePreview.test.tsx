import { render, screen, fireEvent } from '@testing-library/react'
import { FilePreview } from '../FilePreview'
import { vi } from 'vitest'

describe('FilePreview', () => {
  const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' })
  const mockOnOpenPreview = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders file information correctly', () => {
    render(<FilePreview file={mockFile} index={0} onOpenPreview={mockOnOpenPreview}/>)

    expect(screen.getByText('test.csv')).toBeInTheDocument()
    expect(screen.getByText('text/csv')).toBeInTheDocument()
  })

  it('shows preview button on CSV files', async () => {
    render(<FilePreview file={mockFile} index={0} onOpenPreview={mockOnOpenPreview}/>)

    const previewButton = await screen.findByTitle('Open Full Preview')
    expect(previewButton).toBeInTheDocument()

    fireEvent.click(previewButton)
    expect(mockOnOpenPreview).toHaveBeenCalledWith(mockFile)
  })

  describe('handles errors',  () => {
    let originalFileReader = global.FileReader
    beforeEach(() => {
      // Save the original FileReader so we can restore it later
      originalFileReader = global.FileReader

      const MockFileReader = vi.fn().mockImplementation(() => {
        return {
          onerror: null,
          onload: null,
          onabort: null,
          onloadend: null,
          readAsText: vi.fn(function () {
            // Immediately trigger an error to simulate a bad file read
            if (typeof this.onerror === 'function') {
              this.onerror(new ProgressEvent('error'))
            }
          }),
        }
      })
      // Override the global FileReader with our mock
      vi.stubGlobal('FileReader', MockFileReader)
    })
    afterEach(() => {
      // Restore the original FileReader to avoid affecting other tests
      vi.stubGlobal('FileReader', originalFileReader)
    })

    it('displays error message when preview fails ', async () => {

      const errorFile = new File(['invalid'], 'error.csv', { type: 'text/csvx' })

      render(<FilePreview file={errorFile} index={0} onOpenPreview={mockOnOpenPreview}/>)

      const errorMessage = await screen.findByText('Failed to preview CSV')
      expect(errorMessage).toBeInTheDocument()
    })
  })
})
