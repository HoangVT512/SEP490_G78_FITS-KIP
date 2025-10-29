using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class ProductionOutputServiceManualTest
{
    private readonly Mock<IProductionOutputRepository> _mockRepository;
    private readonly Mock<ILineRepository> _mockLineRepository;
    private readonly Mock<IShiftRepository> _mockShiftRepository;
    private readonly Mock<IIncidentRepository> _mockIncidentRepository;
    private readonly ProductionOutputService _service;
    private readonly List<ProductionOutput> _testData;
    private readonly List<Line> _testLines;
    private readonly List<Shift> _testShifts;

    public ProductionOutputServiceManualTest()
    {
        _mockRepository = new Mock<IProductionOutputRepository>();
        _mockLineRepository = new Mock<ILineRepository>();
        _mockShiftRepository = new Mock<IShiftRepository>();
        _mockIncidentRepository = new Mock<IIncidentRepository>();
        
        _service = new ProductionOutputService(
            _mockRepository.Object,
            _mockLineRepository.Object,
            _mockShiftRepository.Object,
            _mockIncidentRepository.Object);
        
        _testData = InitializeTestData();
        _testLines = InitializeLineData();
        _testShifts = InitializeShiftData();
    }

    public async Task RunTests()
    {
        while (true)
        {
            ShowMenu();
            var choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    await TestGetProductionOutputsAsync();
                    break;
                case "2":
                    await TestGetProductionOutputByIdAsync();
                    break;
                case "3":
                    await TestCreateProductionOutputAsync();
                    break;
                case "4":
                    await TestUpdateProductionOutputAsync();
                    break;
                case "5":
                    await TestDeleteProductionOutputAsync();
                    break;
                case "6":
                    await TestGetProductionOutputsByLineAsync();
                    break;
                case "7":
                    await TestGetProductionOutputsByDateRangeAsync();
                    break;
                case "8":
                    await TestGetProductionOutputsByLineAndDateAsync();
                    break;
                case "9":
                    await TestGetAvailableSlotTimesAsync();
                    break;
                case "10":
                    await TestCalculateLoadingTimeAsync();
                    break;
                case "11":
                    await TestCalculateOEEAsync();
                    break;
                case "12":
                    await TestCalculateOEEForShiftAsync();
                    break;
                case "13":
                    await TestCalculateOEEForDayAsync();
                    break;
                case "0":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice. Please try again.");
                    break;
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("PRODUCTION OUTPUT SERVICE TEST MENU");
        Console.WriteLine("====================================");
        Console.WriteLine("1. Test GetProductionOutputsAsync");
        Console.WriteLine("2. Test GetProductionOutputByIdAsync");
        Console.WriteLine("3. Test CreateProductionOutputAsync");
        Console.WriteLine("4. Test UpdateProductionOutputAsync");
        Console.WriteLine("5. Test DeleteProductionOutputAsync");
        Console.WriteLine("6. Test GetProductionOutputsByLineAsync");
        Console.WriteLine("7. Test GetProductionOutputsByDateRangeAsync");
        Console.WriteLine("8. Test GetProductionOutputsByLineAndDateAsync");
        Console.WriteLine("9. Test GetAvailableSlotTimesAsync");
        Console.WriteLine("10. Test CalculateLoadingTimeAsync");
        Console.WriteLine("11. Test CalculateOEEAsync");
        Console.WriteLine("12. Test CalculateOEEForShiftAsync");
        Console.WriteLine("13. Test CalculateOEEForDayAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetProductionOutputsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetProductionOutputsAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        Console.WriteLine("[STATUS] Executing GetProductionOutputsAsync...");
        var result = await _service.GetProductionOutputsAsync();

        // Verify
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} production outputs");
        Console.WriteLine("\n[DATA] Production Output List:");
        Console.WriteLine("----------------------------------------");
        foreach (var output in result)
        {
            Console.WriteLine(FormatProductionOutput(output));
        }

        // Verify repository call
        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Console.WriteLine("[VERIFY] Repository method called exactly once");
    }

    private async Task TestGetProductionOutputByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetProductionOutputByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Output ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);
        
        var output = _testData.FirstOrDefault(o => o.OutputId == id);
        
        if (output == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }
        
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(output);

        Console.WriteLine($"[STATUS] Executing GetProductionOutputByIdAsync with ID: {id}...");
        
        try
        {
            var result = await _service.GetProductionOutputByIdAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Production output found:");
                Console.WriteLine(FormatProductionOutput(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No production output found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateProductionOutputAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateProductionOutputAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);
        
        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);
        
        Console.Write("[INPUT] Enter Slot Time (e.g., 7h-8h): ");
        var slotTime = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Target Amount (or press Enter for null): ");
        var targetInput = Console.ReadLine();
        int? targetAmount = null;
        if (!string.IsNullOrWhiteSpace(targetInput) && int.TryParse(targetInput, out int target))
        {
            targetAmount = target;
        }
        
        Console.Write("[INPUT] Enter Result Amount (or press Enter for null): ");
        var resultInput = Console.ReadLine();
        int? resultAmount = null;
        if (!string.IsNullOrWhiteSpace(resultInput) && int.TryParse(resultInput, out int r))
        {
            resultAmount = r;
        }

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateProductionOutputRequest
        {
            LineId = lineId,
            Date = date,
            ShiftId = shiftId,
            SlotTime = slotTime ?? "7h-8h",
            TargetAmount = targetAmount,
            ResultAmount = resultAmount
        };
        
        Console.WriteLine($"[INPUT DATA] LineId: {request.LineId}, Date: {request.Date:yyyy-MM-dd}, ShiftId: {request.ShiftId}, SlotTime: {request.SlotTime}, TargetAmount: {targetAmount}, ResultAmount: {resultAmount}");

        // Setup mock - Check line exists
        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        if (line == null)
        {
            Console.WriteLine($"[ERROR] Line with ID {lineId} not found in test data");
            return;
        }
        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        // Setup mock - Check shift exists
        var shift = _testShifts.FirstOrDefault(s => s.ShiftId == shiftId);
        if (shift == null)
        {
            Console.WriteLine($"[ERROR] Shift with ID {shiftId} not found in test data");
            return;
        }
        _mockShiftRepository.Setup(x => x.GetByIdAsync(shiftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shift);

        // Setup mock - Check if slot exists
        _mockRepository.Setup(x => x.ExistsAsync(lineId, date, shiftId, slotTime, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Setup mock - Get incidents for calculating loading time
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        var newOutput = new ProductionOutput
        {
            OutputId = _testData.Max(o => o.OutputId) + 1,
            LineId = request.LineId,
            Date = request.Date,
            ShiftId = request.ShiftId,
            SlotTime = request.SlotTime,
            TargetAmount = request.TargetAmount,
            ResultAmount = request.ResultAmount,
            LoadingTime = 60,
            OEE = request.ResultAmount.HasValue && request.TargetAmount.HasValue 
                ? (decimal)(request.ResultAmount.Value) / request.TargetAmount.Value 
                : 0,
            CreatedAt = DateTime.UtcNow,
            Line = line,
            Shift = shift
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ProductionOutput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newOutput);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateProductionOutputAsync...");
            var result = await _service.CreateProductionOutputAsync(request);
            
            Console.WriteLine("[SUCCESS] Production output created successfully:");
            Console.WriteLine(FormatProductionOutput(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateProductionOutputAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateProductionOutputAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Output ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingOutput = _testData.FirstOrDefault(o => o.OutputId == id);
        
        if (existingOutput == null)
        {
            Console.WriteLine($"[NOT FOUND] Output with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing production output:");
            Console.WriteLine(FormatProductionOutputEntity(existingOutput));
        }
        
        Console.Write("\n[INPUT] Enter new Target Amount (or press Enter to keep current): ");
        var targetInput = Console.ReadLine();
        int? targetAmount = existingOutput?.TargetAmount;
        if (!string.IsNullOrWhiteSpace(targetInput) && int.TryParse(targetInput, out int target))
        {
            targetAmount = target;
        }
        
        Console.Write("[INPUT] Enter new Result Amount (or press Enter to keep current): ");
        var resultInput = Console.ReadLine();
        int? resultAmount = existingOutput?.ResultAmount;
        if (!string.IsNullOrWhiteSpace(resultInput) && int.TryParse(resultInput, out int r))
        {
            resultAmount = r;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateProductionOutputRequest
        {
            TargetAmount = targetAmount,
            ResultAmount = resultAmount
        };
        
        Console.WriteLine($"[INPUT DATA] TargetAmount: {targetAmount}, ResultAmount: {resultAmount}");

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOutput);

        // Setup mock for OEE calculation
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        var updatedOutput = new ProductionOutput
        {
            OutputId = id,
            LineId = existingOutput?.LineId ?? 1,
            Date = existingOutput?.Date ?? DateTime.Now,
            ShiftId = existingOutput?.ShiftId ?? 1,
            SlotTime = existingOutput?.SlotTime ?? "7h-8h",
            TargetAmount = request.TargetAmount,
            ResultAmount = request.ResultAmount,
            LoadingTime = existingOutput?.LoadingTime ?? 60,
            OEE = resultAmount.HasValue && targetAmount.HasValue 
                ? (decimal)(resultAmount.Value) / targetAmount.Value 
                : 0,
            CreatedAt = existingOutput?.CreatedAt ?? DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Line = existingOutput?.Line,
            Shift = existingOutput?.Shift
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ProductionOutput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedOutput);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateProductionOutputAsync...");
            var result = await _service.UpdateProductionOutputAsync(id, request);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Production output updated successfully:");
                Console.WriteLine(FormatProductionOutput(result));
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteProductionOutputAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteProductionOutputAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Output ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingOutput = _testData.FirstOrDefault(o => o.OutputId == id);
        if (existingOutput != null)
        {
            Console.WriteLine($"[WARNING] Will delete production output with ID: {id}");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Production output with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete production output with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteProductionOutputAsync...");
            var result = await _service.DeleteProductionOutputAsync(id);
            
            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Production output deleted successfully" : "Failed to delete production output")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetProductionOutputsByLineAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetProductionOutputsByLineAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        // Setup mock
        _mockRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.LineId == lineId).ToList());

        Console.WriteLine($"[STATUS] Executing GetProductionOutputsByLineAsync with Line ID: {lineId}...");
        
        try
        {
            var result = await _service.GetProductionOutputsByLineAsync(lineId);
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} production outputs for line {lineId}");
            Console.WriteLine("\n[DATA] Production Output List:");
            Console.WriteLine("----------------------------------------");
            foreach (var output in result)
            {
                Console.WriteLine(FormatProductionOutput(output));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetProductionOutputsByDateRangeAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetProductionOutputsByDateRangeAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Start Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime startDate);
        
        Console.Write("[INPUT] Enter End Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime endDate);

        // Setup mock
        _mockRepository.Setup(x => x.GetByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.Date >= startDate && o.Date <= endDate).ToList());

        Console.WriteLine($"[STATUS] Executing GetProductionOutputsByDateRangeAsync from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}...");
        
        try
        {
            var result = await _service.GetProductionOutputsByDateRangeAsync(startDate, endDate);
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} production outputs in date range");
            Console.WriteLine("\n[DATA] Production Output List:");
            Console.WriteLine("----------------------------------------");
            foreach (var output in result)
            {
                Console.WriteLine(FormatProductionOutput(output));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetProductionOutputsByLineAndDateAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetProductionOutputsByLineAndDateAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);

        // Setup mock
        _mockRepository.Setup(x => x.GetByLineAndDateAsync(lineId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.LineId == lineId && o.Date.Date == date.Date).ToList());

        Console.WriteLine($"[STATUS] Executing GetProductionOutputsByLineAndDateAsync for Line {lineId} on {date:yyyy-MM-dd}...");
        
        try
        {
            var result = await _service.GetProductionOutputsByLineAndDateAsync(lineId, date);
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} production outputs for line {lineId} on {date:yyyy-MM-dd}");
            Console.WriteLine("\n[DATA] Production Output List:");
            Console.WriteLine("----------------------------------------");
            foreach (var output in result)
            {
                Console.WriteLine(FormatProductionOutput(output));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetAvailableSlotTimesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetAvailableSlotTimesAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);
        
        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);

        var request = new ProductionOutputSlotTimeRequest
        {
            LineId = lineId,
            Date = date,
            ShiftId = shiftId
        };

        // Setup mock - Get incidents for each slot
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        // Setup mock - Check if slot exists
        _mockRepository.Setup(x => x.ExistsAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Console.WriteLine($"[STATUS] Executing GetAvailableSlotTimesAsync for Line {lineId}, Date {date:yyyy-MM-dd}, Shift {shiftId}...");
        
        try
        {
            var result = await _service.GetAvailableSlotTimesAsync(request);
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} available slot times");
            Console.WriteLine("\n[DATA] Available Slot Times:");
            Console.WriteLine("----------------------------------------");
            foreach (var slot in result)
            {
                Console.WriteLine($"Slot: {slot.SlotTime}, LoadingTime: {slot.LoadingTime} mins, Available: {slot.IsAvailable}");
                if (!string.IsNullOrEmpty(slot.Reason))
                {
                    Console.WriteLine($"  Reason: {slot.Reason}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCalculateLoadingTimeAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CalculateLoadingTimeAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);
        
        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);
        
        Console.Write("[INPUT] Enter Slot Time (e.g., 7h-8h): ");
        var slotTime = Console.ReadLine() ?? "7h-8h";

        // Setup mock - Get incidents
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        Console.WriteLine($"[STATUS] Executing CalculateLoadingTimeAsync...");
        
        try
        {
            var result = await _service.CalculateLoadingTimeAsync(lineId, date, shiftId, slotTime);
            
            Console.WriteLine($"[SUCCESS] Loading time: {result} minutes");
            Console.WriteLine($"[INFO] This represents available production time in a 60-minute slot");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCalculateOEEAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CalculateOEEAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);
        
        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);
        
        Console.Write("[INPUT] Enter Slot Time (e.g., 7h-8h): ");
        var slotTime = Console.ReadLine() ?? "7h-8h";
        
        Console.Write("[INPUT] Enter Target Amount (or press Enter for null): ");
        var targetInput = Console.ReadLine();
        int? targetAmount = null;
        if (!string.IsNullOrWhiteSpace(targetInput) && int.TryParse(targetInput, out int target))
        {
            targetAmount = target;
        }
        
        Console.Write("[INPUT] Enter Result Amount (or press Enter for null): ");
        var resultInput = Console.ReadLine();
        int? resultAmount = null;
        if (!string.IsNullOrWhiteSpace(resultInput) && int.TryParse(resultInput, out int r))
        {
            resultAmount = r;
        }

        // Setup mock - Get incidents
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        Console.WriteLine($"[STATUS] Executing CalculateOEEAsync...");
        
        try
        {
            var result = await _service.CalculateOEEAsync(lineId, date, shiftId, slotTime, targetAmount, resultAmount);
            
            Console.WriteLine($"[SUCCESS] OEE: {result:F4} ({result * 100:F2}%)");
            Console.WriteLine($"[INFO] OEE = Availability × Performance × Quality");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCalculateOEEForShiftAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CalculateOEEForShiftAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);
        
        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);

        // Setup mock
        var shiftOutputs = _testData.Where(o => o.LineId == lineId && o.Date.Date == date.Date && o.ShiftId == shiftId).ToList();
        _mockRepository.Setup(x => x.GetByLineDateAndShiftAsync(lineId, date, shiftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shiftOutputs);

        // Setup mock for OEE calculation
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        Console.WriteLine($"[STATUS] Executing CalculateOEEForShiftAsync...");
        
        try
        {
            var result = await _service.CalculateOEEForShiftAsync(lineId, date, shiftId);
            
            Console.WriteLine($"[SUCCESS] OEE for shift:");
            Console.WriteLine($"  Type: {result.CalculationType}");
            Console.WriteLine($"  OEE: {result.OEE:F4}");
            Console.WriteLine($"  OEE Percentage: {result.OEEPercentage}%");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCalculateOEEForDayAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CalculateOEEForDayAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);
        
        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);

        // Setup mock
        var dayOutputs = _testData.Where(o => o.LineId == lineId && o.Date.Date == date.Date).ToList();
        _mockRepository.Setup(x => x.GetByLineAndDateAsync(lineId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dayOutputs);

        // Setup mock for OEE calculation
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>(), 
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        Console.WriteLine($"[STATUS] Executing CalculateOEEForDayAsync...");
        
        try
        {
            var result = await _service.CalculateOEEForDayAsync(lineId, date);
            
            Console.WriteLine($"[SUCCESS] OEE for day:");
            Console.WriteLine($"  Type: {result.CalculationType}");
            Console.WriteLine($"  OEE: {result.OEE:F4}");
            Console.WriteLine($"  OEE Percentage: {result.OEEPercentage}%");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<ProductionOutput> InitializeTestData()
    {
        var lines = InitializeLineData();
        var shifts = InitializeShiftData();
        
        return new List<ProductionOutput>
        {
            new ProductionOutput
            {
                OutputId = 1,
                LineId = 1,
                Date = new DateTime(2024, 10, 25),
                ShiftId = 1,
                SlotTime = "7h-8h",
                LoadingTime = 55,
                TargetAmount = 1000,
                ResultAmount = 950,
                OEE = 0.86m,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                Line = lines[0],
                Shift = shifts[0]
            },
            new ProductionOutput
            {
                OutputId = 2,
                LineId = 1,
                Date = new DateTime(2024, 10, 25),
                ShiftId = 1,
                SlotTime = "8h-9h",
                LoadingTime = 60,
                TargetAmount = 1000,
                ResultAmount = 1050,
                OEE = 0.98m,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                Line = lines[0],
                Shift = shifts[0]
            },
            new ProductionOutput
            {
                OutputId = 3,
                LineId = 2,
                Date = new DateTime(2024, 10, 25),
                ShiftId = 2,
                SlotTime = "14h-15h",
                LoadingTime = 45,
                TargetAmount = 800,
                ResultAmount = 720,
                OEE = 0.75m,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                Line = lines[1],
                Shift = shifts[1]
            },
            new ProductionOutput
            {
                OutputId = 4,
                LineId = 1,
                Date = new DateTime(2024, 10, 26),
                ShiftId = 1,
                SlotTime = "7h-8h",
                LoadingTime = 60,
                TargetAmount = 1000,
                ResultAmount = 980,
                OEE = 0.95m,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                Line = lines[0],
                Shift = shifts[0]
            }
        };
    }

    private List<Line> InitializeLineData()
    {
        return new List<Line>
        {
            new Line
            {
                LineId = 1,
                LineName = "Assembly Line A",
                LineCode = "LN001",
                DepartmentId = 1,
                IsActive = true
            },
            new Line
            {
                LineId = 2,
                LineName = "Packaging Line B",
                LineCode = "LN002",
                DepartmentId = 1,
                IsActive = true
            },
            new Line
            {
                LineId = 3,
                LineName = "Quality Control Line C",
                LineCode = "LN003",
                DepartmentId = 2,
                IsActive = true
            }
        };
    }

    private List<Shift> InitializeShiftData()
    {
        return new List<Shift>
        {
            new Shift
            {
                ShiftId = 1,
                ShiftName = "Ca Sáng",
                StartTime = new TimeOnly(7, 0),
                EndTime = new TimeOnly(15, 0)
            },
            new Shift
            {
                ShiftId = 2,
                ShiftName = "Ca Chiều",
                StartTime = new TimeOnly(15, 0),
                EndTime = new TimeOnly(23, 0)
            },
            new Shift
            {
                ShiftId = 3,
                ShiftName = "Ca Đêm",
                StartTime = new TimeOnly(23, 0),
                EndTime = new TimeOnly(7, 0)
            }
        };
    }

    private string FormatProductionOutput(ProductionOutputDTO output)
    {
        if (output == null) return "[NULL]";
        
        return $"{{Id:{output.OutputId}, Line:{output.LineId}({output.LineName}), Date:{output.Date:yyyy-MM-dd}, Shift:{output.ShiftId}({output.ShiftName}), Slot:{output.SlotTime}, Loading:{output.LoadingTime}min, Target:{output.TargetAmount}, Result:{output.ResultAmount}, OEE:{output.OEE?.ToString("F2") ?? "N/A"}}}";
    }

    private string FormatProductionOutputEntity(ProductionOutput output)
    {
        if (output == null) return "[NULL]";
        
        return $"{{Id:{output.OutputId}, Line:{output.LineId}({output.Line?.LineName ?? "N/A"}), Date:{output.Date:yyyy-MM-dd}, Shift:{output.ShiftId}({output.Shift?.ShiftName ?? "N/A"}), Slot:{output.SlotTime}, Loading:{output.LoadingTime}min, Target:{output.TargetAmount}, Result:{output.ResultAmount}, OEE:{output.OEE?.ToString("F2") ?? "N/A"}}}";
    }
}

