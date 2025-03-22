import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock the CSV processing utilities
vi.mock('../utils/csvProcessor', () => ({
  processCSVFiles: vi.fn().mockResolvedValue('name,age\nJohn,30'),
  previewCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30'),
  previewMergedCSV: vi.fn().mockResolvedValue('Headers: name | age\nRow 1: John | 30'),
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
      const previewButton = await screen.findByTitle('Open Full Preview');
      fireEvent.click(previewButton);
      await waitFor(async () => {
        let previewTitle = getByTestId('preview-dialog-title')
        expect(previewTitle).toBeInTheDocument();
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
      const downloadButton = await screen.findByText('Download Merged CSV');
      fireEvent.click(downloadButton);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });
});
