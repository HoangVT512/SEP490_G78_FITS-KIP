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
    private readonly Mock<IEquipmentRepository> _mockEquipmentRepository;
    private readonly Mock<IIncidentRepository> _mockIncidentRepository;
    private readonly Mock<IMaintenanceWorkOrderRepository> _mockWorkOrderRepository;
    private readonly Mock<ISparePartRepository> _mockSparePartRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly ReplacementHistoryService _service;
    private readonly List<ReplacementHistory> _testReplacements;
    private readonly List<SparePart> _testSpareParts;
    private readonly List<User> _testUsers;
    private readonly List<Equipment> _testEquipments;
    private readonly List<IncidentHistory> _testIncidents;
    private readonly List<MaintenanceWorkOrder> _testWorkOrders;

    public ReplacementHistoryServiceManualTest()
    {
        _mockRepository = new Mock<IReplacementHistoryRepository>();
        _mockEquipmentRepository = new Mock<IEquipmentRepository>();
        _mockIncidentRepository = new Mock<IIncidentRepository>();
        _mockWorkOrderRepository = new Mock<IMaintenanceWorkOrderRepository>();
        _mockSparePartRepository = new Mock<ISparePartRepository>();
        _mockUserRepository = new Mock<IUserRepository>();

        _service = new ReplacementHistoryService(
            _mockRepository.Object,
            _mockEquipmentRepository.Object,
            _mockIncidentRepository.Object,
            _mockWorkOrderRepository.Object,
            _mockSparePartRepository.Object,
            _mockUserRepository.Object
        );

        _testSpareParts = InitializeSparePartTestData();
        _testUsers = InitializeUserTestData();
        _testEquipments = InitializeEquipmentTestData();
        _testIncidents = InitializeIncidentTestData();
        _testWorkOrders = InitializeWorkOrderTestData();
        _testReplacements = InitializeReplacementTestData();
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
                        var result1 = await TestGetAllAsync();
                        Console.WriteLine($"Found {result1.Count()} replacement histories");
                        foreach (var replacement in result1)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "2":
                        Console.Write("[INPUT] Enter Replacement ID: ");
                        int.TryParse(Console.ReadLine(), out int id2);
                        var result2 = await TestGetByIdAsync(id2);
                        if (result2 != null)
                            Console.WriteLine(FormatReplacement(result2));
                        else
                            Console.WriteLine("Replacement history not found");
                        break;
                    case "3":
                        var request3 = new ReplacementHistory
                        {
                            EquipmentId = GetNullableIntInput("Equipment ID"),
                            IncidentId = GetNullableIntInput("Incident ID"),
                            WorkOrderId = GetNullableIntInput("Work Order ID"),
                            PartId = GetIntInput("Part ID"),
                            Quantity = GetIntInput("Quantity"),
                            ReplacedBy = GetStringInput("Replaced By (User ID)"),
                            Status = GetStringInput("Status", "Chờ duyệt cấp phát"),
                        };
                        var result3 = await TestCreateAsync(request3);
                        if (result3 != null)
                            Console.WriteLine(FormatReplacement(result3));
                        break;
                    case "4":
                        var id4 = GetIntInput("Replacement ID to update");
                        var request4 = new ReplacementHistory
                        {
                            EquipmentId = GetNullableIntInput("Equipment ID"),
                            IncidentId = GetNullableIntInput("Incident ID"),
                            WorkOrderId = GetNullableIntInput("Work Order ID"),
                            PartId = GetIntInput("Part ID"),
                            Quantity = GetIntInput("Quantity"),
                            ReplacedDate = GetDateInput("Replaced Date"),
                            ReplacedBy = GetStringInput("Replaced By (User ID)"),
                            Status = GetStringInput("Status"),
                            ActualQuantityUsed = GetNullableIntInput("Actual Quantity Used"),
                            QuantityToReturn = GetNullableIntInput("Quantity To Return")
                        };
                        var result4 = await TestUpdateAsync(id4, request4);
                        if (result4 != null)
                            Console.WriteLine(FormatReplacement(result4));
                        break;
                    case "5":
                        var id5 = GetIntInput("Replacement ID to delete");
                        var result5 = await TestDeleteAsync(id5);
                        Console.WriteLine($"Delete result: {result5}");
                        break;
                    case "6":
                        var equipmentId6 = GetIntInput("Equipment ID");
                        var result6 = await TestGetByEquipmentIdAsync(equipmentId6);
                        Console.WriteLine($"Found {result6.Count()} replacement histories");
                        foreach (var replacement in result6)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "7":
                        var incidentId7 = GetIntInput("Incident ID");
                        var result7 = await TestGetByIncidentIdAsync(incidentId7);
                        Console.WriteLine($"Found {result7.Count()} replacement histories");
                        foreach (var replacement in result7)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "8":
                        var partId8 = GetIntInput("Part ID");
                        var result8 = await TestGetByPartIdAsync(partId8);
                        Console.WriteLine($"Found {result8.Count()} replacement histories");
                        foreach (var replacement in result8)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "9":
                        Console.Write("[INPUT] Enter User ID: ");
                        var userId9 = Console.ReadLine();
                        var result9 = await TestGetByUserIdAsync(userId9 ?? "");
                        Console.WriteLine($"Found {result9.Count()} replacement histories");
                        foreach (var replacement in result9)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "10":
                        var startDate10 = GetDateInput("Start Date");
                        var endDate10 = GetDateInput("End Date");
                        var result10 = await TestGetByDateRangeAsync(startDate10, endDate10);
                        Console.WriteLine($"Found {result10.Count()} replacement histories");
                        foreach (var replacement in result10)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "11":
                        Console.Write("[INPUT] Enter Status: ");
                        var status11 = Console.ReadLine();
                        var result11 = await TestGetByStatusAsync(status11 ?? "");
                        Console.WriteLine($"Found {result11.Count()} replacement histories");
                        foreach (var replacement in result11)
                        {
                            Console.WriteLine(FormatReplacement(replacement));
                        }
                        break;
                    case "12":
                        var id12 = GetIntInput("Replacement ID to confirm return");
                        var confirmationDto12 = new ReturnConfirmationDto
                        {
                            ActualQuantityUsed = GetNullableIntInput("Actual Quantity Used"),
                            ReturnedDate = GetDateInput("Returned Date"),
                            ReturnConfirmedBy = GetStringInput("Return Confirmed By")
                        };
                        var result12 = await TestConfirmReturnAsync(id12, confirmationDto12);
                        if (result12 != null)
                        {
                            Console.WriteLine(FormatReplacement(result12));
                            if (result12.QuantityToReturn.HasValue && result12.QuantityToReturn.Value > 0)
                            {
                                Console.WriteLine($"Quantity to return: {result12.QuantityToReturn.Value}");
                            }
                        }
                        break;
                    case "0":
                        Console.WriteLine("Tạm biệt!");
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
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetAllAsync()
    {
        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testReplacements);

        // Execute
        var result = await _service.GetAllAsync();

        Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count()} lịch sử thay thế");
        Console.WriteLine($"[LOG] INFO: Retrieved {result.Count()} records: [{string.Join(", ", result.Select(r => $"{{replacementId: {r.ReplacementId}, partId: {r.PartId}, quantity: {r.Quantity}, replacedBy: \"{r.ReplacedBy}\", status: \"{r.Status}\"}}"))}]");
        return result;
    }

    private async Task<ReplacementHistory?> TestGetByIdAsync(int id)
    {
        var replacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

        if (replacement != null)
        {
            _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(replacement);
        }
        else
        {
            // For non-existent items, we need to handle the exception in service
            _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Replacement not found"));
        }

        try
        {
            var result = await _service.GetByIdAsync(id);
            Console.WriteLine($"[LOG] INFO: Retrieved replacement ID: {id}");
            return result;
        }
        catch
        {
            Console.WriteLine($"[LOG] WARN: Replacement ID {id} not found");
            return null;
        }
    }

    private async Task<ReplacementHistory> TestCreateAsync(ReplacementHistory request)
    {
        // Setup mocks for validation
        var part = _testSpareParts.FirstOrDefault(p => p.PartId == request.PartId);
        var user = _testUsers.FirstOrDefault(u => u.Id == request.ReplacedBy);

        _mockSparePartRepository.Setup(x => x.GetByIdAsync(request.PartId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(part);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(request.ReplacedBy, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        if (request.EquipmentId.HasValue)
        {
            var equipment = _testEquipments.FirstOrDefault(e => e.EquipmentId == request.EquipmentId.Value);
            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);
        }

        if (request.IncidentId.HasValue)
        {
            var incident = _testIncidents.FirstOrDefault(i => i.IncidentId == request.IncidentId.Value);
            _mockIncidentRepository.Setup(x => x.GetByIdAsync(request.IncidentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident!);
        }

        if (request.WorkOrderId.HasValue)
        {
            var workOrder = _testWorkOrders.FirstOrDefault(w => w.WorkOrderId == request.WorkOrderId.Value);
            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(request.WorkOrderId.Value))
                .ReturnsAsync(workOrder!);
        }

        // Setup repository create
        var newReplacement = new ReplacementHistory
        {
            ReplacementId = _testReplacements.Max(r => r.ReplacementId) + 1,
            EquipmentId = request.EquipmentId,
            IncidentId = request.IncidentId,
            WorkOrderId = request.WorkOrderId,
            PartId = request.PartId,
            Quantity = request.Quantity,
            ReplacedDate = request.ReplacedDate ?? DateTime.Now,
            ReplacedBy = request.ReplacedBy,
            Status = request.Status,
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newReplacement);

        var result = await _service.CreateAsync(request);
        Console.WriteLine($"[LOG] INFO: Created replacement ID: {result.ReplacementId}, PartId: {request.PartId}, Qty: {request.Quantity}, User: {request.ReplacedBy}");
        return result;
    }

    private async Task<ReplacementHistory?> TestUpdateAsync(int id, ReplacementHistory request)
    {
        var existing = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);
        if (existing == null) return null;

        // Setup mocks for validation
        var part = _testSpareParts.FirstOrDefault(p => p.PartId == request.PartId);
        var user = _testUsers.FirstOrDefault(u => u.Id == request.ReplacedBy);

        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        _mockSparePartRepository.Setup(x => x.GetByIdAsync(request.PartId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(part);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(request.ReplacedBy, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        if (request.EquipmentId.HasValue)
        {
            var equipment = _testEquipments.FirstOrDefault(e => e.EquipmentId == request.EquipmentId.Value);
            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);
        }

        if (request.IncidentId.HasValue)
        {
            var incident = _testIncidents.FirstOrDefault(i => i.IncidentId == request.IncidentId.Value);
            _mockIncidentRepository.Setup(x => x.GetByIdAsync(request.IncidentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident!);
        }

        if (request.WorkOrderId.HasValue)
        {
            var workOrder = _testWorkOrders.FirstOrDefault(w => w.WorkOrderId == request.WorkOrderId.Value);
            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(request.WorkOrderId.Value))
                .ReturnsAsync(workOrder!);
        }

        // Setup repository update
        existing.EquipmentId = request.EquipmentId;
        existing.IncidentId = request.IncidentId;
        existing.WorkOrderId = request.WorkOrderId;
        existing.PartId = request.PartId;
        existing.Quantity = request.Quantity;
        existing.ReplacedDate = request.ReplacedDate;
        existing.ReplacedBy = request.ReplacedBy;
        existing.Status = request.Status;
        existing.ActualQuantityUsed = request.ActualQuantityUsed;
        existing.QuantityToReturn = request.QuantityToReturn;

        _mockRepository.Setup(x => x.UpdateAsync(existing, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var result = await _service.UpdateAsync(id, request);
        Console.WriteLine($"[LOG] INFO: Updated replacement ID: {id}, Status: {request.Status}, Used: {request.ActualQuantityUsed}, Return: {request.QuantityToReturn}");
        return result;
    }

    private async Task<bool> TestDeleteAsync(int id)
    {
        var existing = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

        if (existing != null)
        {
            _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);
            _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
        }
        else
        {
            _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Replacement not found"));
            _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
        }

        var result = await _service.DeleteAsync(id);
        if (result)
        {
            Console.WriteLine($"[LOG] INFO: Deleted replacement ID: {id}");
        }
        else
        {
            Console.WriteLine($"[LOG] WARN: Delete failed - ID {id} not found");
        }
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByEquipmentIdAsync(int equipmentId)
    {
        var replacements = _testReplacements.Where(r => r.EquipmentId == equipmentId);
        _mockRepository.Setup(x => x.GetByEquipmentIdAsync(equipmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByEquipmentIdAsync(equipmentId);
        Console.WriteLine($"[LOG] INFO: Retrieved records for equipment ID: {equipmentId}");
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByIncidentIdAsync(int incidentId)
    {
        var replacements = _testReplacements.Where(r => r.IncidentId == incidentId);
        _mockRepository.Setup(x => x.GetByIncidentIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByIncidentIdAsync(incidentId);
        Console.WriteLine($"[LOG] INFO: Retrieved records for incident ID: {incidentId}");
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByPartIdAsync(int partId)
    {
        var replacements = _testReplacements.Where(r => r.PartId == partId);
        _mockRepository.Setup(x => x.GetByPartIdAsync(partId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByPartIdAsync(partId);
        Console.WriteLine($"[LOG] INFO: Retrieved records for part ID: {partId}");
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByUserIdAsync(string userId)
    {
        var replacements = _testReplacements.Where(r => r.ReplacedBy == userId);
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByUserIdAsync(userId);
        Console.WriteLine($"[LOG] INFO: Retrieved records for user ID: {userId}");
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var replacements = _testReplacements.Where(r => r.ReplacedDate >= startDate && r.ReplacedDate <= endDate);
        _mockRepository.Setup(x => x.GetByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByDateRangeAsync(startDate, endDate);
        Console.WriteLine($"[LOG] INFO: Retrieved records for date range {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");
        return result;
    }

    private async Task<IEnumerable<ReplacementHistory>> TestGetByStatusAsync(string status)
    {
        var replacements = _testReplacements.Where(r => r.Status == status);
        _mockRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(replacements);

        var result = await _service.GetByStatusAsync(status);
        Console.WriteLine($"[LOG] INFO: Retrieved records with status: {status}");
        return result;
    }

    private async Task<ReplacementHistory?> TestConfirmReturnAsync(int replacementId, ReturnConfirmationDto confirmationDto)
    {
        var existing = _testReplacements.FirstOrDefault(r => r.ReplacementId == replacementId);
        if (existing == null) return null;

        _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        // Update the replacement
        existing.ActualQuantityUsed = confirmationDto.ActualQuantityUsed;
        existing.QuantityToReturn = (existing.Quantity - (confirmationDto.ActualQuantityUsed ?? 0));
        existing.ReturnedDate = confirmationDto.ReturnedDate;
        existing.ReturnConfirmedBy = confirmationDto.ReturnConfirmedBy;
        existing.Status = "Hoàn thành";

        _mockRepository.Setup(x => x.UpdateAsync(existing, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var result = await _service.ConfirmReturnAsync(replacementId, confirmationDto);
        if (result != null)
        {
            Console.WriteLine($"[LOG] INFO: Confirmed return ID: {replacementId}, Used: {confirmationDto.ActualQuantityUsed}, Return: {result.QuantityToReturn}, By: {confirmationDto.ReturnConfirmedBy}");
        }
        return result;
    }

    // Method GetPendingReturnAsync not implemented in repository interface
    // private async Task<IEnumerable<ReplacementHistory>> TestGetPendingReturnAsync()
    // {
    //     var pendingReturns = _testReplacements.Where(r =>
    //         r.QuantityToReturn.HasValue && r.QuantityToReturn.Value > 0 &&
    //         r.Status == "Đã cấp phát");
    //     _mockRepository.Setup(x => x.GetPendingReturnAsync(It.IsAny<CancellationToken>()))
    //         .ReturnsAsync(pendingReturns);

    //     var result = await _service.GetPendingReturnAsync();
    //     return result;
    // }

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

    private int? GetNullableIntInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (leave empty for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input))
            return null;
        if (int.TryParse(input, out int result))
            return result;
        return null;
    }

    private DateTime GetDateInput(string prompt)
    {
        while (true)
        {
            Console.Write($"[INPUT] {prompt} (yyyy-MM-dd): ");
            var input = Console.ReadLine();
            if (DateTime.TryParse(input, out DateTime result))
                return result;
            Console.WriteLine("Invalid date format. Please try again.");
        }
    }

    private bool GetBoolInput(string prompt, bool defaultValue)
    {
        Console.Write($"[INPUT] {prompt} (y/n, default: {(defaultValue ? "y" : "n")}): ");
        var input = Console.ReadLine()?.ToLower();
        if (string.IsNullOrWhiteSpace(input))
            return defaultValue;
        return input == "y" || input == "yes";
    }

    private List<int>? GetNullableIntArrayInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (comma-separated, leave empty for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input))
            return null;

        var parts = input.Split(',');
        var result = new List<int>();
        foreach (var part in parts)
        {
            if (int.TryParse(part.Trim(), out int num))
                result.Add(num);
        }
        return result.Count > 0 ? result : null;
    }

    private List<string>? GetStringArrayInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (comma-separated, leave empty for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input))
            return null;

        return input.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
    }

    private string FormatReplacement(ReplacementHistory replacement)
    {
        return $"ID: {replacement.ReplacementId}, Equipment: {replacement.EquipmentId}, Part: {replacement.PartId}, Quantity: {replacement.Quantity}, Status: {replacement.Status}, By: {replacement.ReplacedBy}";
    }

    // Test data initialization methods
    private List<SparePart> InitializeSparePartTestData()
    {
        return new List<SparePart>
        {
            new SparePart { PartId = 1, PartNumber = "SP001", PartName = "Motor Bearing", Quantity = 50, MinQuantity = 10 },
            new SparePart { PartId = 2, PartNumber = "SP002", PartName = "Belt Drive", Quantity = 25, MinQuantity = 5 },
            new SparePart { PartId = 3, PartNumber = "SP003", PartName = "Control Board", Quantity = 10, MinQuantity = 2 }
        };
    }

    private List<User> InitializeUserTestData()
    {
        return new List<User>
        {
            new User { Id = "USER001", UserName = "john.doe", Email = "john.doe@company.com", FullName = "John Doe" },
            new User { Id = "USER002", UserName = "jane.smith", Email = "jane.smith@company.com", FullName = "Jane Smith" },
            new User { Id = "USER003", UserName = "bob.johnson", Email = "bob.johnson@company.com", FullName = "Bob Johnson" }
        };
    }

    private List<Equipment> InitializeEquipmentTestData()
    {
        return new List<Equipment>
        {
            new Equipment { EquipmentId = 1, EquipmentCode = "EQ001", EquipmentName = "Conveyor Belt A1" },
            new Equipment { EquipmentId = 2, EquipmentCode = "EQ002", EquipmentName = "Motor Assembly B2" },
            new Equipment { EquipmentId = 3, EquipmentCode = "EQ003", EquipmentName = "Control Panel C3" }
        };
    }

    private List<IncidentHistory> InitializeIncidentTestData()
    {
        return new List<IncidentHistory>
        {
            new IncidentHistory { IncidentId = 1, Reason = "Machine Breakdown", Status = "Resolved" },
            new IncidentHistory { IncidentId = 2, Reason = "Maintenance Issue", Status = "Open" },
            new IncidentHistory { IncidentId = 3, Reason = "Quality Problem", Status = "In Progress" }
        };
    }

    private List<MaintenanceWorkOrder> InitializeWorkOrderTestData()
    {
        return new List<MaintenanceWorkOrder>
        {
            new MaintenanceWorkOrder { WorkOrderId = 1, WorkOrderCode = "WO001", Status = "Completed" },
            new MaintenanceWorkOrder { WorkOrderId = 2, WorkOrderCode = "WO002", Status = "In Progress" },
            new MaintenanceWorkOrder { WorkOrderId = 3, WorkOrderCode = "WO003", Status = "Pending" }
        };
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
                WorkOrderId = 1,
                PartId = 1,
                Quantity = 5,
                ReplacedDate = DateTime.Now.AddDays(-5),
                ReplacedBy = "USER001",
                Status = "Đã cấp phát"
            },
            new ReplacementHistory
            {
                ReplacementId = 2,
                EquipmentId = 2,
                IncidentId = 2,
                WorkOrderId = 2,
                PartId = 2,
                Quantity = 3,
                ReplacedDate = DateTime.Now.AddDays(-3),
                ReplacedBy = "USER002",
                Status = "Chờ duyệt cấp phát"
            },
            new ReplacementHistory
            {
                ReplacementId = 3,
                EquipmentId = 3,
                IncidentId = 3,
                WorkOrderId = 3,
                PartId = 3,
                Quantity = 2,
                ReplacedDate = DateTime.Now.AddDays(-1),
                ReplacedBy = "USER003",
                Status = "Hoàn thành"
            }
        };
    }
}