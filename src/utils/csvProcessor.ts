export const processCSVFiles = async (files: File[]): Promise<string> => {
  const headers = new Set<string>();
  const allData: Record<string, string>[] = [];

  // First pass: collect all unique headers
  for (const file of files) {
    const content = await readFileContent(file);
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;

    const fileHeaders = lines[0].split(',').map(h => h.trim());
    fileHeaders.forEach(header => headers.add(header));
  }

  // Second pass: process all data
  for (const file of files) {
    const content = await readFileContent(file);
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length <= 1) continue;

    const fileHeaders = lines[0].split(',').map(h => h.trim());
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      // Initialize all headers with empty strings
      Array.from(headers).forEach(header => {
        row[header] = '';
      });
      
      // Fill in available values
      fileHeaders.forEach((header, index) => {
        if (values[index]) {
          row[header] = values[index];
        }
      });
      
      allData.push(row);
    }
  }

  // Convert to CSV string
  const headerArray = Array.from(headers);
  const csvContent = [
    headerArray.join(','),
    ...allData.map(row => headerArray.map(header => row[header]).join(','))
  ].join('\n');

  return csvContent;
};

export const previewCSV = async (file: File): Promise<string> => {
  const content = await readFileContent(file);
  const lines = content.split('\n').filter(line => line.trim());
  if (!lines.length) return 'Empty CSV file';

  // Get headers
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Format preview with aligned columns
  const maxPreviewRows = Math.min(3, lines.length);
  const previewLines = lines.slice(0, maxPreviewRows).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim());
    if (index === 0) {
      return `Headers: ${cells.slice(0, 3).join(' | ')}${cells.length > 3 ? ' | ...' : ''}`;
    }
    return `Row ${index}: ${cells.slice(0, 3).join(' | ')}${cells.length > 3 ? ' | ...' : ''}`;
  });

  return previewLines.join('\n') + (lines.length > maxPreviewRows ? `\n... and ${lines.length - maxPreviewRows} more rows` : '');
};

export const previewMergedCSV = async (csvContent: string): Promise<string> => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (!lines.length) return 'No data available';

  const maxPreviewRows = Math.min(15, lines.length);
  const previewLines = lines.slice(0, maxPreviewRows).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim());
    if (index === 0) {
      return `Headers: ${cells.slice(0, 3).join(' | ')}${cells.length > 3 ? ' | ...' : ''}`;
    }
    return `Row ${index}: ${cells.slice(0, 3).join(' | ')}${cells.length > 3 ? ' | ...' : ''}`;
  });

  return previewLines.join('\n') + (lines.length > maxPreviewRows ? `\n... and ${lines.length - maxPreviewRows} more rows` : '');
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsText(file);
  });
};