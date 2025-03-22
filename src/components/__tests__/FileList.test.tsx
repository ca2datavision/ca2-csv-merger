import { render, screen, fireEvent } from '@testing-library/react';
import { FileList } from '../FileList';
import { vi } from 'vitest';

describe('FileList', () => {
  const mockFiles = [
    new File(['test1'], 'test1.csv', { type: 'text/csv' }),
    new File(['test2'], 'test2.csv', { type: 'text/csv' })
  ];
  
  const mockProps = {
    files: mockFiles,
    onReorder: vi.fn(),
    onDelete: vi.fn(),
    onOpenPreview: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all files in the list', () => {
    render(<FileList {...mockProps} />);
    
    expect(screen.getByText('test1.csv')).toBeInTheDocument();
    expect(screen.getByText('test2.csv')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<FileList {...mockProps} />);
    
    const deleteButtons = screen.getAllByTitle('Delete file');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(0);
  });

  it('handles drag and drop reordering', () => {
    render(<FileList {...mockProps} />);
    
    const items = screen.getAllByRole('article');
    
    fireEvent.dragStart(items[0]);
    fireEvent.dragEnter(items[1]);
    fireEvent.dragEnd(items[0]);
    
    expect(mockProps.onReorder).toHaveBeenCalledWith([mockFiles[1], mockFiles[0]]);
  });
});