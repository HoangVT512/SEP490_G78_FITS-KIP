using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class IncidentServiceManualTest
{
    private readonly Mock<IIncidentRepository> _mockIncidentRepository;
    private readonly Mock<IEquipmentRepository> _mockEquipmentRepository;
    private readonly Mock<ILineRepository> _mockLineRepository;
    private readonly Mock<IShiftRepository> _mockShiftRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IAzureStorageService> _mockAzureStorageService;
    private readonly Mock<IReplacementHistoryRepository> _mockReplacementHistoryRepository;
    private readonly IncidentService _service;
    private readonly List<IncidentHistory> _testIncidents;
    private readonly List<Equipment> _testEquipments;
    private readonly List<Line> _testLines;
    private readonly List<User> _testUsers;

    public IncidentServiceManualTest()
    {
        _mockIncidentRepository = new Mock<IIncidentRepository>();
        _mockEquipmentRepository = new Mock<IEquipmentRepository>();
        _mockLineRepository = new Mock<ILineRepository>();
        _mockShiftRepository = new Mock<IShiftRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockNotificationService = new Mock<INotificationService>();
        _mockUserService = new Mock<IUserService>();
        _mockAzureStorageService = new Mock<IAzureStorageService>();
        _mockReplacementHistoryRepository = new Mock<IReplacementHistoryRepository>();
        
        _service = new IncidentService(
            _mockIncidentRepository.Object,
            _mockEquipmentRepository.Object,
            _mockLineRepository.Object,
            _mockShiftRepository.Object,
            _mockUserRepository.Object,
            _mockNotificationService.Object,
            _mockUserService.Object,
            _mockAzureStorageService.Object,
            _mockReplacementHistoryRepository.Object
        );

        _testEquipments = InitializeTestEquipments();
        _testLines = InitializeTestLines();
        _testUsers = InitializeTestUsers();
        _testIncidents = InitializeTestIncidents();
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
                    var incidentsResult = await TestGetAllIncidentsAsync();
                    foreach (var incident in incidentsResult)
                    {
                        Console.WriteLine(FormatIncident(incident));
                    }
                    break;
                case "2":
                    var incidentResult = await TestGetIncidentByIdAsync();
                    if (incidentResult != null)
                    {
                        Console.WriteLine(FormatIncident(incidentResult));
                    }
                    break;
                case "3":
                    var createResult = await TestCreateIncidentAsync();
                    if (createResult != null)
                    {
                        Console.WriteLine(FormatIncident(createResult));
                    }
                    break;
                case "4":
                    var updateResult = await TestUpdateIncidentAsync();
                    if (updateResult != null)
                    {
                        Console.WriteLine(FormatIncident(updateResult));
                    }
                    break;
                case "5":
                    var deleteResult = await TestDeleteIncidentAsync();
                    break;
                case "6":
                    var assignResult = await TestAssignTechnicianAsync();
                    break;
                case "7":
                    var userLinesResult = await TestGetIncidentsByUserLinesAsync();
                    foreach (var incident in userLinesResult)
                    {
                        Console.WriteLine(FormatIncident(incident));
                    }
                    break;
                case "8":
                    var technicianResult = await TestGetIncidentsAssignedToTechnicianAsync();
                    foreach (var incident in technicianResult)
                    {
                        Console.WriteLine(FormatIncident(incident));
                    }
                    break;
                case "9":
                    var bulkResult = await TestCreateBulkIncidentsAsync();
                    Console.WriteLine($"Bulk operation completed:");
                    Console.WriteLine($"  Success: {bulkResult.SuccessCount}");
                    Console.WriteLine($"  Failed: {bulkResult.FailureCount}");
                    Console.WriteLine($"  Total: {bulkResult.TotalRequested}");
                    if (bulkResult.Errors.Count > 0)
                    {
                        Console.WriteLine("Errors:");
                        foreach (var error in bulkResult.Errors)
                        {
                            Console.WriteLine($"  Index {error.Index}: {error.ErrorMessage}");
                        }
                    }
                    break;
                case "10":
                    var stopTypesResult = await TestGetStopTypesAsync();
                    Console.WriteLine($"Found {stopTypesResult.Count} stop types");
                    foreach (var stopType in stopTypesResult)
                    {
                        Console.WriteLine($"  - {stopType}");
                    }
                    break;
                case "11":
                    var downtimeStatsResult = await TestGetDowntimeStatsAsync();
                    Console.WriteLine($"Downtime Statistics:");
                    Console.WriteLine($"  Period: {downtimeStatsResult.Period}");
                    Console.WriteLine($"  Total Downtime: {downtimeStatsResult.TotalDowntime}h");
                    Console.WriteLine($"  Total Incidents: {downtimeStatsResult.TotalIncidents}");
                    break;
                case "12":
                    Console.Write("[INPUT] Enter Incident ID: ");
                    int.TryParse(Console.ReadLine(), out int incidentShiftsId);
                    var incidentShiftsResult = await TestGetIncidentShiftsAsync(incidentShiftsId);
                    Console.WriteLine($"Found {incidentShiftsResult.Count} incident shifts");
                    foreach (var shift in incidentShiftsResult)
                    {
                        Console.WriteLine($"  Shift {shift.ShiftId}: {shift.StartTime} - {shift.EndTime}");
                    }
                    break;
                case "13":
                    var imageUrl = await TestUploadIncidentImageAsync();
                    Console.WriteLine($"Image uploaded: {imageUrl}");
                    break;
                case "14":
                    Console.Write("[INPUT] Enter Incident ID: ");
                    int.TryParse(Console.ReadLine(), out int sparePartsId);
                    var sparePartsStatus = await TestGetSparePartsStatusAsync(sparePartsId);
                    Console.WriteLine($"Spare Parts Status for incident {sparePartsId}:");
                    Console.WriteLine($"  Has Pending Requests: {sparePartsStatus.HasPendingRequests}");
                    Console.WriteLine($"  Has Return Requests: {sparePartsStatus.HasReturnRequests}");
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
        Console.WriteLine("INCIDENT SERVICE TEST MENU");
        Console.WriteLine("==========================");
        Console.WriteLine("1. Test GetIncidentsAsync");
        Console.WriteLine("2. Test GetIncidentByIdAsync");
        Console.WriteLine("3. Test CreateIncidentAsync");
        Console.WriteLine("4. Test UpdateIncidentAsync");
        Console.WriteLine("5. Test DeleteIncidentAsync");
        Console.WriteLine("6. Test AssignTechnicianAsync");
        Console.WriteLine("7. Test GetIncidentsByUserLinesAsync");
        Console.WriteLine("8. Test GetIncidentsAssignedToTechnicianAsync");
        Console.WriteLine("9. Test CreateBulkIncidentsAsync");
        Console.WriteLine("10. Test GetStopTypesAsync");
        Console.WriteLine("11. Test GetDowntimeStatsAsync");
        Console.WriteLine("12. Test GetIncidentShiftsAsync");
        Console.WriteLine("13. Test UploadIncidentImageAsync");
        Console.WriteLine("14. Test GetSparePartsStatusAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task<IReadOnlyList<IncidentHistory>> TestGetAllIncidentsAsync()
    {
        Console.WriteLine("TEST: GetIncidentsAsync");

        // Setup mock
        _mockIncidentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testIncidents);

        // Execute
        var result = await _service.GetIncidentsAsync();

        // Verify
        _mockIncidentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        Console.WriteLine($"[SUCCESS] Found {result.Count} incidents");
        return result;
    }

    private async Task<IncidentHistory?> TestGetIncidentByIdAsync()
    {
        Console.WriteLine("TEST: GetIncidentByIdAsync");

        Console.Write("[INPUT] Enter Incident ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var incident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);

        _mockIncidentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incident);

        try
        {
            var result = await _service.GetIncidentByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine($"[SUCCESS] Incident found with ID: {id}");
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No incident found with ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }

    private async Task<IncidentHistory> TestCreateIncidentAsync()
    {
        Console.WriteLine("TEST: CreateIncidentAsync");

        Console.Write("[INPUT] Enter Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Issue Description: ");
        var issue = Console.ReadLine();

        Console.Write("[INPUT] Enter Type ID (1-5): ");
        int.TryParse(Console.ReadLine(), out int typeId);

        Console.Write("[INPUT] Enter Reported By User ID: ");
        var reportedBy = Console.ReadLine();

        var request = new CreateIncidentRequest
        {
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = issue,
            TypeId = typeId,
            StartTime = DateTime.Now,
            ReportedByUserId = reportedBy,
            IsTechSupport = false
        };

        // Setup mocks
        var equipment = _testEquipments.FirstOrDefault(e => e.EquipmentId == equipmentId);
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(equipmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        // Setup notification service mocks for technical support notifications
        var technicalManagers = _testUsers.Where(u => u.Id.StartsWith("TECH")).ToList();
        _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
            .ReturnsAsync(technicalManagers);

        var newIncident = new IncidentHistory
        {
            IncidentId = _testIncidents.Max(i => i.IncidentId) + 1,
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = issue,
            TypeId = typeId,
            StartTime = request.StartTime,
            Status = "Chờ xử lý",
            ReportedByUserId = reportedBy,
            IsTechSupport = false,
            CreatedDate = DateTime.Now,
            Equipment = equipment,
            Line = line
        };

        _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newIncident);

        try
        {
            var result = await _service.CreateIncidentAsync(request);
            Console.WriteLine("[SUCCESS] Incident created successfully");
            return result;
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] Invalid operation: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }

    private async Task<IncidentHistory?> TestUpdateIncidentAsync()
    {
        Console.WriteLine("TEST: UpdateIncidentAsync");

        Console.Write("[INPUT] Enter Incident ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);

        if (existingIncident == null)
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {id} not found");
            return null;
        }

        Console.Write("[INPUT] Enter new Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        Console.Write("[INPUT] Enter new Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter new Issue: ");
        var issue = Console.ReadLine();

        Console.Write("[INPUT] Enter Status (Chờ xử lý/Đang xử lý/Hoàn thành/Hủy): ");
        var status = Console.ReadLine();

        var request = new UpdateIncidentRequest
        {
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = issue ?? existingIncident.Issue,
            Status = status ?? existingIncident.Status,
            StartTime = existingIncident.StartTime ?? DateTime.Now,
            TypeId = existingIncident.TypeId,
            ReportedByUserId = existingIncident.ReportedByUserId,
            IsTechSupport = existingIncident.IsTechSupport
        };

        // Setup mocks
        _mockIncidentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingIncident);

        var equipment = _testEquipments.FirstOrDefault(e => e.EquipmentId == equipmentId);
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(equipmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        // Setup notification service mocks for technical support notifications
        var technicalManagers = _testUsers.Where(u => u.Id.StartsWith("TECH")).ToList();
        _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
            .ReturnsAsync(technicalManagers);

        _mockReplacementHistoryRepository.Setup(x => x.GetByIncidentIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ReplacementHistory>());

        var updatedIncident = new IncidentHistory
        {
            IncidentId = id,
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = request.Issue,
            Status = request.Status,
            StartTime = request.StartTime,
            TypeId = request.TypeId,
            ReportedByUserId = request.ReportedByUserId,
            IsTechSupport = request.IsTechSupport,
            Equipment = equipment,
            Line = line
        };

        _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedIncident);

        try
        {
            var result = await _service.UpdateIncidentAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Incident updated successfully");
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned null");
            }
            return result;
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] Invalid operation: {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }

    private async Task<bool> TestDeleteIncidentAsync()
    {
        Console.WriteLine("TEST: DeleteIncidentAsync");

        Console.Write("[INPUT] Enter Incident ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);
        if (existingIncident == null)
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {id} not found");
            return false;
        }

        Console.Write($"[CONFIRM] Delete incident '{existingIncident.Issue}'? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return false;
        }

        // Setup mock
        _mockIncidentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            var result = await _service.DeleteIncidentAsync(id);

            if (result)
            {
                Console.WriteLine("[SUCCESS] Incident deleted successfully");
            }
            else
            {
                Console.WriteLine("[FAILED] Failed to delete incident");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return false;
        }
    }

    private async Task<bool> TestAssignTechnicianAsync()
    {
        Console.WriteLine("TEST: AssignTechnicianAsync");

        Console.Write("[INPUT] Enter Incident ID: ");
        int.TryParse(Console.ReadLine(), out int incidentId);

        Console.Write("[INPUT] Enter Technician ID: ");
        var technicianId = Console.ReadLine();

        Console.Write("[INPUT] Update Status to 'Đang xử lý'? (true/false): ");
        bool.TryParse(Console.ReadLine(), out bool updateStatus);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == incidentId);
        if (existingIncident == null)
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {incidentId} not found");
            return false;
        }

        // Setup mocks
        _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingIncident);

        var technician = _testUsers.FirstOrDefault(u => u.Id == technicianId);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(technicianId!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(technician);

        if (existingIncident != null)
        {
            existingIncident.AssignedTo = technicianId;
            if (updateStatus)
            {
                existingIncident.Status = "Đang xử lý";
            }
        }

        _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingIncident);

        try
        {
            var result = await _service.AssignTechnicianAsync(incidentId, technicianId!, updateStatus);

            if (result)
            {
                Console.WriteLine("[SUCCESS] Technician assigned successfully");
            }
            else
            {
                Console.WriteLine("[FAILED] Failed to assign technician");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return false;
        }
    }

    private async Task<IReadOnlyList<IncidentHistory>> TestGetIncidentsByUserLinesAsync()
    {
        Console.WriteLine("TEST: GetIncidentsByUserLinesAsync");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        // Setup mocks - assuming user has access to lines 1 and 2
        var userLines = _testLines.Take(2).ToList();
        _mockLineRepository.Setup(x => x.GetLinesByUserAsync(userId!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userLines);

        var userIncidents = _testIncidents.Where(i =>
            userLines.Any(l => l.LineId == i.LineId)).ToList();

        _mockIncidentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testIncidents);

        try
        {
            var result = await _service.GetIncidentsByUserLinesAsync(userId!);
            Console.WriteLine($"[SUCCESS] Found {result.Count} incidents for user's lines");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new List<IncidentHistory>();
        }
    }

    private async Task<IReadOnlyList<IncidentHistory>> TestGetIncidentsAssignedToTechnicianAsync()
    {
        Console.WriteLine("TEST: GetIncidentsAssignedToTechnicianAsync");

        Console.Write("[INPUT] Enter Technician ID: ");
        var technicianId = Console.ReadLine();

        // Setup mock
        var technicianIncidents = _testIncidents.Where(i => i.AssignedTo == technicianId).ToList();
        _mockIncidentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testIncidents);

        try
        {
            var result = await _service.GetIncidentsAssignedToTechnicianAsync(technicianId!);
            Console.WriteLine($"[SUCCESS] Found {result.Count} incidents assigned to technician");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new List<IncidentHistory>();
        }
    }

    private async Task<BulkIncidentResponse> TestCreateBulkIncidentsAsync()
    {
        Console.WriteLine("TEST: CreateBulkIncidentsAsync");

        // Create a sample bulk request with multiple incidents
        var bulkRequest = new CreateBulkIncidentRequest
        {
            Incidents = new List<CreateIncidentRequest>
            {
                // Valid incident
                new CreateIncidentRequest
                {
                    EquipmentId = 1,
                    LineId = 1,
                    Issue = "Machine overheating test",
                    TypeId = 1,
                    StartTime = DateTime.Now.AddHours(-1),
                    EndTime = DateTime.Now,
                    ReportedByUserId = "USER001",
                    IsTechSupport = false,
                    ImageUrls = new List<string> { "test_image_1.jpg" }
                },
                // Invalid incident - equipment not found
                new CreateIncidentRequest
                {
                    EquipmentId = 999, // Non-existent equipment
                    LineId = 1,
                    Issue = "Invalid equipment test",
                    TypeId = 1,
                    StartTime = DateTime.Now.AddHours(-1),
                    ReportedByUserId = "USER001",
                    IsTechSupport = false
                },
                // Valid incident with technical support
                new CreateIncidentRequest
                {
                    EquipmentId = 2,
                    LineId = 2,
                    Issue = "Robot arm malfunction - needs tech support",
                    TypeId = 2,
                    StartTime = DateTime.Now.AddMinutes(-30),
                    ReportedByUserId = "USER001",
                    IsTechSupport = true,
                    ImageUrls = new List<string> { "test_image_2.jpg", "test_image_3.jpg" }
                }
            }
        };

        // Setup mocks for equipment validation
        foreach (var incident in bulkRequest.Incidents)
        {
            var equipment = _testEquipments.FirstOrDefault(e => e.EquipmentId == incident.EquipmentId);
            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(incident.EquipmentId ?? 0, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            var line = _testLines.FirstOrDefault(l => l.LineId == incident.LineId);
            _mockLineRepository.Setup(x => x.GetByIdAsync(incident.LineId ?? 0, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);
        }

        // Setup mock for technical managers (for notifications)
        var technicalManagers = _testUsers.Where(u => u.Id.StartsWith("TECH")).ToList();
        _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
            .ReturnsAsync(technicalManagers);

        // Setup mock for creating incidents - will return different incidents based on validation
        var incidentCounter = _testIncidents.Max(i => i.IncidentId);
        _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IncidentHistory incident) =>
            {
                incident.IncidentId = ++incidentCounter;
                incident.CreatedDate = DateTime.Now;
                return incident;
            });

        // Setup mock for updating incidents (for image saving)
        _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IncidentHistory incident) => incident);

        try
        {
            var result = await _service.CreateBulkIncidentsAsync(bulkRequest);

            Console.WriteLine($"[SUCCESS] Bulk incident creation completed");
            Console.WriteLine($"  Total requested: {result.TotalRequested}");
            Console.WriteLine($"  Success count: {result.SuccessCount}");
            Console.WriteLine($"  Failure count: {result.FailureCount}");

            if (result.SuccessfulIncidents.Count > 0)
            {
                Console.WriteLine("Successful incidents:");
                foreach (var incident in result.SuccessfulIncidents)
                {
                    Console.WriteLine($"  - Incident {incident.IncidentId}: {incident.Issue}");
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new BulkIncidentResponse
            {
                TotalRequested = bulkRequest.Incidents.Count,
                SuccessCount = 0,
                FailureCount = bulkRequest.Incidents.Count,
                Errors = new List<BulkIncidentError>
                {
                    new BulkIncidentError
                    {
                        Index = 0,
                        ErrorMessage = ex.Message,
                        FailedRequest = bulkRequest.Incidents.First()
                    }
                },
                SuccessfulIncidents = new List<IncidentHistoryDTO>()
            };
        }
    }

    private async Task<IReadOnlyList<dynamic>> TestGetStopTypesAsync()
    {
        Console.WriteLine("TEST: GetStopTypesAsync");

        // Setup mock with sample stop types
        var mockStopTypes = new List<dynamic>
        {
            new { TypeId = 1, TypeName = "Machine Breakdown" },
            new { TypeId = 2, TypeName = "Material Shortage" },
            new { TypeId = 3, TypeName = "Operator Error" },
            new { TypeId = 4, TypeName = "Maintenance" },
            new { TypeId = 5, TypeName = "Quality Issue" }
        };

        _mockIncidentRepository.Setup(x => x.GetStopTypesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockStopTypes);

        try
        {
            var result = await _service.GetStopTypesAsync();
            Console.WriteLine($"[SUCCESS] Retrieved {result.Count} stop types");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new List<dynamic>();
        }
    }

    private async Task<DowntimeStatsDTO> TestGetDowntimeStatsAsync()
    {
        Console.WriteLine("TEST: GetDowntimeStatsAsync");

        Console.Write("[INPUT] Enter period (day/week/month): ");
        var period = Console.ReadLine() ?? "day";

        Console.Write("[INPUT] Enter line ID (optional, press Enter for all): ");
        var lineIdInput = Console.ReadLine();
        int? lineId = string.IsNullOrEmpty(lineIdInput) ? null : int.Parse(lineIdInput);

        // Setup mock shifts
        var mockShifts = new List<Shift>
        {
            new Shift { ShiftId = 1, ShiftName = "Morning", StartTime = TimeOnly.Parse("06:00"), EndTime = TimeOnly.Parse("14:00") },
            new Shift { ShiftId = 2, ShiftName = "Afternoon", StartTime = TimeOnly.Parse("14:00"), EndTime = TimeOnly.Parse("22:00") },
            new Shift { ShiftId = 3, ShiftName = "Night", StartTime = TimeOnly.Parse("22:00"), EndTime = TimeOnly.Parse("06:00") }
        };

        _mockShiftRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockShifts);

        // Setup mock incidents with durations
        var today = DateTime.Now.Date;
        var mockIncidents = new List<IncidentHistory>
        {
            new IncidentHistory
            {
                IncidentId = 1,
                EquipmentId = 1,
                LineId = 1,
                StartTime = today.AddHours(8),
                EndTime = today.AddHours(10),
                Duration = 2.0m,
                TypeId = 1,
                Type = new StopType { TypeId = 1, TypeName = "Machine Breakdown" }
            },
            new IncidentHistory
            {
                IncidentId = 2,
                EquipmentId = 2,
                LineId = 1,
                StartTime = today.AddHours(15),
                EndTime = today.AddHours(16.5),
                Duration = 1.5m,
                TypeId = 2,
                Type = new StopType { TypeId = 2, TypeName = "Material Shortage" }
            },
            new IncidentHistory
            {
                IncidentId = 3,
                EquipmentId = 3,
                LineId = 2,
                StartTime = today.AddHours(9),
                EndTime = today.AddHours(11),
                Duration = 2.0m,
                TypeId = 1,
                Type = new StopType { TypeId = 1, TypeName = "Machine Breakdown" }
            }
        };

        if (lineId.HasValue)
        {
            var lineIncidents = mockIncidents.Where(i => i.LineId == lineId.Value).ToList();
            _mockIncidentRepository.Setup(x => x.GetByLineIdAsync(lineId.Value, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(lineIncidents);
        }
        else
        {
            _mockIncidentRepository.Setup(x => x.GetByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(mockIncidents);
        }

        // Setup line validation if lineId is provided
        if (lineId.HasValue)
        {
            var line = _testLines.FirstOrDefault(l => l.LineId == lineId.Value);
            _mockLineRepository.Setup(x => x.GetByIdAsync(lineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);
        }

        try
        {
            var result = await _service.GetDowntimeStatsAsync(period, lineId: lineId);
            Console.WriteLine($"[SUCCESS] Retrieved downtime statistics");
            return result;
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message}");
            throw;
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"[ARGUMENT ERROR] {ex.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }

    private async Task<IReadOnlyList<IncidentShift>> TestGetIncidentShiftsAsync(int incidentId)
    {
        Console.WriteLine($"TEST: GetIncidentShiftsAsync for incident {incidentId}");

        // Setup mock incident shifts
        var mockIncidentShifts = new List<IncidentShift>
        {
            new IncidentShift
            {
                IncidentId = incidentId,
                ShiftId = 1,
                StartTime = DateTime.Now.AddHours(-4),
                EndTime = DateTime.Now.AddHours(-2)
            },
            new IncidentShift
            {
                IncidentId = incidentId,
                ShiftId = 2,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now
            }
        };

        _mockIncidentRepository.Setup(x => x.GetIncidentShiftsAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockIncidentShifts);

        try
        {
            var result = await _service.GetIncidentShiftsAsync(incidentId);
            Console.WriteLine($"[SUCCESS] Retrieved {result.Count} incident shifts");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new List<IncidentShift>();
        }
    }

    private async Task<string> TestUploadIncidentImageAsync()
    {
        Console.WriteLine("TEST: UploadIncidentImageAsync");

        Console.Write("[INPUT] Enter image file path: ");
        var filePath = Console.ReadLine();

        if (string.IsNullOrEmpty(filePath))
        {
            Console.WriteLine("[CANCELLED] No file path provided");
            return string.Empty;
        }

        try
        {
            // Create a mock IFormFile from file path
            using var stream = File.OpenRead(filePath);
            var mockFile = new FormFile(stream, 0, stream.Length, "image", Path.GetFileName(filePath))
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            // Setup mock Azure storage service
            var mockUrl = $"https://storage.example.com/incidents/images/{Guid.NewGuid()}.jpg";
            _mockAzureStorageService.Setup(x => x.UploadFileAsync(mockFile, "incidents", "images", It.IsAny<CancellationToken>()))
                .ReturnsAsync(mockUrl);

            var result = await _service.UploadIncidentImageAsync(mockFile);
            Console.WriteLine($"[SUCCESS] Image uploaded successfully");
            return result;
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message}");
            return string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return string.Empty;
        }
    }

    private async Task<SparePartsStatus> TestGetSparePartsStatusAsync(int incidentId)
    {
        Console.WriteLine($"TEST: GetSparePartsStatusAsync for incident {incidentId}");

        // Setup mock replacement histories
        var mockReplacements = new List<ReplacementHistory>
        {
            new ReplacementHistory
            {
                ReplacementId = 1,
                IncidentId = incidentId,
                EquipmentId = 1,
                Status = "Chờ duyệt cấp phát",
                Part = new SparePart { PartId = 1, PartNumber = "SP001", PartName = "Test Part" },
                Quantity = 5
            },
            new ReplacementHistory
            {
                ReplacementId = 2,
                IncidentId = incidentId,
                EquipmentId = 1,
                Status = "Đã giao kho",
                Part = new SparePart { PartId = 2, PartNumber = "SP002", PartName = "Test Part 2" },
                Quantity = 3
            }
        };

        var incident = _testIncidents.FirstOrDefault(i => i.IncidentId == incidentId);
        _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incident);

        _mockReplacementHistoryRepository.Setup(x => x.GetByIncidentIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockReplacements.Where(r => r.IncidentId == incidentId).ToList());

        _mockReplacementHistoryRepository.Setup(x => x.GetByEquipmentIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockReplacements.Where(r => r.EquipmentId == incident?.EquipmentId).ToList());

        try
        {
            var result = await _service.GetSparePartsStatusAsync(incidentId);
            Console.WriteLine($"[SUCCESS] Retrieved spare parts status");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return new SparePartsStatus { HasPendingRequests = false, HasReturnRequests = false };
        }
    }

    private List<Equipment> InitializeTestEquipments()
    {
        return new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = 1,
                EquipmentName = "CNC Machine 1",
                EquipmentCode = "CNC-001",
                IsActive = true
            },
            new Equipment
            {
                EquipmentId = 2,
                EquipmentName = "Assembly Robot 1",
                EquipmentCode = "ROBOT-001",
                IsActive = true
            },
            new Equipment
            {
                EquipmentId = 3,
                EquipmentName = "Conveyor Belt A",
                EquipmentCode = "CONV-A01",
                IsActive = true
            }
        };
    }

    private List<Line> InitializeTestLines()
    {
        return new List<Line>
        {
            new Line
            {
                LineId = 1,
                LineName = "Production Line 1",
                IsActive = true
            },
            new Line
            {
                LineId = 2,
                LineName = "Production Line 2",
                IsActive = true
            },
            new Line
            {
                LineId = 3,
                LineName = "Assembly Line A",
                IsActive = true
            }
        };
    }

    private List<User> InitializeTestUsers()
    {
        return new List<User>
        {
            new User
            {
                Id = "USER001",
                FullName = "John Doe",
                Email = "john.doe@example.com"
            },
            new User
            {
                Id = "TECH001",
                FullName = "Technician One",
                Email = "tech1@example.com"
            },
            new User
            {
                Id = "TECH002",
                FullName = "Technician Two",
                Email = "tech2@example.com"
            }
        };
    }

    private List<IncidentHistory> InitializeTestIncidents()
    {
        return new List<IncidentHistory>
        {
            new IncidentHistory
            {
                IncidentId = 1,
                EquipmentId = 1,
                LineId = 1,
                StartTime = DateTime.Now.AddHours(-5),
                EndTime = DateTime.Now.AddHours(-3),
                Duration = 2.0m,
                TypeId = 1,
                Issue = "Machine overheating",
                Reason = "Cooling system failure",
                Solution = "Replaced cooling fan",
                Status = "Hoàn thành",
                ReportedByUserId = "USER001",
                AssignedTo = "TECH001",
                IsTechSupport = false,
                CreatedDate = DateTime.Now.AddHours(-5),
                Equipment = _testEquipments?.FirstOrDefault(e => e.EquipmentId == 1),
                Line = _testLines?.FirstOrDefault(l => l.LineId == 1)
            },
            new IncidentHistory
            {
                IncidentId = 2,
                EquipmentId = 2,
                LineId = 1,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = null,
                Duration = null,
                TypeId = 2,
                Issue = "Robot arm malfunction",
                Reason = null,
                Solution = null,
                Status = "Đang xử lý",
                ReportedByUserId = "USER001",
                AssignedTo = "TECH002",
                IsTechSupport = true,
                CreatedDate = DateTime.Now.AddHours(-2),
                Equipment = _testEquipments?.FirstOrDefault(e => e.EquipmentId == 2),
                Line = _testLines?.FirstOrDefault(l => l.LineId == 1)
            },
            new IncidentHistory
            {
                IncidentId = 3,
                EquipmentId = 3,
                LineId = 2,
                StartTime = DateTime.Now.AddMinutes(-30),
                EndTime = null,
                Duration = null,
                TypeId = 3,
                Issue = "Conveyor belt stopped",
                Reason = null,
                Solution = null,
                Status = "Chờ xử lý",
                ReportedByUserId = "USER001",
                AssignedTo = null,
                IsTechSupport = false,
                CreatedDate = DateTime.Now.AddMinutes(-30),
                Equipment = _testEquipments?.FirstOrDefault(e => e.EquipmentId == 3),
                Line = _testLines?.FirstOrDefault(l => l.LineId == 2)
            },
            new IncidentHistory
            {
                IncidentId = 4,
                EquipmentId = 1,
                LineId = 1,
                StartTime = DateTime.Now.AddDays(-1),
                EndTime = DateTime.Now.AddDays(-1).AddHours(1),
                Duration = 1.0m,
                TypeId = 1,
                Issue = "Machine not starting",
                Reason = "Power supply issue",
                Solution = "Reset circuit breaker",
                Status = "Hoàn thành",
                ReportedByUserId = "USER001",
                AssignedTo = "TECH001",
                IsTechSupport = false,
                CreatedDate = DateTime.Now.AddDays(-1),
                Equipment = _testEquipments?.FirstOrDefault(e => e.EquipmentId == 1),
                Line = _testLines?.FirstOrDefault(l => l.LineId == 1)
            }
        };
    }

    private string FormatIncident(IncidentHistory incident)
    {
        if (incident == null) return "[NULL]";

        var equipmentName = incident.Equipment?.EquipmentName ?? "N/A";
        var lineName = incident.Line?.LineName ?? "N/A";
        var status = incident.Status ?? "N/A";
        var issue = incident.Issue ?? "N/A";
        var assignedTo = incident.AssignedTo ?? "Unassigned";

        return $"ID: {incident.IncidentId}, Equipment: {equipmentName}, Line: {lineName}, " +
               $"Issue: {issue}, Status: {status}, Assigned: {assignedTo}, " +
               $"Start: {incident.StartTime:yyyy-MM-dd HH:mm}, End: {incident.EndTime?.ToString("yyyy-MM-dd HH:mm") ?? "N/A"}";
    }
}


