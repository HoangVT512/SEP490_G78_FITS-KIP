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

            try
            {
                switch (choice)
                {
                    case "1":
                        var result1 = await TestGetAllSparePartsAsync();
                        Console.WriteLine($"Found {result1.Count()} spare parts");
                        foreach (var part in result1)
                        {
                            Console.WriteLine(FormatSparePart(part));
                        }
                        break;
                    case "2":
                        Console.Write("[INPUT] Enter Spare Part ID: ");
                        int.TryParse(Console.ReadLine(), out int id2);
                        var result2 = await TestGetSparePartByIdAsync(id2);
                        if (result2 != null)
                            Console.WriteLine(FormatSparePart(result2));
                        else
                            Console.WriteLine("Spare part not found");
                        break;
                    case "3":
                        var sparePart3 = new SparePart
                        {
                            PartNumber = GetStringInput("Part Number"),
                            PartName = GetStringInput("Part Name"),
                            PartType = GetStringInput("Part Type"),
                            Supplier = GetStringInput("Supplier"),
                            Quantity = GetIntInput("Quantity"),
                            MinQuantity = GetIntInput("Min Quantity", 5),
                            IsActive = true
                        };
                        var result3 = await TestCreateSparePartAsync(sparePart3);
                        Console.WriteLine(FormatSparePart(result3));
                        break;
                    case "4":
                        var id4 = GetIntInput("Spare Part ID to update");
                        var sparePart4 = new SparePart
                        {
                            PartNumber = GetStringInput("Part Number"),
                            PartName = GetStringInput("Part Name"),
                            Quantity = GetIntInput("Quantity"),
                            MinQuantity = GetIntInput("Min Quantity")
                        };
                        var result4 = await TestUpdateSparePartAsync(id4, sparePart4);
                        Console.WriteLine($"Update result: {result4}");
                        break;
                    case "5":
                        var id5 = GetIntInput("Spare Part ID to delete");
                        var result5 = await TestDeleteSparePartAsync(id5);
                        Console.WriteLine($"Delete result: {result5}");
                        break;
                    case "6":
                        var result6 = await TestGetTop5MostUsedSparePartsAsync();
                        Console.WriteLine($"Found {result6.Count()} most used spare parts");
                        int rank = 1;
                        foreach (var part in result6)
                        {
                            Console.WriteLine($"[{rank++}] {FormatSparePart(part)}");
                        }
                        break;
                    case "7":
                        var week7 = GetIntInput("Week (1-53)");
                        var year7 = GetIntInput("Year");
                        var result7 = await TestGetUsageByWeekAsync(week7, year7);
                        Console.WriteLine($"Found usage data for {result7.Count} spare parts");
                        foreach (var kvp in result7)
                        {
                            Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                        }
                        break;
                    case "8":
                        var month8 = GetIntInput("Month (1-12)");
                        var year8 = GetIntInput("Year");
                        var result8 = await TestGetUsageByMonthAsync(month8, year8);
                        Console.WriteLine($"Found usage data for {result8.Count} spare parts");
                        foreach (var kvp in result8)
                        {
                            Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                        }
                        break;
                    case "9":
                        var result9 = await TestGetUsageByCurrentWeekAsync();
                        Console.WriteLine($"Found usage data for {result9.Count} spare parts in current week");
                        foreach (var kvp in result9)
                        {
                            Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                        }
                        break;
                    case "10":
                        var result10 = await TestGetUsageByCurrentMonthAsync();
                        Console.WriteLine($"Found usage data for {result10.Count} spare parts in current month");
                        foreach (var kvp in result10)
                        {
                            Console.WriteLine($"PartId: {kvp.Key}, Usage Count: {kvp.Value}");
                        }
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

    private async Task<IEnumerable<SparePart>> TestGetAllSparePartsAsync()
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testSpareParts);

        var result = await _service.GetAllSparePartsAsync();

        // Verify repository call
        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<SparePart?> TestGetSparePartByIdAsync(int id)
    {
        var sparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);

        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sparePart);

        var result = await _service.GetSparePartByIdAsync(id);
        return result;
    }

    private async Task<SparePart> TestCreateSparePartAsync(SparePart sparePart)
    {
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

        var result = await _service.CreateSparePartAsync(sparePart);
        return result;
    }

    private async Task<bool> TestUpdateSparePartAsync(int id, SparePart sparePart)
    {
        var existingSparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);
        if (existingSparePart == null) return false;

        // Setup mock
        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _service.UpdateSparePartAsync(id, sparePart);
        return result;
    }

    private async Task<bool> TestDeleteSparePartAsync(int id)
    {
        var existingSparePart = _testSpareParts.FirstOrDefault(s => s.PartId == id);
        if (existingSparePart == null) return false;

        // Setup mock
        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _service.DeleteSparePartAsync(id);
        return result;
    }

    private async Task<IEnumerable<SparePart>> TestGetTop5MostUsedSparePartsAsync()
    {
        // For testing, simulate top 5 most used
        var top5 = _testSpareParts.Take(5).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetTop5MostUsedAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(top5);

        var result = await _service.GetTop5MostUsedSparePartsAsync();

        _mockRepository.Verify(x => x.GetTop5MostUsedAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<Dictionary<int, int>> TestGetUsageByWeekAsync(int week, int year)
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

        var result = await _service.GetUsageByWeekAsync(week, year);

        _mockRepository.Verify(x => x.GetUsageByWeekAsync(week, year, It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<Dictionary<int, int>> TestGetUsageByMonthAsync(int month, int year)
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

        var result = await _service.GetUsageByMonthAsync(month, year);

        _mockRepository.Verify(x => x.GetUsageByMonthAsync(month, year, It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<Dictionary<int, int>> TestGetUsageByCurrentWeekAsync()
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

        var result = await _service.GetUsageByCurrentWeekAsync();

        _mockRepository.Verify(x => x.GetUsageByCurrentWeekAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<Dictionary<int, int>> TestGetUsageByCurrentMonthAsync()
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

        var result = await _service.GetUsageByCurrentMonthAsync();

        _mockRepository.Verify(x => x.GetUsageByCurrentMonthAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
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

    private int GetIntInput(string prompt, int defaultValue = 0)
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return int.TryParse(input, out int result) ? result : defaultValue;
    }

    private string GetStringInput(string prompt, string defaultValue = "")
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
    }
}

