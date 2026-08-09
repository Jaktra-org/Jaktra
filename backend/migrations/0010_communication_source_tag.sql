-- Migration 0010: Add source column to communications table for outbound email tracking
ALTER TABLE communications ADD COLUMN source ENUM('bulk_ai_agent', 'invoice_manual', 'dispute_agent', 'system') NOT NULL DEFAULT 'system';
