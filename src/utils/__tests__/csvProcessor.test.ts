import { describe, it, expect, beforeEach } from 'vitest';
import { processCSVFiles, previewCSV, previewMergedCSV } from '../csvProcessor';

describe('csvProcessor', () => {
  describe('processCSVFiles', () => {
    it('merges CSV files with different headers', async () => {
      const file1 = new File(['name,age\nJohn,30'], 'file1.csv', { type: 'text/csv' });
      const file2 = new File(['name,city\nJane,London'], 'file2.csv', { type: 'text/csv' });
      
      const result = await processCSVFiles([file1, file2]);
      const lines = result.split('\n');
      
      expect(lines[0].split(',').sort()).toEqual(['age', 'city', 'name'].sort());
      expect(lines).toHaveLength(3);
    });

    it('handles empty files', async () => {
      const file = new File([''], 'empty.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file]);
      expect(result).toBe('');
    });

    it('preserves data order from input files', async () => {
      const file1 = new File(['name,age\nJohn,30\nJane,25'], 'file1.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file1]);
      const lines = result.split('\n');
      expect(lines[1]).toContain('John');
      expect(lines[2]).toContain('Jane');
    });
  });

  describe('previewCSV', () => {
    it('generates preview for CSV file', async () => {
      const file = new File(['name,age,city\nJohn,30,London'], 'test.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);
      
      expect(preview).toContain('Headers: name | age | city');
      expect(preview).toContain('Row 1: John | 30 | London');
    });

    it('handles empty CSV file', async () => {
      const file = new File([''], 'empty.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);
      expect(preview).toBe('Empty CSV file');
    });

    it('truncates long files in preview', async () => {
      const content = ['header1,header2']
        .concat(Array(5).fill('data1,data2'))
        .join('\n');
      const file = new File([content], 'long.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);
      
      expect(preview.split('\n')).toHaveLength(4); // Headers + 3 rows
      expect(preview).toContain('more rows');
    });
  });

  describe('previewMergedCSV', () => {
    it('generates preview for merged CSV content', async () => {
      const content = 'name,age\nJohn,30\nJane,25';
      const preview = await previewMergedCSV(content);
      
      expect(preview).toContain('Headers: name | age');
      expect(preview).toContain('Row 1: John | 30');
    });

    it('handles empty content', async () => {
      const preview = await previewMergedCSV('');
      expect(preview).toBe('No data available');
    });

    it('truncates long content in preview', async () => {
      const content = ['header1,header2']
        .concat(Array(20).fill('data1,data2'))
        .join('\n');
      const preview = await previewMergedCSV(content);
      
      expect(preview).toContain('more rows');
      expect(preview.split('\n').length).toBeLessThan(17); // 15 rows + headers + "more rows" message
    });
  });
});