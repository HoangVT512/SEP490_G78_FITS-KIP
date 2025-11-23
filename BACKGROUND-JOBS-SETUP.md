# Hướng dẫn Setup Background Jobs cho FITSKIP

## 📋 Tổng quan
FITSKIP cần chạy 3 background jobs mỗi ngày để:
1. **Tự động tạo WorkOrder** khi đến ReminderDaysBefore trước NextDueDate
2. **Cập nhật trạng thái quá hạn** cho các WorkOrder
3. **Gửi notification** nhắc nhở QLKT

## 🔧 Setup Windows Task Scheduler

### Bước 1: Lấy Admin Token
1. Đăng nhập vào hệ thống với tài khoản **Quản trị viên**
2. Mở DevTools (F12) → Application → Local Storage
3. Copy giá trị của key `token`
4. Mở file `run-background-jobs.ps1`
5. Thay `YOUR_ADMIN_TOKEN_HERE` bằng token vừa copy

### Bước 2: Test Script
```powershell
cd C:\Users\ADMIN\Downloads\SEP490_G78_FITS-KIP
.\run-background-jobs.ps1
```

Nếu thấy ✅ → Thành công!

### Bước 3: Tạo Task Scheduler
1. Mở **Task Scheduler** (Windows + R → `taskschd.msc`)
2. **Create Task** (không dùng Basic Task)
3. **General Tab:**
   - Name: `FITSKIP Background Jobs`
   - Description: `Tự động tạo WorkOrder và gửi notification mỗi ngày`
   - Security: ✅ Run whether user is logged on or not
   - Configure for: Windows 10

4. **Triggers Tab:**
   - New → Daily
   - Start: 00:00:00
   - Recur every: 1 days

5. **Actions Tab:**
   - New → Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\Users\ADMIN\Downloads\SEP490_G78_FITS-KIP\run-background-jobs.ps1"`

6. **Conditions Tab:**
   - ❌ Bỏ tick "Start the task only if the computer is on AC power"

7. **Settings Tab:**
   - ✅ Allow task to be run on demand
   - ✅ Run task as soon as possible after a scheduled start is missed

8. Click **OK** → Nhập password Windows

### Bước 4: Test Task
- Right click task → **Run**
- Check logs trong History tab

## 🔍 Chi tiết luồng hoạt động

### 1. CreateAutoWorkOrdersAsync
**Khi chạy:** Mỗi ngày lúc 00:00

**Logic:**
```
Với mỗi Plan active:
  DaysUntilDue = NextDueDate - Today
  
  Nếu DaysUntilDue <= ReminderDaysBefore && DaysUntilDue >= 0:
    Kiểm tra có WorkOrder nào với DueDate = NextDueDate chưa
    
    Nếu chưa có:
      - Tạo WorkOrder mới
      - Status = "Chờ xử lý"
      - ScheduledDate = NextDueDate
      - DueDate = NextDueDate
      - Copy checklist từ Template
      - Gửi notification cho QLKT
```

**Ví dụ:**
- Plan: NextDueDate = 30/11, ReminderDaysBefore = 15
- Ngày 15/11: DaysUntilDue = 15 → TẠO WorkOrder
- Ngày 16/11: DaysUntilDue = 14 → Đã có rồi, skip
- Ngày 30/11: DaysUntilDue = 0 → Đã có rồi, skip
- Ngày 01/12: DaysUntilDue = -1 → Không tạo (quá hạn)

### 2. UpdateOverdueStatusAsync
**Khi chạy:** Mỗi ngày lúc 00:00

**Logic:**
```
Với mỗi WorkOrder:
  EffectiveDueDate = PostponedDueDate ?? DueDate
  
  Nếu EffectiveDueDate < Today && Status không phải (Hoàn thành, Đã đóng, Đã hủy):
    Chuyển Status = "Quá hạn"
```

### 3. SendMaintenanceRemindersAsync
**Khi chạy:** Mỗi ngày lúc 00:00

**Logic:**
```
Với mỗi Plan active:
  DaysUntilDue = NextDueDate - Today
  
  Nếu DaysUntilDue <= ReminderDaysBefore && DaysUntilDue > 0:
    Gửi notification cho tất cả TechManager:
    "Thiết bị X cần bảo trì vào dd/MM/yyyy (còn Y ngày)"
```

## 📊 Kiểm tra kết quả

### Query kiểm tra Plans cần tạo WorkOrder:
```sql
SELECT 
    PlanID,
    EquipmentID,
    NextDueDate,
    ReminderDaysBefore,
    DATEDIFF(day, GETDATE(), NextDueDate) as DaysUntilDue,
    CASE 
        WHEN DATEDIFF(day, GETDATE(), NextDueDate) <= ReminderDaysBefore 
             AND DATEDIFF(day, GETDATE(), NextDueDate) >= 0
        THEN 'Cần tạo WorkOrder'
        ELSE 'Chưa đến'
    END as Status
FROM MaintenancePlans 
WHERE IsActive = 1
ORDER BY NextDueDate
```

### Query kiểm tra WorkOrders đã tạo:
```sql
SELECT 
    w.WorkOrderCode,
    w.PlanID,
    w.Status,
    w.ScheduledDate,
    w.DueDate,
    w.CreatedDate
FROM MaintenanceWorkOrders w
WHERE w.CreatedDate >= CAST(GETDATE() AS DATE)
ORDER BY w.CreatedDate DESC
```

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
- Token đã hết hạn → Lấy token mới
- Token không phải admin → Đăng nhập với tài khoản admin

### Lỗi 404 Not Found
- API chưa chạy → Start API: `cd FITSKIP.API; dotnet run`
- URL sai → Kiểm tra port (7003 hoặc 5201)

### WorkOrder không tự động tạo
- Kiểm tra điều kiện: DaysUntilDue <= ReminderDaysBefore
- Kiểm tra đã có WorkOrder với DueDate = NextDueDate chưa
- Check logs trong Task Scheduler History

## 📝 Logs
- Task Scheduler History: Xem kết quả mỗi lần chạy
- API Console: Xem thông tin chi tiết tạo WorkOrder
- Database: Query WorkOrders table để kiểm tra

## 🔄 Workflow hoàn chỉnh

```
00:00 - Task Scheduler chạy
  |
  ├─> CreateAutoWorkOrdersAsync
  |     └─> Tạo WorkOrder cho Plans đến ReminderDaysBefore
  |          └─> Gửi notification cho QLKT
  |
  ├─> UpdateOverdueStatusAsync  
  |     └─> Đánh dấu quá hạn cho WorkOrders
  |
  └─> SendMaintenanceRemindersAsync
        └─> Gửi notification nhắc nhở

QLKT login vào hệ thống
  └─> Thấy WorkOrder mới trong "Lịch bảo trì & Công việc"
      └─> Giao việc cho KTV (Cơ khí, Điện)
          └─> KTV nhận notification
              └─> Làm việc và tick checklist
```
