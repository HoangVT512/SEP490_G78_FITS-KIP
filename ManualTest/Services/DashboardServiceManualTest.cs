/*using FITSKIP.Application.Services;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class DashboardServiceManualTest
{
    private readonly Mock<IDashboardRepository> _mockRepository;
    private readonly Mock<ILogger<DashboardService>> _mockLogger;
    private readonly DashboardService _service;
    private readonly List<ProductionOutput> _testProductionOutputs;
    private readonly List<IncidentHistory> _testIncidentHistories;
    private readonly List<StopType> _testStopTypes;

    public DashboardServiceManualTest()
    {
        _mockRepository = new Mock<IDashboardRepository>();
        _mockLogger = new Mock<ILogger<DashboardService>>();
        _testStopTypes = InitializeStopTypeTestData();
        _testProductionOutputs = InitializeProductionOutputTestData();
        _testIncidentHistories = InitializeIncidentHistoryTestData();
        
        SetupMockRepository();
        _service = new DashboardService(_mockRepository.Object, _mockLogger.Object);
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
                    await TestGetDowntimeStatsAsync();
                    break;
                case "2":
                    await TestGetDailyDowntimeStatsAsync();
                    break;
                case "3":
                    await TestGetDetailedOEEDailyStatsAsync();
                    break;
                case "4":
                    await TestGetDetailedOEESlotStatsAsync();
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
        Console.WriteLine("DASHBOARD SERVICE TEST MENU");
        Console.WriteLine("===========================");
        Console.WriteLine("1. Test GetDowntimeStatsAsync (Monthly Downtime Stats)");
        Console.WriteLine("2. Test GetDailyDowntimeStatsAsync (Daily Downtime Stats)");
        Console.WriteLine("3. Test GetDetailedOEEDailyStatsAsync (OEE Per Day)");
        Console.WriteLine("4. Test GetDetailedOEESlotStatsAsync (OEE Per Slot)");
        Console.WriteLine();
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetDowntimeStatsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetDowntimeStatsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Month (1-12): ");
        int.TryParse(Console.ReadLine(), out int month);

        Console.Write("[INPUT] Enter Year (e.g., 2024): ");
        int.TryParse(Console.ReadLine(), out int year);

        Console.Write("[INPUT] Enter Line ID (leave empty for all lines): ");
        var lineIdInput = Console.ReadLine();
        int? lineId = string.IsNullOrWhiteSpace(lineIdInput) ? null : int.Parse(lineIdInput);

        Console.WriteLine($"\n[INPUT DATA] Month: {month}, Year: {year}, LineId: {lineId?.ToString() ?? "All"}");
        Console.WriteLine($"[INFO] Test data contains records from {DateTime.Now.Year}-{DateTime.Now.Month:D2}");

        try
        {
            Console.WriteLine("[STATUS] Executing GetDowntimeStatsAsync...");
            var result = await _service.GetDowntimeStatsAsync(month, year, lineId);

            Console.WriteLine("[SUCCESS] Downtime statistics retrieved:");
            Console.WriteLine(FormatDynamicObject(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[STACK TRACE] {ex.StackTrace}");
        }
    }

    private async Task TestGetDailyDowntimeStatsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetDailyDowntimeStatsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Month (1-12): ");
        int.TryParse(Console.ReadLine(), out int month);

        Console.Write("[INPUT] Enter Year (e.g., 2024): ");
        int.TryParse(Console.ReadLine(), out int year);

        Console.Write("[INPUT] Enter Line ID (leave empty for all lines): ");
        var lineIdInput = Console.ReadLine();
        int? lineId = string.IsNullOrWhiteSpace(lineIdInput) ? null : int.Parse(lineIdInput);

        Console.Write("[INPUT] Enter specific date (dd/MM/yyyy, leave empty for full month): ");
        var date = Console.ReadLine();

        Console.WriteLine($"\n[INPUT DATA] Month: {month}, Year: {year}, LineId: {lineId?.ToString() ?? "All"}, Date: {date ?? "Full Month"}");
        Console.WriteLine($"[INFO] Test data contains records from {DateTime.Now.Year}-{DateTime.Now.Month:D2}");

        try
        {
            Console.WriteLine("[STATUS] Executing GetDailyDowntimeStatsAsync...");
            var result = await _service.GetDailyDowntimeStatsAsync(month, year, lineId, date);

            Console.WriteLine("[SUCCESS] Daily downtime statistics retrieved:");
            Console.WriteLine(FormatDynamicObject(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[STACK TRACE] {ex.StackTrace}");
        }
    }

    private async Task TestGetDetailedOEEDailyStatsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetDetailedOEEDailyStatsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);

        Console.WriteLine($"\n[INPUT DATA] LineId: {lineId}, Date: {date:yyyy-MM-dd}");
        Console.WriteLine($"[INFO] Test data contains Line ID 1 with date {DateTime.Now:yyyy-MM-dd}");

        try
        {
            Console.WriteLine("[STATUS] Executing GetDetailedOEEDailyStatsAsync...");
            var result = await _service.GetDetailedOEEDailyStatsAsync(lineId, date);

            Console.WriteLine("[SUCCESS] Detailed OEE daily statistics retrieved:");
            Console.WriteLine(FormatDynamicObject(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[STACK TRACE] {ex.StackTrace}");
        }
    }

    private async Task TestGetDetailedOEESlotStatsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetDetailedOEESlotStatsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Date (yyyy-MM-dd): ");
        DateTime.TryParse(Console.ReadLine(), out DateTime date);

        Console.Write("[INPUT] Enter Shift ID: ");
        int.TryParse(Console.ReadLine(), out int shiftId);

        Console.Write("[INPUT] Enter Slot Time (e.g., 07:00-09:00): ");
        var slotTime = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(slotTime))
        {
            Console.WriteLine("[ERROR] Slot Time is required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] LineId: {lineId}, Date: {date:yyyy-MM-dd}, ShiftId: {shiftId}, SlotTime: {slotTime}");
        Console.WriteLine($"[INFO] Test data contains Line 1, Shift 1, Slot '07:00-09:00' for today");

        try
        {
            Console.WriteLine("[STATUS] Executing GetDetailedOEESlotStatsAsync...");
            var result = await _service.GetDetailedOEESlotStatsAsync(lineId, date, shiftId, slotTime);

            Console.WriteLine("[SUCCESS] Detailed OEE slot statistics retrieved:");
            Console.WriteLine(FormatDynamicObject(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[STACK TRACE] {ex.StackTrace}");
        }
    }

    private void SetupMockRepository()
    {
        // Setup DbSet mocks
        var mockProductionOutputs = CreateMockDbSet(_testProductionOutputs);
        var mockIncidentHistories = CreateMockDbSet(_testIncidentHistories);
        var mockStopTypes = CreateMockDbSet(_testStopTypes);

        _mockRepository.Setup(r => r.ProductionOutputs).Returns(mockProductionOutputs.Object);
        _mockRepository.Setup(r => r.IncidentHistories).Returns(mockIncidentHistories.Object);
        _mockRepository.Setup(r => r.StopTypes).Returns(mockStopTypes.Object);
    }

    private Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());

        return mockSet;
    }

    private List<StopType> InitializeStopTypeTestData()
    {
        return new List<StopType>
        {
            new StopType { TypeId = 1, TypeName = "Dừng Ngắn" },
            new StopType { TypeId = 2, TypeName = "Dừng Dài" },
            new StopType { TypeId = 3, TypeName = "Phế Phẩm" },
            new StopType { TypeId = 4, TypeName = "Vệ Sinh Đầu/Cuối Ca" },
            new StopType { TypeId = 5, TypeName = "Đổi Mã" }
        };
    }

    private List<ProductionOutput> InitializeProductionOutputTestData()
    {
        var today = DateTime.Now.Date;
        return new List<ProductionOutput>
        {
            new ProductionOutput
            {
                OutputId = 1,
                LineId = 1,
                Date = today,
                ShiftId = 1,
                SlotTime = "07:00-09:00",
                LoadingTime = 120,
                TargetAmount = 1000,
                ResultAmount = 950,
                Line = new Line { LineId = 1, LineName = "Line A1" }
            },
            new ProductionOutput
            {
                OutputId = 2,
                LineId = 1,
                Date = today,
                ShiftId = 1,
                SlotTime = "09:00-11:00",
                LoadingTime = 120,
                TargetAmount = 1000,
                ResultAmount = 980,
                Line = new Line { LineId = 1, LineName = "Line A1" }
            },
            new ProductionOutput
            {
                OutputId = 3,
                LineId = 2,
                Date = today,
                ShiftId = 1,
                SlotTime = "07:00-09:00",
                LoadingTime = 120,
                TargetAmount = 800,
                ResultAmount = 750,
                Line = new Line { LineId = 2, LineName = "Line B1" }
            },
            new ProductionOutput
            {
                OutputId = 4,
                LineId = 1,
                Date = today.AddDays(-1),
                ShiftId = 1,
                SlotTime = "07:00-09:00",
                LoadingTime = 120,
                TargetAmount = 1000,
                ResultAmount = 920,
                Line = new Line { LineId = 1, LineName = "Line A1" }
            }
        };
    }

    private List<IncidentHistory> InitializeIncidentHistoryTestData()
    {
        var today = DateTime.Now.Date;
        return new List<IncidentHistory>
        {
            new IncidentHistory
            {
                HistoryId = 1,
                LineId = 1,
                StartTime = today.AddHours(7.5),
                EndTime = today.AddHours(7.75),
                Duration = 15,
                TypeId = 1 // Dừng Ngắn
            },
            new IncidentHistory
            {
                HistoryId = 2,
                LineId = 1,
                StartTime = today.AddHours(8),
                EndTime = today.AddHours(8.5),
                Duration = 30,
                TypeId = 2 // Dừng Dài
            },
            new IncidentHistory
            {
                HistoryId = 3,
                LineId = 1,
                StartTime = today.AddHours(9.5),
                EndTime = today.AddHours(9.5),
                Duration = 0,
                TypeId = 3 // Phế Phẩm (defect)
            },
            new IncidentHistory
            {
                HistoryId = 4,
                LineId = 1,
                StartTime = today.AddHours(9.5),
                EndTime = today.AddHours(9.5),
                Duration = 0,
                TypeId = 3 // Phế Phẩm (defect)
            },
            new IncidentHistory
            {
                HistoryId = 5,
                LineId = 2,
                StartTime = today.AddHours(7.25),
                EndTime = today.AddHours(7.5),
                Duration = 15,
                TypeId = 1 // Dừng Ngắn
            },
            new IncidentHistory
            {
                HistoryId = 6,
                LineId = 1,
                StartTime = today.AddDays(-1).AddHours(8),
                EndTime = today.AddDays(-1).AddHours(8.25),
                Duration = 15,
                TypeId = 1 // Dừng Ngắn
            }
        };
    }

    private string FormatDynamicObject(object obj, int indent = 0)
    {
        if (obj == null) return "[NULL]";

        var indentStr = new string(' ', indent * 2);
        var result = new System.Text.StringBuilder();

        var type = obj.GetType();
        if (type.IsPrimitive || type == typeof(string) || type == typeof(decimal) || type == typeof(double) || type == typeof(DateTime))
        {
            return obj.ToString() ?? "[NULL]";
        }

        if (obj is System.Collections.IEnumerable enumerable && !(obj is string))
        {
            result.AppendLine($"{indentStr}[");
            foreach (var item in enumerable)
            {
                result.AppendLine($"{indentStr}  {FormatDynamicObject(item, indent + 1)}");
            }
            result.Append($"{indentStr}]");
            return result.ToString();
        }

        result.AppendLine($"{indentStr}{{");
        foreach (var prop in type.GetProperties())
        {
            try
            {
                var value = prop.GetValue(obj);
                var formattedValue = FormatDynamicObject(value, indent + 1);
                result.AppendLine($"{indentStr}  {prop.Name}: {formattedValue}");
            }
            catch
            {
                result.AppendLine($"{indentStr}  {prop.Name}: [ERROR]");
            }
        }
        result.Append($"{indentStr}}}");

        return result.ToString();
    }
}

*/