import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import App from '../App';

// Mock the CSV processing utilities
vi.mock('../utils/csvProcessor', () => ({
  processCSVFiles: vi.fn().mockResolvedValue('name,age\nJohn,30'),
  previewCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30'),
  previewMergedCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30\nRow 2: Jane | 25'),
  detectDelimiter: vi.fn().mockReturnValue(','),
  parseCSVLine: vi.fn().mockImplementation(line => line.split(',')),
}));

const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    renderWithI18n(<App />);
    expect(screen.getByText(/^(CSV Merge|Unificare CSV)$/)).toBeInTheDocument();
    expect(screen.getByText(/100% Private/)).toBeInTheDocument();
  });

  it('renders language selector in the correct position', () => {
    renderWithI18n(<App />);
    const languageSelector = screen.getByRole('combobox');
    expect(languageSelector).toBeInTheDocument();
    expect(languageSelector.parentElement?.parentElement).toHaveClass('absolute top-4 right-4');
  });

  it('changes language when selector is used', async () => {
    renderWithI18n(<App />);
    const languageSelector = screen.getByRole('combobox');

    // Change to Romanian
    fireEvent.change(languageSelector, { target: { value: 'ro' } });
    await waitFor(() => {
      expect(screen.getByText('Unificare CSV')).toBeInTheDocument();
      expect(screen.getByText(/100% Privat/)).toBeInTheDocument();
    });

    // Change back to English
    fireEvent.change(languageSelector, { target: { value: 'en' } });
    await waitFor(() => {
      expect(screen.getByText('CSV Merge')).toBeInTheDocument();
      expect(screen.getByText(/100% Private/)).toBeInTheDocument();
    });
  });

  it('handles start over functionality', async () => {
    renderWithI18n(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    const startOverButton = screen.getByText('Start Over');
    fireEvent.click(startOverButton);

    expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    expect(screen.queryByText('Preview of Merged Result')).not.toBeInTheDocument();
  });

  it('handles file selection', async () => {
    renderWithI18n(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('handles file deletion', async () => {
    renderWithI18n(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      const deleteButton = screen.getByTitle('Delete file');
      fireEvent.click(deleteButton);
      expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });
  });

  it('shows preview dialog when preview button is clicked', async () => {
    let getByTestId: any;
    act(() => {
      getByTestId = renderWithI18n(<App/>).getByTestId
    })

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    act(() => {
      fireEvent.change(input)
    })
    await waitFor(async () => {
      const previewButton = screen.getByTestId('open-output-preview');
      if (previewButton) {
      }
      act(() => {
        fireEvent.click(previewButton);
      });
      await waitFor(async () => {
        const previewTitle = getByTestId('preview-dialog-title');
        expect(previewTitle).toBeInTheDocument();
        expect(previewTitle).toHaveTextContent('CSV Preview: Preview of Merged Result');
      });
    });
  });

  it('handles drag and drop', async () => {
    renderWithI18n(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const dropZone = screen.getByText(/Drag & drop your CSV files here/);

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('downloads merged CSV when download button is clicked', async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    renderWithI18n(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(async () => {
      const downloadButton = screen.getByText('Download Merged CSV');
      fireEvent.click(downloadButton);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  it('handles social sharing buttons', () => {
    const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithI18n(<App />);

    fireEvent.click(screen.getByTestId('share-twitter'));
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );

    fireEvent.click(screen.getByTestId('share-linkedin'));
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing'),
      '_blank',
      'width=600,height=400'
    );

    fireEvent.click(screen.getByTestId('share-facebook'));
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      'width=600,height=400'
    );

    mockOpen.mockRestore();
  });

  it('handles copy link button', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, {
      clipboard: mockClipboard
    });

    act(() => {
      renderWithI18n(<App/>)
    })
    const copyButton = screen.getByTestId('copy-link');
    act(() => {
      fireEvent.click(copyButton)
    })
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      'https://tools.ca2datavision.ro/csv-merger/'
    );
  });
});
