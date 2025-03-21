import React from 'react';
import { FilePreview } from './FilePreview';
import { GripVertical, Trash2 } from 'lucide-react';

interface FileListProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onDelete?: (index: number) => void;
  onOpenPreview: (file: File) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onReorder, onDelete, onOpenPreview }) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDropTargetIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTargetIndex !== null && draggedIndex !== dropTargetIndex) {
      const newFiles = [...files];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(dropTargetIndex, 0, draggedFile);
      onReorder(newFiles);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <article
          key={`${file.name}-${file.size}-${index}`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnd={handleDragEnd}
          className={`relative bg-white rounded-lg shadow-sm transition-all ${
            draggedIndex === index ? 'opacity-50 cursor-grabbing' : ''
          } ${dropTargetIndex === index ? 'border-2 border-blue-500' : ''}`}
        >
          <div className="flex items-center gap-2">
            <div className="p-2 cursor-grab hover:bg-gray-100 rounded transition-colors">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-grow mr-2">
              <FilePreview file={file} index={index} onOpenPreview={onOpenPreview} />
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};