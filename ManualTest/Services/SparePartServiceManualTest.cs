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
        _testSpareParts = InitializeTestSpareParts();
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
                        Console.WriteLine("Tạm biệt!");
                        return;
                    default:
                        Console.WriteLine("Lựa chọn không hợp lệ. Vui lòng thử lại.");
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

    private async Task TestGetAllSparePartsAsync()
    {
        Console.WriteLine("TEST: GetAllSparePartsAsync");

        try
        {
            // Setup mock
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testSpareParts);

            // Execute
            var result = await _service.GetAllSparePartsAsync();

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count()} phụ tùng");
            foreach (var part in result)
            {
                Console.WriteLine(FormatSparePart(part));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetSparePartByIdAsync()
    {
        Console.WriteLine("TEST: GetSparePartByIdAsync");

        try
        {
            // Setup mock
            var testPart = _testSpareParts[0];
            _mockRepository.Setup(x => x.GetByIdAsync(testPart.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(testPart);

            // Execute
            var result = await _service.GetSparePartByIdAsync(testPart.PartId);

            if (result != null)
            {
                Console.WriteLine($"[THÀNH CÔNG] Tìm thấy phụ tùng");
                Console.WriteLine(FormatSparePart(result));
            }
            else
            {
                Console.WriteLine("[KHÔNG TÌM THẤY] Không tìm thấy phụ tùng");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestCreateSparePartAsync()
    {
        Console.WriteLine("TEST: CreateSparePartAsync");

        try
        {
            // Create new spare part
            var newPart = new SparePart
            {
                PartNumber = GetStringInput("Part Number"),
                PartName = GetStringInput("Part Name"),
                PartType = GetStringInput("Part Type"),
                Quantity = GetIntInput("Quantity"),
                MinQuantity = GetIntInput("Min Quantity", 5),
                Location = GetStringInput("Location"),
                DateAdded = DateTime.Now
            };

            // Setup mock for successful creation
            _mockRepository.Setup(x => x.AddAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((SparePart p, CancellationToken ct) =>
                {
                    p.PartId = _testSpareParts.Max(sp => sp.PartId) + 1;
                    return p;
                });

            // Execute
            var result = await _service.CreateSparePartAsync(newPart);

            Console.WriteLine($"[THÀNH CÔNG] Tạo phụ tùng thành công");
            Console.WriteLine(FormatSparePart(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestUpdateSparePartAsync()
    {
        Console.WriteLine("TEST: UpdateSparePartAsync");

        try
        {
            var partId = GetIntInput("Part ID to update");
            var existingPart = _testSpareParts.FirstOrDefault(p => p.PartId == partId);

            if (existingPart == null)
            {
                Console.WriteLine($"[LỖI] Không tìm thấy phụ tùng với ID {partId}");
                return;
            }

            // Update properties
            var updatedPart = new SparePart
            {
                PartNumber = GetStringInput("Part Number", existingPart.PartNumber),
                PartName = GetStringInput("Part Name", existingPart.PartName),
                PartType = GetStringInput("Part Type", existingPart.PartType),
                Quantity = GetIntInput("Quantity", existingPart.Quantity),
                MinQuantity = GetIntInput("Min Quantity", existingPart.MinQuantity),
                Location = GetStringInput("Location", existingPart.Location)
            };

            // Setup mocks
            _mockRepository.Setup(x => x.ExistsAsync(partId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Execute
            var result = await _service.UpdateSparePartAsync(partId, updatedPart);

            Console.WriteLine($"[THÀNH CÔNG] Cập nhật phụ tùng thành công: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestDeleteSparePartAsync()
    {
        Console.WriteLine("TEST: DeleteSparePartAsync");

        try
        {
            var partId = GetIntInput("Part ID to delete");

            // Setup mocks - assume part exists
            _mockRepository.Setup(x => x.ExistsAsync(partId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _mockRepository.Setup(x => x.DeleteAsync(partId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Execute
            var result = await _service.DeleteSparePartAsync(partId);

            Console.WriteLine($"[THÀNH CÔNG] Xóa phụ tùng thành công: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetTop5MostUsedSparePartsAsync()
    {
        Console.WriteLine("TEST: GetTop5MostUsedSparePartsAsync");

        try
        {
            // Setup mock with top 5 parts
            var topParts = _testSpareParts.OrderByDescending(p => p.Quantity).Take(5);
            _mockRepository.Setup(x => x.GetTop5MostUsedAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(topParts);

            // Execute
            var result = await _service.GetTop5MostUsedSparePartsAsync();

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count()} phụ tùng được sử dụng nhiều nhất");
            int rank = 1;
            foreach (var part in result)
            {
                Console.WriteLine($"[{rank++}] {FormatSparePart(part)}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetUsageByWeekAsync()
    {
        Console.WriteLine("TEST: GetUsageByWeekAsync");

        try
        {
            var week = GetIntInput("Week (1-53)");
            var year = GetIntInput("Year");

            // Setup mock with sample usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 25 }, { 2, 18 }, { 3, 32 }, { 4, 15 }, { 5, 28 }
            };

            _mockRepository.Setup(x => x.GetUsageByWeekAsync(week, year, It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            var result = await _service.GetUsageByWeekAsync(week, year);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy dữ liệu sử dụng cho {result.Count} phụ tùng trong tuần {week}, {year}");
            foreach (var kvp in result)
            {
                Console.WriteLine($"PartId: {kvp.Key}, Số lần sử dụng: {kvp.Value}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetUsageByMonthAsync()
    {
        Console.WriteLine("TEST: GetUsageByMonthAsync");

        try
        {
            var month = GetIntInput("Month (1-12)");
            var year = GetIntInput("Year");

            // Setup mock with sample usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 150 }, { 2, 120 }, { 3, 200 }, { 4, 95 }, { 5, 180 }
            };

            _mockRepository.Setup(x => x.GetUsageByMonthAsync(month, year, It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            var result = await _service.GetUsageByMonthAsync(month, year);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy dữ liệu sử dụng cho {result.Count} phụ tùng trong tháng {month}, {year}");
            foreach (var kvp in result)
            {
                Console.WriteLine($"PartId: {kvp.Key}, Số lần sử dụng: {kvp.Value}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetUsageByCurrentWeekAsync()
    {
        Console.WriteLine("TEST: GetUsageByCurrentWeekAsync");

        try
        {
            // Setup mock with sample current week usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 12 }, { 2, 8 }, { 3, 15 }, { 4, 6 }, { 5, 10 }
            };

            _mockRepository.Setup(x => x.GetUsageByCurrentWeekAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            var result = await _service.GetUsageByCurrentWeekAsync();

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy dữ liệu sử dụng cho {result.Count} phụ tùng trong tuần hiện tại");
            foreach (var kvp in result)
            {
                Console.WriteLine($"PartId: {kvp.Key}, Số lần sử dụng: {kvp.Value}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestGetUsageByCurrentMonthAsync()
    {
        Console.WriteLine("TEST: GetUsageByCurrentMonthAsync");

        try
        {
            // Setup mock with sample current month usage data
            var usageData = new Dictionary<int, int>
            {
                { 1, 75 }, { 2, 60 }, { 3, 95 }, { 4, 45 }, { 5, 85 }
            };

            _mockRepository.Setup(x => x.GetUsageByCurrentMonthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(usageData);

            // Execute
            var result = await _service.GetUsageByCurrentMonthAsync();

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy dữ liệu sử dụng cho {result.Count} phụ tùng trong tháng hiện tại");
            foreach (var kvp in result)
            {
                Console.WriteLine($"PartId: {kvp.Key}, Số lần sử dụng: {kvp.Value}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    // Helper methods for user input
    private string GetStringInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return input ?? "";
    }

    private string GetStringInput(string prompt, string defaultValue)
    {
        Console.Write($"[INPUT] {prompt} (default: {defaultValue}): ");
        var input = Console.ReadLine();
        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
    }

    private int GetIntInput(string prompt)
    {
        while (true)
        {
            Console.Write($"[INPUT] {prompt}: ");
            if (int.TryParse(Console.ReadLine(), out int result))
                return result;
            Console.WriteLine("Invalid number. Please try again.");
        }
    }

    private int GetIntInput(string prompt, int defaultValue)
    {
        Console.Write($"[INPUT] {prompt} (default: {defaultValue}): ");
        var input = Console.ReadLine();
        if (int.TryParse(input, out int result))
            return result;
        return defaultValue;
    }

    private string FormatSparePart(SparePart part)
    {
        return $"ID: {part.PartId}, Code: {part.PartNumber}, Name: {part.PartName}, Qty: {part.Quantity}, Min: {part.MinQuantity}, Status: {part.Status}";
    }

    // Test data initialization methods
    private List<SparePart> InitializeTestSpareParts()
    {
        return new List<SparePart>
        {
            new SparePart
            {
                PartId = 1,
                PartNumber = "SP001",
                PartName = "Motor Bearing",
                PartType = "Mechanical",
                Quantity = 50,
                MinQuantity = 10,
                Location = "Warehouse A",
                DateAdded = DateTime.Now.AddDays(-30),
                Status = "Đủ hàng"
            },
            new SparePart
            {
                PartId = 2,
                PartNumber = "SP002",
                PartName = "Belt Drive",
                PartType = "Mechanical",
                Quantity = 8,
                MinQuantity = 10,
                Location = "Warehouse A",
                DateAdded = DateTime.Now.AddDays(-25),
                Status = "Sắp hết"
            },
            new SparePart
            {
                PartId = 3,
                PartNumber = "SP003",
                PartName = "Control Board",
                PartType = "Electrical",
                Quantity = 0,
                MinQuantity = 5,
                Location = "Warehouse B",
                DateAdded = DateTime.Now.AddDays(-20),
                Status = "Hết hàng"
            },
            new SparePart
            {
                PartId = 4,
                PartNumber = "SP004",
                PartName = "Oil Filter",
                PartType = "Consumable",
                Quantity = 100,
                MinQuantity = 20,
                Location = "Warehouse A",
                DateAdded = DateTime.Now.AddDays(-15),
                Status = "Đủ hàng"
            },
            new SparePart
            {
                PartId = 5,
                PartNumber = "SP005",
                PartName = "Hydraulic Cylinder",
                PartType = "Hydraulic",
                Quantity = 15,
                MinQuantity = 5,
                Location = "Warehouse B",
                DateAdded = DateTime.Now.AddDays(-10),
                Status = "Đủ hàng"
            }
        };
    }
}