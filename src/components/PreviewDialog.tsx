import React, { useState } from 'react';
import { X } from 'lucide-react';
import Papa from 'papaparse';

interface PreviewDialogProps {
  csvContent: string;
  fileName: string;
  onClose: () => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({ csvContent, fileName, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [content, setContent] = useState<string>('');
  const rowsPerPage = 50;

  React.useEffect(() => {
    const loadContent = async () => {
      if (csvContent instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target?.result as string);
        };
        reader.readAsText(csvContent);
      } else {
        setContent(csvContent);
      }
    };
    loadContent();
  }, [csvContent]);

  if (!content) {
    return null;
  }

  const result = Papa.parse(content, { header: true });
  const headers = result.meta.fields || [];
  const data = result.data;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold" data-testid="preview-dialog-title">CSV Preview: {fileName}</h2>
          <button
            data-testid={"close-button"}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left bg-gray-50 w-16">#</th>
                {headers.map((header, i) => (
                  <th key={i} className="border px-4 py-2 text-left bg-gray-50">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-gray-500 text-sm font-mono">
                    {startIndex + i + 1}
                  </td>
                  {headers.map((header, j) => (
                    <td key={j} className="border px-4 py-2">
                      {(row as Record<string, string>)[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t p-4 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing rows {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length}
          </div>
          <div className="flex gap-2">
            <button
              data-testid={"Previous"}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              data-testid={"Next"}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
