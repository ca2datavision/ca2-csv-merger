import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewDialog } from '../PreviewDialog';
import { vi } from 'vitest';

describe('PreviewDialog', () => {
  const mockCsvContent = 'header1,header2\nvalue1,value2\nvalue3,value4';
  const mockProps = {
    csvContent: mockCsvContent,
    fileName: 'test.csv',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct title and content', () => {
    render(<PreviewDialog {...mockProps} />);

    expect(screen.getByText('CSV Preview: test.csv')).toBeInTheDocument();
    expect(screen.getByText('header1')).toBeInTheDocument();
    expect(screen.getByText('header2')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    const { getByTestId } = render(<PreviewDialog {...mockProps} />);

    const nextButton = getByTestId('Next');
    const prevButton = getByTestId('Previous');

    expect(prevButton).toBeDisabled(); // First page
    expect(nextButton).toBeDisabled(); // Only 2 rows of data

    expect(screen.getByText('Showing rows 1-2 of 2')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const { getByTestId } = render(<PreviewDialog {...mockProps} />);

    const closeButton = getByTestId('close-button');

    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
