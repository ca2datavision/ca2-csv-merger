import Papa from 'papaparse';

export const processCSVFiles = async (files: File[]): Promise<string> => {
  const allData: Record<string, string>[] = [];
  const headers = new Set<string>();

  // First pass: collect all unique headers and data
  for (const file of files) {
    const content = await readFileContent(file);
    const result = Papa.parse(content, { header: true });
    
    if (result.meta.fields) {
      result.meta.fields.forEach(header => headers.add(header));
    }
    
    allData.push(...(result.data as Record<string, string>[]));
  }

  // Convert back to CSV
  const headerArray = Array.from(headers);
  return Papa.unparse({
    fields: headerArray,
    data: allData
  });
};

export const previewCSV = async (file: File): Promise<string> => {
  const content = await readFileContent(file);
  const result = Papa.parse(content, { header: true });
  
  if (!result.data.length) return 'Empty CSV file';

  const headers = result.meta.fields || [];
  const maxPreviewRows = Math.min(3, result.data.length);
  const previewLines = [
    `Headers: ${headers.slice(0, 3).join(' | ')}${headers.length > 3 ? ' | ...' : ''}`,
    ...result.data.slice(0, maxPreviewRows).map((row, index) => {
      const values = headers.map(header => (row as Record<string, string>)[header]);
      return `Row ${index + 1}: ${values.slice(0, 3).join(' | ')}${values.length > 3 ? ' | ...' : ''}`;
    })
  ];

  return previewLines.join('\n') + 
    (result.data.length > maxPreviewRows ? 
      `\n... and ${result.data.length - maxPreviewRows} more rows` : '');
};

export const previewMergedCSV = async (csvContent: string): Promise<string> => {
  const result = Papa.parse(csvContent, { header: true });
  
  if (!result.data.length) return 'No data available';

  const headers = result.meta.fields || [];
  const maxPreviewRows = Math.min(15, result.data.length);
  const previewLines = [
    `Headers: ${headers.slice(0, 3).join(' | ')}${headers.length > 3 ? ' | ...' : ''}`,
    ...result.data.slice(0, maxPreviewRows).map((row, index) => {
      const values = headers.map(header => (row as Record<string, string>)[header]);
      return `Row ${index + 1}: ${values.slice(0, 3).join(' | ')}${values.length > 3 ? ' | ...' : ''}`;
    })
  ];

  return previewLines.join('\n') + 
    (result.data.length > maxPreviewRows ? 
      `\n... and ${result.data.length - maxPreviewRows} more rows` : '');
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