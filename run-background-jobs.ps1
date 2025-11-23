# Script tự động chạy background jobs cho FITSKIP
# Chạy mỗi ngày lúc 00:00 bằng Windows Task Scheduler

$baseUrl = "https://localhost:7003/api/maintenance"
$adminToken = "YOUR_ADMIN_TOKEN_HERE"  # Thay token admin vào đây

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

Write-Host "=== FITSKIP Background Jobs ===" -ForegroundColor Cyan
Write-Host "Thời gian: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

try {
    # 1. Tự động tạo WorkOrder khi đến ReminderDaysBefore
    Write-Host "1. Đang tạo WorkOrder tự động..." -ForegroundColor Yellow
    $response1 = Invoke-RestMethod -Uri "$baseUrl/background/create-auto-workorders" `
        -Method POST -Headers $headers -SkipCertificateCheck
    Write-Host "   ✅ Thành công: $($response1.message)" -ForegroundColor Green
    Write-Host ""
    
    # 2. Cập nhật trạng thái quá hạn
    Write-Host "2. Đang cập nhật trạng thái quá hạn..." -ForegroundColor Yellow
    $response2 = Invoke-RestMethod -Uri "$baseUrl/background/update-overdue-status" `
        -Method POST -Headers $headers -SkipCertificateCheck
    Write-Host "   ✅ Thành công: $($response2.message)" -ForegroundColor Green
    Write-Host ""
    
    # 3. Gửi notification nhắc nhở
    Write-Host "3. Đang gửi thông báo nhắc nhở..." -ForegroundColor Yellow
    $response3 = Invoke-RestMethod -Uri "$baseUrl/background/send-maintenance-reminders" `
        -Method POST -Headers $headers -SkipCertificateCheck
    Write-Host "   ✅ Thành công: $($response3.message)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=== Hoàn thành tất cả background jobs ===" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Chi tiết: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
