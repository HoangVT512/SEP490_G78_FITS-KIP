using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class ReplacementHistoryServiceManualTest
{
    private readonly Mock<IReplacementHistoryRepository> _mockRepository;
    private readonly ReplacementHistoryService _service;
    private readonly List<ReplacementHistory> _testReplacements;

    public ReplacementHistoryServiceManualTest()
    {
        _mockRepository = new Mock<IReplacementHistoryRepository>();
        _service = new ReplacementHistoryService(_mockRepository.Object);
        _testReplacements = InitializeReplacementTestData();
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
                    await TestGetAllAsync();
                    break;
                case "2":
                    await TestGetByIdAsync();
                    break;
                case "3":
                    await TestCreateAsync();
                    break;
                case "4":
                    await TestUpdateAsync();
                    break;
                case "5":
                    await TestDeleteAsync();
                    break;
                case "6":
                    await TestGetByEquipmentIdAsync();
                    break;
                case "7":
                    await TestGetByIncidentIdAsync();
                    break;
                case "8":
                    await TestGetByPartIdAsync();
                    break;
                case "9":
                    await TestGetByUserIdAsync();
                    break;
                case "10":
                    await TestGetByDateRangeAsync();
                    break;
                case "11":
                    await TestGetByStatusAsync();
                    break;
                case "12":
                    await TestConfirmReturnAsync();
                    break;
                case "13":
                    await TestGetPendingReturnAsync();
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
        Console.WriteLine("REPLACEMENT HISTORY SERVICE TEST MENU");
        Console.WriteLine("=====================================");
        Console.WriteLine("1. Test GetAllAsync");
        Console.WriteLine("2. Test GetByIdAsync");
        Console.WriteLine("3. Test CreateAsync");
        Console.WriteLine("4. Test UpdateAsync");
        Console.WriteLine("5. Test DeleteAsync");
        Console.WriteLine("6. Test GetByEquipmentIdAsync");
        Console.WriteLine("7. Test GetByIncidentIdAsync");
        Console.WriteLine("8. Test GetByPartIdAsync");
        Console.WriteLine("9. Test GetByUserIdAsync");
        Console.WriteLine("10. Test GetByDateRangeAsync");
        Console.WriteLine("11. Test GetByStatusAsync");
        Console.WriteLine("12. Test ConfirmReturnAsync");
        Console.WriteLine("13. Test GetPendingReturnAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetAllAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetAllAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testReplacements);

            // Execute
            Console.WriteLine("[STATUS] Executing GetAllAsync...");
            var result = await _service.GetAllAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories");
            Console.WriteLine("\n[DATA] Replacement History List:");
            Console.WriteLine("----------------------------------------");
            foreach (var replacement in result)
            {
                Console.WriteLine(FormatReplacement(replacement));
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

    private async Task TestGetByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Replacement ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);

        var replacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

        if (replacement == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacement);

        Console.WriteLine($"[STATUS] Executing GetByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Replacement history found:");
                Console.WriteLine(FormatReplacement(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No replacement history found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID (or 0 to skip): ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        Console.Write("[INPUT] Enter Incident ID (or 0 to skip): ");
        int.TryParse(Console.ReadLine(), out int incidentId);

        Console.Write("[INPUT] Enter Part ID: ");
        int.TryParse(Console.ReadLine(), out int partId);

        Console.Write("[INPUT] Enter Quantity: ");
        int.TryParse(Console.ReadLine(), out int quantity);

        Console.Write("[INPUT] Enter Replaced By (User ID): ");
        var replacedBy = Console.ReadLine();

        Console.Write("[INPUT] Enter Remarks (or press Enter to skip): ");
        var remarks = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating replacement history object...");
        var replacement = new ReplacementHistory
        {
            EquipmentId = equipmentId > 0 ? equipmentId : null,
            IncidentId = incidentId > 0 ? incidentId : null,
            PartId = partId,
            Quantity = quantity,
            ReplacedDate = DateTime.Now,
            ReplacedBy = replacedBy ?? "",
            Status = "Chờ duyệt cấp phát",
            Remarks = remarks
        };
        Console.WriteLine($"[INPUT DATA] PartId: {replacement.PartId}, Quantity: {replacement.Quantity}, ReplacedBy: {replacement.ReplacedBy}, Status: {replacement.Status}");

        // Setup mock
        var newReplacement = new ReplacementHistory
        {
            ReplacementId = _testReplacements.Max(r => r.ReplacementId) + 1,
            EquipmentId = replacement.EquipmentId,
            IncidentId = replacement.IncidentId,
            PartId = replacement.PartId,
            Quantity = replacement.Quantity,
            ReplacedDate = replacement.ReplacedDate,
            ReplacedBy = replacement.ReplacedBy,
            Status = replacement.Status,
            Remarks = replacement.Remarks
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newReplacement);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateAsync...");
            var result = await _service.CreateAsync(replacement);

            Console.WriteLine("[SUCCESS] Replacement history created successfully:");
            Console.WriteLine(FormatReplacement(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Replacement ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

        if (existingReplacement == null)
        {
            Console.WriteLine($"[NOT FOUND] Replacement history with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing replacement:");
            Console.WriteLine(FormatReplacement(existingReplacement));
        }

        Console.Write("\n[INPUT] Enter new Quantity: ");
        int.TryParse(Console.ReadLine(), out int quantity);

        Console.Write("[INPUT] Enter new Status: ");
        var status = Console.ReadLine();

        Console.Write("[INPUT] Enter new Remarks: ");
        var remarks = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating update object...");
        var replacement = new ReplacementHistory
        {
            EquipmentId = existingReplacement?.EquipmentId,
            IncidentId = existingReplacement?.IncidentId,
            PartId = existingReplacement?.PartId ?? 1,
            Quantity = quantity,
            ReplacedDate = existingReplacement?.ReplacedDate ?? DateTime.Now,
            ReplacedBy = existingReplacement?.ReplacedBy ?? "",
            Status = status ?? existingReplacement?.Status ?? "",
            Remarks = remarks ?? existingReplacement?.Remarks
        };
        Console.WriteLine($"[INPUT DATA] Quantity: {replacement.Quantity}, Status: {replacement.Status}");

        // Setup mock
        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingReplacement != null);

        var updatedReplacement = new ReplacementHistory
        {
            ReplacementId = id,
            EquipmentId = replacement.EquipmentId,
            IncidentId = replacement.IncidentId,
            PartId = replacement.PartId,
            Quantity = replacement.Quantity,
            ReplacedDate = replacement.ReplacedDate,
            ReplacedBy = replacement.ReplacedBy,
            Status = replacement.Status,
            Remarks = replacement.Remarks
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedReplacement);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateAsync...");
            var result = await _service.UpdateAsync(id, replacement);

            Console.WriteLine("[SUCCESS] Replacement history updated successfully:");
            Console.WriteLine(FormatReplacement(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Replacement ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);
        if (existingReplacement != null)
        {
            Console.WriteLine($"[WARNING] Will delete replacement history ID: {id}");
            Console.WriteLine(FormatReplacement(existingReplacement));
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Replacement history with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete? (y/n): ");
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
            Console.WriteLine("[STATUS] Executing DeleteAsync...");
            var result = await _service.DeleteAsync(id);

            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Deleted successfully" : "Failed to delete")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByEquipmentIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByEquipmentIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        var replacements = _testReplacements.Where(r => r.EquipmentId == equipmentId).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByEquipmentIdAsync(equipmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByEquipmentIdAsync with Equipment ID: {equipmentId}...");

        try
        {
            var result = await _service.GetByEquipmentIdAsync(equipmentId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories for equipment {equipmentId}");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found for this equipment");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByIncidentIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByIncidentIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Incident ID: ");
        int.TryParse(Console.ReadLine(), out int incidentId);

        var replacements = _testReplacements.Where(r => r.IncidentId == incidentId).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByIncidentIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByIncidentIdAsync with Incident ID: {incidentId}...");

        try
        {
            var result = await _service.GetByIncidentIdAsync(incidentId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories for incident {incidentId}");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found for this incident");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByPartIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByPartIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Part ID: ");
        int.TryParse(Console.ReadLine(), out int partId);

        var replacements = _testReplacements.Where(r => r.PartId == partId).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByPartIdAsync(partId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByPartIdAsync with Part ID: {partId}...");

        try
        {
            var result = await _service.GetByPartIdAsync(partId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories for part {partId}");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found for this part");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByUserIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByUserIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        var replacements = _testReplacements.Where(r => r.ReplacedBy == userId).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByUserIdAsync with User ID: {userId}...");

        try
        {
            var result = await _service.GetByUserIdAsync(userId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories by user {userId}");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found for this user");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByDateRangeAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByDateRangeAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Start Date (yyyy-MM-dd): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime startDate))
        {
            Console.WriteLine("[ERROR] Invalid date format");
            return;
        }

        Console.Write("[INPUT] Enter End Date (yyyy-MM-dd): ");
        if (!DateTime.TryParse(Console.ReadLine(), out DateTime endDate))
        {
            Console.WriteLine("[ERROR] Invalid date format");
            return;
        }

        var replacements = _testReplacements.Where(r => 
            r.ReplacedDate >= startDate && r.ReplacedDate <= endDate).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByDateRangeAsync from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}...");

        try
        {
            var result = await _service.GetByDateRangeAsync(startDate, endDate);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories in date range");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found in this date range");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByStatusAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Status (e.g., Chờ duyệt cấp phát, Đã cấp phát, Hoàn thành): ");
        var status = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(status))
        {
            Console.WriteLine("[ERROR] Status cannot be empty.");
            return;
        }

        var replacements = _testReplacements.Where(r => r.Status == status).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        Console.WriteLine($"[STATUS] Executing GetByStatusAsync with status: {status}...");

        try
        {
            var result = await _service.GetByStatusAsync(status);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} replacement histories with status '{status}'");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Replacement History List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No replacement histories found with this status");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestConfirmReturnAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ConfirmReturnAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Replacement ID to confirm return: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

        if (existingReplacement != null)
        {
            Console.WriteLine($"[CURRENT DATA]:");
            Console.WriteLine(FormatReplacement(existingReplacement));
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Replacement with ID {id} not found");
        }

        Console.Write("\n[INPUT] Enter Actual Quantity Used: ");
        int.TryParse(Console.ReadLine(), out int actualQty);

        Console.Write("[INPUT] Enter Return Confirmed By (User ID): ");
        var confirmedBy = Console.ReadLine();

        Console.Write("[INPUT] Enter Return Remarks: ");
        var returnRemarks = Console.ReadLine();

        var confirmationDto = new ReturnConfirmationDto
        {
            ActualQuantityUsed = actualQty,
            ReturnedDate = DateTime.Now,
            ReturnConfirmedBy = confirmedBy,
            ReturnRemarks = returnRemarks
        };

        Console.WriteLine($"\n[INPUT DATA] ActualQtyUsed: {confirmationDto.ActualQuantityUsed}, ConfirmedBy: {confirmationDto.ReturnConfirmedBy}");

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingReplacement);

        var updatedReplacement = existingReplacement != null ? new ReplacementHistory
        {
            ReplacementId = existingReplacement.ReplacementId,
            EquipmentId = existingReplacement.EquipmentId,
            IncidentId = existingReplacement.IncidentId,
            PartId = existingReplacement.PartId,
            Quantity = existingReplacement.Quantity,
            ReplacedDate = existingReplacement.ReplacedDate,
            ReplacedBy = existingReplacement.ReplacedBy,
            Status = "Hoàn thành",
            Remarks = existingReplacement.Remarks,
            ActualQuantityUsed = actualQty,
            QuantityToReturn = existingReplacement.Quantity - actualQty > 0 ? existingReplacement.Quantity - actualQty : null,
            ReturnedDate = DateTime.Now,
            ReturnConfirmedBy = confirmedBy,
            ReturnRemarks = returnRemarks
        } : null;

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedReplacement);

        try
        {
            Console.WriteLine("[STATUS] Executing ConfirmReturnAsync...");
            var result = await _service.ConfirmReturnAsync(id, confirmationDto);

            Console.WriteLine("[SUCCESS] Return confirmed successfully:");
            Console.WriteLine(FormatReplacement(result));
            
            if (result.QuantityToReturn.HasValue && result.QuantityToReturn.Value > 0)
            {
                Console.WriteLine($"[INFO] Quantity to return: {result.QuantityToReturn.Value}");
            }
            else
            {
                Console.WriteLine("[INFO] No excess quantity to return");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetPendingReturnAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetPendingReturnAsync");
        Console.WriteLine("=========================================");

        try
        {
            // For testing, simulate pending returns
            var pendingReturns = _testReplacements.Where(r =>
                r.ActualQuantityUsed.HasValue &&
                r.QuantityToReturn.HasValue &&
                r.QuantityToReturn > 0 &&
                string.IsNullOrEmpty(r.ReturnConfirmedBy)
            ).ToList();

            // Setup mock
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testReplacements);

            // Execute
            Console.WriteLine("[STATUS] Executing GetPendingReturnAsync...");
            var result = await _service.GetPendingReturnAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} pending returns");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Pending Return List:");
                Console.WriteLine("----------------------------------------");
                foreach (var replacement in result)
                {
                    Console.WriteLine(FormatReplacement(replacement));
                    Console.WriteLine($"  → Need to return: {replacement.QuantityToReturn} units");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No pending returns found");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<ReplacementHistory> InitializeReplacementTestData()
    {
        return new List<ReplacementHistory>
        {
            new ReplacementHistory
            {
                ReplacementId = 1,
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 1,
                Quantity = 5,
                ReplacedDate = DateTime.Now.AddDays(-10),
                ReplacedBy = "user001",
                Status = "Đã cấp phát",
                Remarks = "Replacement for broken bearing",
                ActualQuantityUsed = 3,
                QuantityToReturn = 2
            },
            new ReplacementHistory
            {
                ReplacementId = 2,
                EquipmentId = 2,
                IncidentId = 2,
                PartId = 2,
                Quantity = 10,
                ReplacedDate = DateTime.Now.AddDays(-5),
                ReplacedBy = "user002",
                Status = "Hoàn thành",
                Remarks = "Belt replacement completed",
                ActualQuantityUsed = 10,
                QuantityToReturn = null,
                ReturnedDate = DateTime.Now.AddDays(-4),
                ReturnConfirmedBy = "warehouse001"
            },
            new ReplacementHistory
            {
                ReplacementId = 3,
                EquipmentId = 1,
                IncidentId = null,
                PartId = 3,
                Quantity = 2,
                ReplacedDate = DateTime.Now.AddDays(-3),
                ReplacedBy = "user001",
                Status = "Chờ duyệt cấp phát",
                Remarks = "Preventive maintenance"
            },
            new ReplacementHistory
            {
                ReplacementId = 4,
                EquipmentId = 3,
                IncidentId = 3,
                PartId = 4,
                Quantity = 15,
                ReplacedDate = DateTime.Now.AddDays(-2),
                ReplacedBy = "user003",
                Status = "Đã cấp phát",
                Remarks = "Oil filter replacement",
                ActualQuantityUsed = 12,
                QuantityToReturn = 3
            },
            new ReplacementHistory
            {
                ReplacementId = 5,
                EquipmentId = 2,
                IncidentId = 4,
                PartId = 5,
                Quantity = 1,
                ReplacedDate = DateTime.Now.AddDays(-1),
                ReplacedBy = "user002",
                Status = "Hoàn thành",
                Remarks = "Hydraulic cylinder replaced",
                ActualQuantityUsed = 1,
                QuantityToReturn = null,
                ReturnedDate = DateTime.Now,
                ReturnConfirmedBy = "warehouse001"
            }
        };
    }

    private string FormatReplacement(ReplacementHistory replacement)
    {
        if (replacement == null) return "[NULL]";

        return $"{{ID:{replacement.ReplacementId}, EqID:{replacement.EquipmentId}, IncID:{replacement.IncidentId}, PartID:{replacement.PartId}, Qty:{replacement.Quantity}, Used:{replacement.ActualQuantityUsed}, ToReturn:{replacement.QuantityToReturn}, Status:\"{replacement.Status}\", By:\"{replacement.ReplacedBy}\", Date:{replacement.ReplacedDate:yyyy-MM-dd}}}";
    }
}

