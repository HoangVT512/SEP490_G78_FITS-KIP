using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class ProductionOutputServiceManualTest
{
    private readonly Mock<IProductionOutputRepository> _mockRepository;
    private readonly Mock<ILineRepository> _mockLineRepository;
    private readonly Mock<IShiftRepository> _mockShiftRepository;
    private readonly Mock<IIncidentRepository> _mockIncidentRepository;
    private readonly Mock<INotificationService> _mockNotificationService;
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
        _mockNotificationService = new Mock<INotificationService>();
        
        _service = new ProductionOutputService(
            _mockRepository.Object,
            _mockLineRepository.Object,
            _mockShiftRepository.Object,
            _mockIncidentRepository.Object,
            _mockNotificationService.Object);
        
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

            try
            {
                switch (choice)
                {
                    case "1":
                        var result1 = await TestGetProductionOutputsAsync();
                        Console.WriteLine($"Found {result1.Count} production outputs");
                        foreach (var output in result1)
                        {
                            Console.WriteLine(FormatProductionOutput(output));
                        }
                        break;
                    case "2":
                        Console.Write("[INPUT] Enter Output ID: ");
                        int.TryParse(Console.ReadLine(), out int id);
                        var result2 = await TestGetProductionOutputByIdAsync(id);
                        if (result2 != null)
                            Console.WriteLine(FormatProductionOutput(result2));
                        else
                            Console.WriteLine("No production output found");
                        break;
                    case "3":
                        var request3 = new CreateProductionOutputRequest
                        {
                            LineId = GetIntInput("Line ID"),
                            Date = GetDateInput("Date"),
                            ShiftId = GetIntInput("Shift ID"),
                            SlotTime = GetStringInput("Slot Time", "7h-8h"),
                            TargetAmount = GetNullableIntInput("Target Amount"),
                            ResultAmount = GetNullableIntInput("Result Amount")
                        };
                        var result3 = await TestCreateProductionOutputAsync(request3);
                        if (result3 != null)
                            Console.WriteLine(FormatProductionOutput(result3));
                        break;
                    case "4":
                        var id4 = GetIntInput("Output ID to update");
                        var request4 = new UpdateProductionOutputRequest
                        {
                            TargetAmount = GetNullableIntInput("Target Amount"),
                            ResultAmount = GetNullableIntInput("Result Amount")
                        };
                        var result4 = await TestUpdateProductionOutputAsync(id4, request4);
                        if (result4 != null)
                            Console.WriteLine(FormatProductionOutput(result4));
                        break;
                    case "5":
                        var id5 = GetIntInput("Output ID to delete");
                        var result5 = await TestDeleteProductionOutputAsync(id5);
                        Console.WriteLine($"Delete result: {result5}");
                        break;
                    case "6":
                        var lineId6 = GetIntInput("Line ID");
                        var result6 = await TestGetProductionOutputsByLineAsync(lineId6);
                        Console.WriteLine($"Found {result6.Count} production outputs");
                        foreach (var output in result6)
                        {
                            Console.WriteLine(FormatProductionOutput(output));
                        }
                        break;
                    case "7":
                        var startDate7 = GetDateInput("Start Date");
                        var endDate7 = GetDateInput("End Date");
                        var result7 = await TestGetProductionOutputsByDateRangeAsync(startDate7, endDate7);
                        Console.WriteLine($"Found {result7.Count} production outputs");
                        foreach (var output in result7)
                        {
                            Console.WriteLine(FormatProductionOutput(output));
                        }
                        break;
                    case "8":
                        var lineId8 = GetIntInput("Line ID");
                        var date8 = GetDateInput("Date");
                        var result8 = await TestGetProductionOutputsByLineAndDateAsync(lineId8, date8);
                        Console.WriteLine($"Found {result8.Count} production outputs");
                        foreach (var output in result8)
                        {
                            Console.WriteLine(FormatProductionOutput(output));
                        }
                        break;
                    case "9":
                        var request9 = new ProductionOutputSlotTimeRequest
                        {
                            LineId = GetIntInput("Line ID"),
                            Date = GetDateInput("Date"),
                            ShiftId = GetIntInput("Shift ID")
                        };
                        var result9 = await TestGetAvailableSlotTimesAsync(request9);
                        Console.WriteLine($"Found {result9.Count} available slot times");
                        foreach (var slot in result9)
                        {
                            Console.WriteLine($"Slot: {slot.SlotTime}, LoadingTime: {slot.LoadingTime} mins, Available: {slot.IsAvailable}");
                        }
                        break;
                    case "10":
                        var lineId10 = GetIntInput("Line ID");
                        var date10 = GetDateInput("Date");
                        var shiftId10 = GetIntInput("Shift ID");
                        var slotTime10 = GetStringInput("Slot Time", "7h-8h");
                        var result10 = await TestCalculateLoadingTimeAsync(lineId10, date10, shiftId10, slotTime10);
                        Console.WriteLine($"Loading time: {result10} minutes");
                        break;
                    case "11":
                        var lineId11 = GetIntInput("Line ID");
                        var date11 = GetDateInput("Date");
                        var shiftId11 = GetIntInput("Shift ID");
                        var slotTime11 = GetStringInput("Slot Time", "7h-8h");
                        var targetAmount11 = GetNullableIntInput("Target Amount");
                        var resultAmount11 = GetNullableIntInput("Result Amount");
                        var runTime11 = GetIntInput("Run Time", 60);
                        var result11 = await TestCalculateOEEAsync(lineId11, date11, shiftId11, slotTime11, targetAmount11, resultAmount11, runTime11);
                        Console.WriteLine($"OEE: {result11:F4} ({result11 * 100:F2}%)");
                        break;
                    case "12":
                        var lineId12 = GetIntInput("Line ID");
                        var date12 = GetDateInput("Date");
                        var shiftId12 = GetIntInput("Shift ID");
                        var result12 = await TestCalculateOEEForShiftAsync(lineId12, date12, shiftId12);
                        Console.WriteLine($"OEE: {result12.OEE:F4} ({result12.OEEPercentage}%)");
                        break;
                    case "13":
                        var lineId13 = GetIntInput("Line ID");
                        var date13 = GetDateInput("Date");
                        var result13 = await TestCalculateOEEForDayAsync(lineId13, date13);
                        Console.WriteLine($"OEE: {result13.OEE:F4} ({result13.OEEPercentage}%)");
                        break;
                    case "0":
                        Console.WriteLine("Goodbye!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice. Please try again.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
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

    private async Task<IReadOnlyList<ProductionOutputDTO>> TestGetProductionOutputsAsync()
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetProductionOutputsAsync();

        // Verify repository call
        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<ProductionOutputDTO?> TestGetProductionOutputByIdAsync(int id)
    {
        var output = _testData.FirstOrDefault(o => o.OutputId == id);

        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(output);

        var result = await _service.GetProductionOutputByIdAsync(id);

        return result;
    }

    private async Task<ProductionOutputDTO?> TestCreateProductionOutputAsync(CreateProductionOutputRequest request)
    {
        // Setup mock - Check line exists
        var line = _testLines.FirstOrDefault(l => l.LineId == request.LineId);
        if (line == null) return null;

        _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        // Setup mock - Check shift exists
        var shift = _testShifts.FirstOrDefault(s => s.ShiftId == request.ShiftId);
        if (shift == null) return null;

        _mockShiftRepository.Setup(x => x.GetByIdAsync(request.ShiftId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(shift);

        // Setup mock - Check if slot exists
        _mockRepository.Setup(x => x.ExistsAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Setup mock - Get incidents for calculating loading time
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(request.LineId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
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
            var result = await _service.CreateProductionOutputAsync(request);
            Console.WriteLine("[SUCCESS] Production output created successfully");
            return result;
        }
        catch (ProductionOutputValidationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message} (Code: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return null;
        }
    }

    private async Task<ProductionOutputDTO?> TestUpdateProductionOutputAsync(int id, UpdateProductionOutputRequest request)
    {
        var existingOutput = _testData.FirstOrDefault(o => o.OutputId == id);
        if (existingOutput == null) return null;

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
            LineId = existingOutput.LineId,
            Date = existingOutput.Date,
            ShiftId = existingOutput.ShiftId,
            SlotTime = existingOutput.SlotTime,
            TargetAmount = request.TargetAmount,
            ResultAmount = request.ResultAmount,
            LoadingTime = existingOutput.LoadingTime,
            OEE = request.ResultAmount.HasValue && request.TargetAmount.HasValue && request.TargetAmount.Value > 0 && request.ResultAmount.Value > 0
                ? (decimal)(request.ResultAmount.Value) / request.TargetAmount.Value
                : null,
            CreatedAt = existingOutput.CreatedAt,
            UpdatedAt = DateTime.UtcNow,
            Line = existingOutput.Line,
            Shift = existingOutput.Shift
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ProductionOutput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedOutput);

        try
        {
            var result = await _service.UpdateProductionOutputAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Production output updated successfully");
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned null");
            }
            return result;
        }
        catch (ProductionOutputValidationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message} (Code: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return null;
        }
    }

    private async Task<bool> TestDeleteProductionOutputAsync(int id)
    {
        var existingOutput = _testData.FirstOrDefault(o => o.OutputId == id);
        if (existingOutput == null) return false;

        // Setup mock for output retrieval
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingOutput);

        // Setup mock for deletion
        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            var result = await _service.DeleteProductionOutputAsync(id);

            if (result)
            {
                Console.WriteLine("[SUCCESS] Production output deleted successfully");
            }
            else
            {
                Console.WriteLine("[FAILED] Failed to delete production output");
            }
            return result;
        }
        catch (ProductionOutputValidationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message} (Code: {ex.ErrorCode})");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return false;
        }
    }

    private async Task<IReadOnlyList<ProductionOutputDTO>> TestGetProductionOutputsByLineAsync(int lineId)
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.LineId == lineId).ToList());

        var result = await _service.GetProductionOutputsByLineAsync(lineId);
        return result;
    }

    private async Task<IReadOnlyList<ProductionOutputDTO>> TestGetProductionOutputsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.Date >= startDate && o.Date <= endDate).ToList());

        var result = await _service.GetProductionOutputsByDateRangeAsync(startDate, endDate);
        return result;
    }

    private async Task<IReadOnlyList<ProductionOutputDTO>> TestGetProductionOutputsByLineAndDateAsync(int lineId, DateTime date)
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetByLineAndDateAsync(lineId, date, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.Where(o => o.LineId == lineId && o.Date.Date == date.Date).ToList());

        var result = await _service.GetProductionOutputsByLineAndDateAsync(lineId, date);
        return result;
    }

    private async Task<IReadOnlyList<SlotTimeResponse>> TestGetAvailableSlotTimesAsync(ProductionOutputSlotTimeRequest request)
    {
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

        var result = await _service.GetAvailableSlotTimesAsync(request);
        return result;
    }

    private async Task<int> TestCalculateLoadingTimeAsync(int lineId, DateTime date, int shiftId, string slotTime)
    {
        // Setup mock - Get incidents
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(),
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        var result = await _service.CalculateLoadingTimeAsync(lineId, date, shiftId, slotTime);
        return result;
    }

    private async Task<decimal> TestCalculateOEEAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, int runTime)
    {
        // Setup mock - Get incidents
        _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(
                It.IsAny<int>(),
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<IncidentHistory>());

        var result = await _service.CalculateOEEAsync(lineId, date, shiftId, slotTime, targetAmount, resultAmount, runTime);
        return result;
    }

    private async Task<OEEResult> TestCalculateOEEForShiftAsync(int lineId, DateTime date, int shiftId)
    {
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

        var result = await _service.CalculateOEEForShiftAsync(lineId, date, shiftId);
        return result;
    }

    private async Task<OEEResult> TestCalculateOEEForDayAsync(int lineId, DateTime date)
    {
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

        var result = await _service.CalculateOEEForDayAsync(lineId, date);
        return result;
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

    private int GetIntInput(string prompt, int defaultValue = 0)
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return int.TryParse(input, out int result) ? result : defaultValue;
    }

    private DateTime GetDateInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (yyyy-MM-dd): ");
        var input = Console.ReadLine();
        return DateTime.TryParse(input, out DateTime result) ? result : DateTime.Now;
    }

    private string GetStringInput(string prompt, string defaultValue = "")
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
    }

    private int? GetNullableIntInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (or press Enter for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input)) return null;
        return int.TryParse(input, out int result) ? result : null;
    }
}

