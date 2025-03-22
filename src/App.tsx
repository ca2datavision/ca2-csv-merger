import React from 'react';
import { FileText, Github, Upload, Maximize2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { processCSVFiles, previewMergedCSV } from './utils/csvProcessor';
import { FileList } from './components/FileList';
import { PreviewDialog } from './components/PreviewDialog';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedData, setMergedData] = useState<string | null>(null);
  const [mergedPreview, setMergedPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);

  const handleOpenPreview = useCallback((file: File) => {
    setSelectedPreviewFile(file);
    setIsPreviewOpen(true);
  }, []);

  const updateMergedData = useCallback(async (currentFiles: File[]) => {
    if (currentFiles.length === 0) {
      setMergedData(null);
      setMergedPreview(null);
      return;
    }

    try {
      const result = await processCSVFiles(currentFiles);
      setMergedData(result);
      const preview = await previewMergedCSV(result);
      setMergedPreview(preview);
    } catch (error) {
      console.error('Error merging files:', error);
      alert('Error merging files. Please try again.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    const newFiles = [...files, ...droppedFiles];
    setFiles(newFiles);
    updateMergedData(newFiles);
  }, [files, updateMergedData]);

  const handleReorder = useCallback((reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
    updateMergedData(reorderedFiles);
  }, [updateMergedData]);

  const handleDelete = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    updateMergedData(newFiles);
  }, [files, updateMergedData]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === 'text/csv' || file.name.endsWith('.csv')
      );
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      updateMergedData(newFiles);
    }
  }, [files, updateMergedData]);

  const handleDownload = () => {
    if (!mergedData) return;
    const blob = new Blob([mergedData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">CSV Merge</h1>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              🔒 100% Private: All CSV processing happens in your browser - your files never leave your computer
            </p>
            <p className="text-blue-700 mt-3 text-sm">
              A powerful tool for merging multiple CSV files into a single, consolidated file. Simply drag and drop your CSV files,
              arrange them in the desired order, and click merge. The tool automatically handles different column structures and
              preserves all your data.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-8 text-center hover:border-blue-500 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">
            Drag & drop your CSV files here, or
          </p>
          <label className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
            Select Files
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Selected Files</h2>
              <p className="text-sm text-gray-500">
                Drag files to reorder
              </p>
            </div>
            <FileList
              files={files}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onOpenPreview={handleOpenPreview}
            />
            <div className="mt-4 text-center">
              <label className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                Add More Files
                <input
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-6">
              {mergedData && (
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Preview of Merged Result</h3>
                  </div>
                  {mergedPreview && (
                    <div className="bg-white rounded-lg shadow-sm p-4 relative">
                      <button
                        data-testid="open-output-preview"
                        onClick={() => setIsPreviewOpen(true)}
                        className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open Full Preview"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre">
                        {mergedPreview}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                      Download Merged CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Free & Open Source Software
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Built with AI assistance
            </span>
          </div>
          <p className="text-gray-600 mb-2">Built by CA2 Data Vision</p>
          <a
            href="https://github.com/ca2datavision/ca2-csv-merger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600">
                For inquiries or support, please email us at{' '}
                <a
                  href="mailto:ionut@ca2datavision.ro"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ionut@ca2datavision.ro
                </a>
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Disclaimer</h4>
              <p>
                This software is provided "as is", without warranty of any kind, express or implied.
                The creators and contributors of CSV Merge assume no responsibility or liability
                for any errors or issues that may arise from the use of this software.
                Users are solely responsible for validating and verifying all outputs and results.
              </p>
            </div>
          </div>
        </footer>
      </div>
      {isPreviewOpen && mergedData && (
        <PreviewDialog
          csvContent={selectedPreviewFile ? selectedPreviewFile : mergedData}
          fileName={selectedPreviewFile?.name || 'Merged Result'}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
