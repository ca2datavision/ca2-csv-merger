import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { PreviewDialog } from '../PreviewDialog';
import { vi } from 'vitest';

const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

const generateLargeCSV = () => {
  const headers = '"Complex, Header 1","Header, 2"';
  const rows = Array.from({ length: 100 }, (_, i) => `"value ${i}, with comma",value${i}`);
  return [headers, ...rows].join('\n');
};

describe('PreviewDialog', () => {
  const mockCsvContent = '"header 1, complex","header 2"\n"value 1, with comma","value 2"\n"value 3, more","value 4"';
  const mockProps = {
    csvContent: mockCsvContent,
    fileName: 'test.csv',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct title and content', () => {
    renderWithI18n(<PreviewDialog {...mockProps} />);

    const title = screen.getByTestId('preview-dialog-title');
    expect(title).toHaveTextContent('CSV Preview: test.csv');
    expect(screen.getByText('header 1, complex')).toBeInTheDocument();
    expect(screen.getByText('value 1, with comma')).toBeInTheDocument();
  });

  it('handles semicolon-delimited content', () => {
    const semicolonContent = 'header1;header2\nvalue1;value2';
    renderWithI18n(<PreviewDialog {...mockProps} csvContent={semicolonContent} />);
    expect(screen.getByText('header1')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    const { getByTestId } = renderWithI18n(<PreviewDialog {...mockProps} />);

    const nextButton = getByTestId('Next');
    const prevButton = getByTestId('Previous');

    expect(prevButton).toBeDisabled(); // First page
    expect(nextButton).toBeDisabled(); // Only 2 rows of data

    expect(screen.getByText('Showing rows 1-2 of 2')).toBeInTheDocument();
    expect(screen.getByText(/Showing rows 1-2 of 2|Afișare rânduri 1-2 din 2/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const { getByTestId } = renderWithI18n(<PreviewDialog {...mockProps} />);

    const closeButton = getByTestId('close-button');

    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
  it('handles pagination with large datasets', async () => {
    const largeCsvContent = generateLargeCSV();
    const { getByTestId } = renderWithI18n(
      <PreviewDialog
        csvContent={largeCsvContent}
        fileName="large.csv"
        onClose={() => {}}
      />
    );

    const nextButton = getByTestId('Next');
    const prevButton = getByTestId('Previous');

    // Initially, Previous should be disabled and Next enabled
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Click Next and verify Previous becomes enabled
    fireEvent.click(nextButton);
    expect(prevButton).not.toBeDisabled();

    // Go back using Previous
    fireEvent.click(prevButton);
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('shows correct page information when navigating', async () => {
    const largeCsvContent = generateLargeCSV();
    renderWithI18n(
      <PreviewDialog
        csvContent={largeCsvContent}
        fileName="large.csv"
        onClose={() => {}}
      />
    );

    // Check initial page
    expect(screen.getByText(/Page 1 of 2|Pagina 1 din 2/)).toBeInTheDocument();
    expect(screen.getByText(/Showing rows 1-50 of 100|Afișare rânduri 1-50 din 100/)).toBeInTheDocument();

    // Go to next page
    fireEvent.click(screen.getByTestId('Next'));
    expect(screen.getByText(/Page 2 of 2|Pagina 2 din 2/)).toBeInTheDocument();
    expect(screen.getByText(/Showing rows 51-100 of 100|Afișare rânduri 51-100 din 100/)).toBeInTheDocument();

    // Go back to first page
    fireEvent.click(screen.getByTestId('Previous'));
    expect(screen.getByText(/Page 1 of 2|Pagina 1 din 2/)).toBeInTheDocument();
    expect(screen.getByText(/Showing rows 1-50 of 100|Afișare rânduri 1-50 din 100/)).toBeInTheDocument();
  });
});
