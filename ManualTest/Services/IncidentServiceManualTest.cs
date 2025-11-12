using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
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


