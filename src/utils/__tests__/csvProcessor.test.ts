import { describe, it, expect, beforeEach } from 'vitest';
import { processCSVFiles, previewCSV, previewMergedCSV } from '../csvProcessor';

describe('csvProcessor', () => {
  describe('processCSVFiles', () => {
    it('merges CSV files with different headers', async () => {
      const file1 = new File(['name,age\nJohn,30'], 'file1.csv', { type: 'text/csv' });
      const file2 = new File(['name,city\nJane,London'], 'file2.csv', { type: 'text/csv' });

      const result = await processCSVFiles([file1, file2]);

      const lines = result.split('\r');

      expect(lines[0].split(',').sort()).toEqual(['age', 'city', 'name'].sort());
      expect(lines).toHaveLength(3);
    });

    it('handles mixed delimiters in different files', async () => {
      const file1 = new File(['name,age\nJohn,30'], 'file1.csv', { type: 'text/csv' });
      const file2 = new File(['name;city\nJane;London'], 'file2.csv', { type: 'text/csv' });

      const result = await processCSVFiles([file1, file2]);
      expect(result).toContain('John');
      expect(result).toContain('London');
    });

    it('properly escapes special characters', async () => {
      const file = new File(['name,description\nJohn,"Contains,comma"'], 'test.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file]);
      const lines = result.split('\n');
      expect(lines[0]).toContain('description');
      expect(lines[1]).toContain('"Contains,comma"');
    });

    it('handles quoted fields with embedded delimiters', async () => {
      const file = new File(['name,address\n"Doe, John","123, Main St"'], 'test.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file]);

      // hightlight \n\r
      const lines = result.split('\r\n');
      expect(lines[0]).toBe('name,address');
      expect(lines[1]).toBe('"Doe, John","123, Main St"');
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

    it('ignores empty columns', async () => {
      const file = new File(['name,age,empty\nJohn,30,\nJane,25,'], 'test.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file]);
      const lines = result.split('\r\n');
      expect(lines[0].split(',').sort()).toEqual(['name', 'age'].sort());
      expect(lines[1]).not.toContain('empty');
    });

    it('ignores columns that are all empty', async () => {
      const file = new File(['name,empty1,age,empty2\nJohn,,30,\nJane,,25,'], 'test.csv', { type: 'text/csv' });
      const result = await processCSVFiles([file]);
      const lines = result.split('\r\n');
      expect(lines[0].split(',').sort()).toEqual(['name', 'age'].sort());
      expect(lines[1]).not.toContain('empty1');
      expect(lines[1]).not.toContain('empty2');
    });
  });

  describe('previewCSV', () => {
    it('generates preview for CSV file', async () => {
      const file = new File(['name,age,city\nJohn,30,London'], 'test.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);

      expect(preview).toContain('Headers: name | age | city');
      expect(preview).toContain('Row 1: John | 30 | London');
    });

    it('handles quoted fields in preview', async () => {
      const file = new File(['name,description\n"Doe, John","Contains, comma"'], 'test.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);
      expect(preview).toContain('Headers: name | description');
      expect(preview).toContain('Row 1: Doe, John | Contains, comma');
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

      expect(preview.split('\n')).toHaveLength(5); // Headers + 3 rows + "more rows" message
      expect(preview).toContain('more rows');
    });

    it('ignores empty columns in preview', async () => {
      const file = new File(['name,age,empty\nJohn,30,\nJane,25,'], 'test.csv', { type: 'text/csv' });
      const preview = await previewCSV(file);
      expect(preview).toContain('Headers: name | age');
      expect(preview).not.toContain('empty');
    });
  });

  describe('previewMergedCSV', () => {
    it('generates preview for merged CSV content', async () => {
      const content = 'name,age\nJohn,30\nJane,25';
      const preview = await previewMergedCSV(content);

      expect(preview).toContain('Headers: name | age');
      expect(preview).toContain('Row 1: John | 30');
    });

    it('handles quoted fields in merged preview', async () => {
      const content = 'name,description\n"Doe, John","Contains, comma"\n"Smith, Jane","Another, value"';
      const preview = await previewMergedCSV(content);
      expect(preview).toContain('Headers: name | description');
      expect(preview).toContain('Row 1: Doe, John | Contains, comma');
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
      expect(preview.split('\r').length).toBeLessThan(17); // 15 rows + headers + "more rows" message
    });

    it('ignores empty columns in merged preview', async () => {
      const content = 'name,age,empty\nJohn,30,\nJane,25,';
      const preview = await previewMergedCSV(content);
      expect(preview).toContain('Headers: name | age');
      expect(preview).not.toContain('empty');
    });
  });
});
