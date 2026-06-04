-- V15: Harden assignments table schema
-- Context: V7 created the table; V12 already added status + timestamp columns.
-- This migration only modifies existing column definitions and adds a composite index.
-- MySQL 8.4 / Flyway 9.x compatible — no IF NOT EXISTS syntax used.

-- 1. Tighten status: make NOT NULL (V12 added it nullable)
ALTER TABLE assignments
    MODIFY COLUMN status
        ENUM('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED','REJECTED')
        NOT NULL DEFAULT 'PENDING';

-- 2. Fix assigned_by default: V7 set DEFAULT 'ADMIN'; auto-matching sets AssignedBy.AUTO
ALTER TABLE assignments
    MODIFY COLUMN assigned_by
        ENUM('ADMIN','AUTO')
        NOT NULL DEFAULT 'AUTO';

-- 3. Composite index for high-frequency writer+status query patterns
--    Covers: WriterAssignmentService.getAssignmentsByWriter() and cancelOtherPendingAssignments()
CREATE INDEX idx_assignments_writer_status ON assignments (writer_id, status);
