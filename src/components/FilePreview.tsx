import React from 'react';
import { FileTextIcon, FileX, Maximize2 } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';
import { previewCSV } from '../utils/csvProcessor';

interface FilePreviewProps {
  file: File;
  index: number;
  onOpenPreview: (file: File) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, index, onOpenPreview }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [csvPreview, setCsvPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      previewCSV(file).then(setCsvPreview).catch((e) => {
        console.log('previewCSV error', e);
        setError('Failed to preview CSV');
      });
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      return <FileTextIcon className="w-6 h-6 text-green-500" />;
    }
    return <FileX className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg">
        {getFileIcon()}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 truncate">{file.name}</span>
          <span className="text-sm text-gray-500">({formatFileSize(file.size)})</span>
        </div>
        <p className="text-sm text-gray-600">{file.type || 'Unknown type'}</p>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
        {csvPreview && (
          <div className="mt-2 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre relative group">
            <button
              data-testid="open-input-preview"
              onClick={() => onOpenPreview(file)}
              className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Open Full Preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            {csvPreview}
          </div>
        )}
      </div>
    </div>
  );
};
