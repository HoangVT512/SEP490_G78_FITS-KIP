-- Migration: Convert MaintenanceWorkOrder Status from English to Vietnamese
-- Date: 2025-11-20
-- Description: Fix encoding issues and convert all statuses to Vietnamese

USE [SEP490_G78_FITSKIP];
GO

-- First, restore from backup if exists and fix corrupted data
IF OBJECT_ID('MaintenanceWorkOrders_Backup_20251120', 'U') IS NOT NULL
BEGIN
    -- Check if we have corrupted Vietnamese characters
    IF EXISTS (SELECT 1 FROM MaintenanceWorkOrders WHERE Status LIKE '%á»%' OR Status LIKE '%Ã%')
    BEGIN
        PRINT 'Detected corrupted encoding. Restoring from backup...';
        
        -- Restore from backup with IDENTITY_INSERT
        SET IDENTITY_INSERT MaintenanceWorkOrders ON;
        
        DELETE FROM MaintenanceWorkOrders;
        INSERT INTO MaintenanceWorkOrders 
            (WorkOrderID, WorkOrderCode, PlanID, EquipmentID, AssignedDate, 
             ScheduledDate, DueDate, AssignedToElectrical, AssignedToMechanical, 
             Status, StartedDate, CompletedDate, Notes, CreatedBy, CreatedDate, 
             UpdatedBy, UpdatedDate, PostponedDate, PostponedDueDate, PostponedReason)
        SELECT WorkOrderID, WorkOrderCode, PlanID, EquipmentID, AssignedDate, 
               ScheduledDate, DueDate, AssignedToElectrical, AssignedToMechanical, 
               Status, StartedDate, CompletedDate, Notes, CreatedBy, CreatedDate, 
               UpdatedBy, UpdatedDate, PostponedDate, PostponedDueDate, PostponedReason
        FROM MaintenanceWorkOrders_Backup_20251120;
        
        SET IDENTITY_INSERT MaintenanceWorkOrders OFF;
        
        PRINT 'Restored from backup successfully.';
    END
END
ELSE
BEGIN
    -- Create backup if not exists
    SELECT * INTO MaintenanceWorkOrders_Backup_20251120
    FROM MaintenanceWorkOrders;
    PRINT 'Backup created.';
END
GO

-- Update Status from English to Vietnamese with proper Unicode
UPDATE MaintenanceWorkOrders
SET Status = CASE Status
    WHEN 'Pending' THEN N'Chờ xử lý'
    WHEN 'InProgress' THEN N'Đang thực hiện'
    WHEN 'Completed' THEN N'Hoàn thành'
    WHEN 'Closed' THEN N'Đã đóng'
    WHEN 'Cancelled' THEN N'Đã hủy'
    WHEN 'Overdue' THEN N'Quá hạn'
    WHEN 'Assigned' THEN N'Chờ xử lý'
    ELSE Status
END
WHERE Status IN ('Pending', 'InProgress', 'Completed', 'Closed', 'Cancelled', 'Overdue', 'Assigned');
GO

-- Verify results
SELECT Status, COUNT(*) as Count
FROM MaintenanceWorkOrders
GROUP BY Status
ORDER BY Status;
GO

-- Nếu muốn rollback, chạy:
-- DELETE FROM MaintenanceWorkOrders;
-- INSERT INTO MaintenanceWorkOrders SELECT * FROM MaintenanceWorkOrders_Backup_20251120;
-- DROP TABLE MaintenanceWorkOrders_Backup_20251120;
