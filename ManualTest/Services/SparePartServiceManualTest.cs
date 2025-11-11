using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class SparePartServiceManualTest
{
    private readonly Mock<ISparePartRepository> _mockRepository;
    private readonly SparePartService _service;
    private readonly List<SparePart> _testSpareParts;

    public SparePartServiceManualTest()
    {
        _mockRepository = new Mock<ISparePartRepository>();
        _service = new SparePartService(_mockRepository.Object);
        _testSpareParts = InitializeSparePartTestData();
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
                    await TestGetAllSparePartsAsync();
                    break;
                case "2":
                    await TestGetSparePartByIdAsync();
                    break;
                case "3":
                    await TestCreateSparePartAsync();
                    break;
                case "4":
                    await TestUpdateSparePartAsync();
                    break;
                case "5":
                    await TestDeleteSparePartAsync();
                    break;
                case "6":
                    await TestGetTop5MostUsedSparePartsAsync();
                    break;
                case "7":
                    await TestGetUsageByWeekAsync();
                    break;
                case "8":
                    await TestGetUsageByMonthAsync();
                    break;
                case "9":
                    await TestGetUsageByCurrentWeekAsync();
                    break;
                case "10":
                    await TestGetUsageByCurrentMonthAsync();
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
        Console.WriteLine("SPARE PART SERVICE TEST MENU");
        Console.WriteLine("============================");
        Console.WriteLine("1. Test GetAllSparePartsAsync");
        Console.WriteLine("2. Test GetSparePartByIdAsync");
        Console.WriteLine("3. Test CreateSparePartAsync");
        Console.WriteLine("4. Test UpdateSparePartAsync");
        Console.WriteLine("5. Test DeleteSparePartAsync");
        Console.WriteLine("6. Test GetTop5MostUsedSparePartsAsync");
        Console.WriteLine("7. Test GetUsageByWeekAsync");
        Console.WriteLine("8. Test GetUsageByMonthAsync");
        Console.WriteLine("9. Test GetUsageByCurrentWeekAsync");
        Console.WriteLine("10. Test GetUsageByCurrentMonthAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetAllSparePartsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetAllSparePartsAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testSpareParts);

            // Execute
            Console.WriteLine("[STATUS] Executing GetAllSparePartsAsync...");
            var result = await _service.GetAllSparePartsAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} spare parts");
            Console.WriteLine("\n[DATA] Spare Part List:");
            Console.WriteLine("----------------------------------------");
            foreach (var part in result)
            {
                Console.WriteLine(FormatSparePart(part));
            }

            // Verify repository call
            _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetSparePartByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetSparePartByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Spare Part ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);

        var sparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);

        if (sparePart == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sparePart);

        Console.WriteLine($"[STATUS] Executing GetSparePartByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetSparePartByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Spare part found:");
                Console.WriteLine(FormatSparePart(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No spare part found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateSparePartAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateSparePartAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Part Number: ");
        var partNumber = Console.ReadLine();

        Console.Write("[INPUT] Enter Part Name: ");
        var partName = Console.ReadLine();

        Console.Write("[INPUT] Enter Part Type (or press Enter to skip): ");
        var partType = Console.ReadLine();

        Console.Write("[INPUT] Enter Supplier (or press Enter to skip): ");
        var supplier = Console.ReadLine();

        Console.Write("[INPUT] Enter Quantity: ");
        int.TryParse(Console.ReadLine(), out int quantity);

        Console.Write("[INPUT] Enter Min Quantity (or press Enter for default 5): ");
        var minQtyInput = Console.ReadLine();
        int minQuantity = string.IsNullOrWhiteSpace(minQtyInput) ? 5 : int.Parse(minQtyInput);

        Console.WriteLine("\n[INPUT] Creating spare part object...");
        var sparePart = new SparePart
        {
            PartNumber = partNumber ?? "",
            PartName = partName ?? "",
            PartType = partType,
            Supplier = supplier,
            Quantity = quantity,
            MinQuantity = minQuantity,
            DateAdded = DateTime.Now,
            IsActive = true
        };
        Console.WriteLine($"[INPUT DATA] PartNumber: {sparePart.PartNumber}, PartName: {sparePart.PartName}, Quantity: {sparePart.Quantity}, MinQuantity: {sparePart.MinQuantity}");

        // Setup mock
        var newSparePart = new SparePart
        {
            PartId = _testSpareParts.Max(s => s.PartId) + 1,
            PartNumber = sparePart.PartNumber,
            PartName = sparePart.PartName,
            PartType = sparePart.PartType,
            Supplier = sparePart.Supplier,
            Quantity = sparePart.Quantity,
            MinQuantity = sparePart.MinQuantity <= 0 ? 5 : sparePart.MinQuantity,
            DateAdded = sparePart.DateAdded,
            IsActive = sparePart.IsActive,
            Status = CalculateStatusForTest(sparePart.Quantity, sparePart.MinQuantity <= 0 ? 5 : sparePart.MinQuantity)
        };

        _mockRepository.Setup(x => x.AddAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newSparePart);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateSparePartAsync...");
            var result = await _service.CreateSparePartAsync(sparePart);

            Console.WriteLine("[SUCCESS] Spare part created successfully:");
            Console.WriteLine(FormatSparePart(result));
            Console.WriteLine($"[INFO] Auto-calculated Status: {result.Status}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateSparePartAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateSparePartAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Spare Part ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingSparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);

        if (existingSparePart == null)
        {
            Console.WriteLine($"[NOT FOUND] Spare part with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing spare part:");
            Console.WriteLine(FormatSparePart(existingSparePart));
        }

        Console.Write("\n[INPUT] Enter new Part Number: ");
        var partNumber = Console.ReadLine();

        Console.Write("[INPUT] Enter new Part Name: ");
        var partName = Console.ReadLine();

        Console.Write("[INPUT] Enter new Quantity: ");
        int.TryParse(Console.ReadLine(), out int quantity);

        Console.Write("[INPUT] Enter new Min Quantity: ");
        int.TryParse(Console.ReadLine(), out int minQuantity);

        Console.WriteLine("\n[INPUT] Creating update object...");
        var sparePart = new SparePart
        {
            PartNumber = partNumber ?? existingSparePart?.PartNumber ?? "",
            PartName = partName ?? existingSparePart?.PartName ?? "",
            Quantity = quantity,
            MinQuantity = minQuantity,
            PartType = existingSparePart?.PartType,
            Supplier = existingSparePart?.Supplier,
            IsActive = existingSparePart?.IsActive ?? true
        };
        Console.WriteLine($"[INPUT DATA] PartNumber: {sparePart.PartNumber}, PartName: {sparePart.PartName}, Quantity: {sparePart.Quantity}");

        // Setup mock
        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSparePart != null);

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateSparePartAsync...");
            var result = await _service.UpdateSparePartAsync(id, sparePart);

            if (result)
            {
                Console.WriteLine("[SUCCESS] Spare part updated successfully");
                Console.WriteLine($"[INFO] New Status: {CalculateStatusForTest(sparePart.Quantity, sparePart.MinQuantity <= 0 ? 5 : sparePart.MinQuantity)}");
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned false - spare part may not exist");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteSparePartAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteSparePartAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Spare Part ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingSparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);
        if (existingSparePart != null)
        {
            Console.WriteLine($"[WARNING] Will delete: {existingSparePart.PartName} (ID: {id})");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Spare part with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete spare part with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSparePart != null);

        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteSparePartAsync...");
            var result = await _service.DeleteSparePartAsync(id);

            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Spare part deleted successfully" : "Failed to delete spare part")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetTop5MostUsedSparePartsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetTop5MostUsedSparePartsAsync");
        Console.WriteLine("=========================================");

        try
        {
            // For testing, simulate top 5 most used
            var top5 = _testSpareParts.Take(5).ToList();

            // Setup mock
            _mockRepository.Setup(x => x.GetTop5MostUsedAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(top5);

            // Execute
            Console.WriteLine("[STATUS] Executing GetTop5MostUsedSparePartsAsync...");
            var result = await _service.GetTop5MostUsedSparePartsAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} most used spare parts");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Top 5 Most Used Spare Parts:");
                Console.WriteLine("----------------------------------------");
                int rank = 1;
                foreach (var part in result)
                {
                    Console.WriteLine($"[{rank++}] {FormatSparePart(part)}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No usage data found");
            }

            _mockRepository.Verify(x => x.GetTop5MostUsedAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUsageByWeekAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsageByWeekAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Week (1-53): ");
        int.TryParse(Console.ReadLine(), out int week);

        Console.Write("[INPUT] Enter Year (1900-2100): ");
        int.TryParse(Console.ReadLine(), out int year);

        try
        {
            // For testing, simulate usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 10 },
                { 2, 15 },
                { 3, 8 }
            };

            // Setup mock
            _mockRepository.Setup(x => x.GetUsageByWeekAsync(week, year, It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            Console.WriteLine($"[STATUS] Executing GetUsageByWeekAsync for Week {week}, Year {year}...");
            var result = await _service.GetUsageByWeekAsync(week, year);

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found usage data for {result.Count} spare parts");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Usage Data:");
                Console.WriteLine("----------------------------------------");
                foreach (var kvp in result)
                {
                    Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No usage data found for this week");
            }

            _mockRepository.Verify(x => x.GetUsageByWeekAsync(week, year, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUsageByMonthAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsageByMonthAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Month (1-12): ");
        int.TryParse(Console.ReadLine(), out int month);

        Console.Write("[INPUT] Enter Year (1900-2100): ");
        int.TryParse(Console.ReadLine(), out int year);

        try
        {
            // For testing, simulate usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 45 },
                { 2, 60 },
                { 3, 32 }
            };

            // Setup mock
            _mockRepository.Setup(x => x.GetUsageByMonthAsync(month, year, It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            Console.WriteLine($"[STATUS] Executing GetUsageByMonthAsync for Month {month}, Year {year}...");
            var result = await _service.GetUsageByMonthAsync(month, year);

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found usage data for {result.Count} spare parts");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Usage Data:");
                Console.WriteLine("----------------------------------------");
                foreach (var kvp in result)
                {
                    Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No usage data found for this month");
            }

            _mockRepository.Verify(x => x.GetUsageByMonthAsync(month, year, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUsageByCurrentWeekAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsageByCurrentWeekAsync");
        Console.WriteLine("=========================================");

        try
        {
            // For testing, simulate usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 5 },
                { 2, 12 },
                { 3, 7 }
            };

            // Setup mock
            _mockRepository.Setup(x => x.GetUsageByCurrentWeekAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            Console.WriteLine("[STATUS] Executing GetUsageByCurrentWeekAsync...");
            var result = await _service.GetUsageByCurrentWeekAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found usage data for {result.Count} spare parts in current week");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Current Week Usage Data:");
                Console.WriteLine("----------------------------------------");
                foreach (var kvp in result)
                {
                    Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No usage data found for current week");
            }

            _mockRepository.Verify(x => x.GetUsageByCurrentWeekAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUsageByCurrentMonthAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsageByCurrentMonthAsync");
        Console.WriteLine("=========================================");

        try
        {
            // For testing, simulate usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 28 },
                { 2, 45 },
                { 3, 33 }
            };

            // Setup mock
            _mockRepository.Setup(x => x.GetUsageByCurrentMonthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            Console.WriteLine("[STATUS] Executing GetUsageByCurrentMonthAsync...");
            var result = await _service.GetUsageByCurrentMonthAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found usage data for {result.Count} spare parts in current month");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Current Month Usage Data:");
                Console.WriteLine("----------------------------------------");
                foreach (var kvp in result)
                {
                    Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No usage data found for current month");
            }

            _mockRepository.Verify(x => x.GetUsageByCurrentMonthAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<SparePart> InitializeSparePartTestData()
    {
        return new List<SparePart>
        {
            new SparePart
            {
                PartId = 1,
                PartNumber = "SP001",
                PartName = "Motor Bearing",
                PartType = "Mechanical",
                Supplier = "ABC Supply Co.",
                Quantity = 50,
                MinQuantity = 10,
                Status = "Đủ hàng",
                IsActive = true,
                DateAdded = DateTime.Now.AddMonths(-6)
            },
            new SparePart
            {
                PartId = 2,
                PartNumber = "SP002",
                PartName = "Belt Drive",
                PartType = "Mechanical",
                Supplier = "XYZ Parts Ltd.",
                Quantity = 8,
                MinQuantity = 10,
                Status = "Sắp hết",
                IsActive = true,
                DateAdded = DateTime.Now.AddMonths(-3)
            },
            new SparePart
            {
                PartId = 3,
                PartNumber = "SP003",
                PartName = "Control Board",
                PartType = "Electrical",
                Supplier = "Tech Solutions",
                Quantity = 0,
                MinQuantity = 5,
                Status = "Hết hàng",
                IsActive = true,
                DateAdded = DateTime.Now.AddMonths(-4)
            },
            new SparePart
            {
                PartId = 4,
                PartNumber = "SP004",
                PartName = "Oil Filter",
                PartType = "Consumable",
                Supplier = "ABC Supply Co.",
                Quantity = 100,
                MinQuantity = 20,
                Status = "Đủ hàng",
                IsActive = true,
                DateAdded = DateTime.Now.AddMonths(-1)
            },
            new SparePart
            {
                PartId = 5,
                PartNumber = "SP005",
                PartName = "Hydraulic Cylinder",
                PartType = "Hydraulic",
                Supplier = "Hydraulic Pro",
                Quantity = 15,
                MinQuantity = 5,
                Status = "Đủ hàng",
                IsActive = false,
                DateAdded = DateTime.Now.AddMonths(-12)
            }
        };
    }

    private string FormatSparePart(SparePart part)
    {
        if (part == null) return "[NULL]";

        return $"{{ID:{part.PartId}, PartNo:\"{part.PartNumber}\", Name:\"{part.PartName}\", Type:\"{part.PartType}\", Qty:{part.Quantity}/{part.MinQuantity}, Status:\"{part.Status}\", Active:{part.IsActive}}}";
    }

    private string CalculateStatusForTest(int quantity, int minQuantity)
    {
        if (quantity == 0)
            return "Hết hàng";
        else if (quantity <= minQuantity)
            return "Sắp hết";
        else
            return "Đủ hàng";
    }
}

