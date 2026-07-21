import { describe, it, expect } from 'vitest';
import { parseFileBuffer } from '../../../src/modules/invoice/csv-parser.service.js';
import * as XLSX from 'xlsx';

describe('csv-parser.service', () => {
  describe('parseFileBuffer - CSV', () => {
    it('should parse valid CSV data successfully', () => {
      const csvData = `invoice_no,client_name,invoice_amount,due_date,contact_email,followup_count,payment_status\nINV-001,Client A,150.50,2026-06-30,clienta@example.com,2,Pending`;
      const buffer = Buffer.from(csvData, 'utf-8');
      
      const result = parseFileBuffer(buffer, 'test.csv');
      
      expect(result.errors).toHaveLength(0);
      expect(result.valid).toHaveLength(1);
      expect(result.valid[0]).toEqual({
        invoiceNo: 'INV-001',
        clientName: 'Client A',
        invoiceAmount: '150.50',
        dueDate: '2026-06-30',
        contactEmail: 'clienta@example.com',
        followupCount: 2,
        paymentStatus: 'Pending',
        lastFollowupDate: undefined
      });
    });

    it('should capture errors for invalid rows', () => {
      const csvData = `invoice_no,client_name,invoice_amount,due_date,contact_email\n,Client A,-50.00,invalid-date,bad-email`;
      const buffer = Buffer.from(csvData, 'utf-8');
      
      const result = parseFileBuffer(buffer, 'test.csv');
      
      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors).toContain('invoice_no: invoice_no is required');
      expect(result.errors[0].errors).toContain('invoice_amount: Invalid amount');
      expect(result.errors[0].errors).toContain('due_date: Invalid date format');
      expect(result.errors[0].errors).toContain('contact_email: Invalid email format');
    });
  });

  describe('parseFileBuffer - Excel', () => {
    it('should parse valid Excel sheets successfully', () => {
      const headers = ['Invoice No', 'Client Name', 'Invoice Amount', 'Due Date', 'Contact Email', 'Followup Count', 'Payment Status'];
      const dataRows = [
        ['INV-EX-001', 'Excel Client', 2500.75, 46200, 'excel@example.com', 1, 'Paid'] // 46200 is serial date serial
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseFileBuffer(buffer, 'test.xlsx');
      
      expect(result.errors).toHaveLength(0);
      expect(result.valid).toHaveLength(1);
      expect(result.valid[0].invoiceNo).toBe('INV-EX-001');
      expect(result.valid[0].clientName).toBe('Excel Client');
      expect(result.valid[0].invoiceAmount).toBe('2500.75');
      expect(new Date(result.valid[0].dueDate).getFullYear()).toBe(2026);
      expect(result.valid[0].contactEmail).toBe('excel@example.com');
      expect(result.valid[0].followupCount).toBe(1);
      expect(result.valid[0].paymentStatus).toBe('Paid');
    });

    it('should handle invalid cells and parse errors in Excel rows', () => {
      const headers = ['invoice_no', 'client_name', 'invoice_amount', 'due_date', 'contact_email'];
      const dataRows = [
        ['', 'Excel Client', -100, 'not-a-date', 'not-an-email']
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const result = parseFileBuffer(buffer, 'test.xlsx');
      
      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(2);
    });
  });
});
