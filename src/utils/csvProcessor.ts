import Papa from 'papaparse';

const isColumnEmpty = (data: Record<string, string>[], header: string): boolean => {
  return data.every(row => !row[header] || row[header].trim() === '');
};

const filterEmptyColumns = (data: Record<string, string>[], headers: string[]): {
  filteredData: Record<string, string>[],
  filteredHeaders: string[]
} => {
  const nonEmptyHeaders = headers.filter(header => !isColumnEmpty(data, header));
  const filteredData = data.map(row => {
    const newRow: Record<string, string> = {};
    nonEmptyHeaders.forEach(header => {
      if (row[header]) {
        newRow[header] = row[header];
      }
    });
    return newRow;
  });
  return { filteredData, filteredHeaders: nonEmptyHeaders };
};

export const processCSVFiles = async (files: File[]): Promise<string> => {
  const allData: Record<string, string>[] = [];
  const headers = new Set<string>();

  // First pass: collect all unique headers and data
  for (const file of files) {
    const content = await readFileContent(file);
    const result = Papa.parse(content, { 
      header: true,
      skipEmptyLines: true 
    });
    
    if (result.meta.fields) {
      result.meta.fields.forEach(header => headers.add(header));
    }
    
    allData.push(...(result.data as Record<string, string>[]));
  }

  const headerArray = Array.from(headers);
  const { filteredData, filteredHeaders } = filterEmptyColumns(allData, headerArray);

  return Papa.unparse({
    fields: filteredHeaders,
    data: filteredData
  });
};

export const previewCSV = async (file: File): Promise<string> => {
  const content = await readFileContent(file);
  const result = Papa.parse(content, { 
    header: true,
    skipEmptyLines: true 
  });
  
  if (!result.data.length) return 'Empty CSV file';

  const headers = result.meta.fields || [];
  const { filteredData, filteredHeaders } = filterEmptyColumns(
    result.data as Record<string, string>[],
    headers
  );

  const maxPreviewRows = Math.min(3, result.data.length);
  const previewLines = [
    `Headers: ${filteredHeaders.slice(0, 3).join(' | ')}${filteredHeaders.length > 3 ? ' | ...' : ''}`,
    ...filteredData.slice(0, maxPreviewRows).map((row, index) => {
      const values = filteredHeaders.map(header => row[header] || '');
      return `Row ${index + 1}: ${values.slice(0, 3).join(' | ')}${values.length > 3 ? ' | ...' : ''}`;
    })
  ];

  return previewLines.join('\n') + 
    (filteredData.length > maxPreviewRows ? 
      `\n... and ${filteredData.length - maxPreviewRows} more rows` : '');
};

export const previewMergedCSV = async (csvContent: string): Promise<string> => {
  const result = Papa.parse(csvContent, { 
    header: true,
    skipEmptyLines: true 
  });
  
  if (!result.data.length) return 'No data available';

  const headers = result.meta.fields || [];
  const { filteredData, filteredHeaders } = filterEmptyColumns(
    result.data as Record<string, string>[],
    headers
  );

  const maxPreviewRows = Math.min(15, result.data.length);
  const previewLines = [
    `Headers: ${filteredHeaders.slice(0, 3).join(' | ')}${filteredHeaders.length > 3 ? ' | ...' : ''}`,
    ...filteredData.slice(0, maxPreviewRows).map((row, index) => {
      const values = filteredHeaders.map(header => row[header] || '');
      return `Row ${index + 1}: ${values.slice(0, 3).join(' | ')}${values.length > 3 ? ' | ...' : ''}`;
    })
  ];

  return previewLines.join('\n') + 
    (filteredData.length > maxPreviewRows ? 
      `\n... and ${filteredData.length - maxPreviewRows} more rows` : '');
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