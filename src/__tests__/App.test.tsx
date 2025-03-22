import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import userEvent from '@testing-library/user-event';

// Mock the CSV processing utilities
vi.mock('../utils/csvProcessor', () => ({
  processCSVFiles: vi.fn().mockResolvedValue('name,age\nJohn,30'),
  previewCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30'),
  previewMergedCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30\nRow 2: Jane | 25'),
  detectDelimiter: vi.fn().mockReturnValue(','),
  parseCSVLine: vi.fn().mockImplementation(line => line.split(',')),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<App />);
    expect(screen.getByText('CSV Merge')).toBeInTheDocument();
    expect(screen.getByText(/100% Private/)).toBeInTheDocument();
  });

  it('handles start over functionality', async () => {
    render(<App />);
    
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
    render(<App />);

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
    render(<App />);

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
    const { getByTestId } = render(<App />);

    const file = new File(['name,age\nJohn,30'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText('Select Files');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(async () => {
      const previewButton = screen.getByTestId('open-output-preview');
      fireEvent.click(previewButton);
      await waitFor(async () => {
        const previewTitle = getByTestId('preview-dialog-title');
        expect(previewTitle).toBeInTheDocument();
        expect(previewTitle).toHaveTextContent('CSV Preview: Merged Result');
      });
    });
  });

  it('handles drag and drop', async () => {
    render(<App />);

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

    render(<App />);

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
    render(<App />);

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

    render(<App />);
    
    const copyButton = screen.getByTestId('copy-link');
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      'https://tools.ca2datavision.ro/csv-merger/'
    );
  });
});
