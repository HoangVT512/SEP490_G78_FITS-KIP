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
                    await TestGetAllIncidentsAsync();
                    break;
                case "2":
                    await TestGetIncidentByIdAsync();
                    break;
                case "3":
                    await TestCreateIncidentAsync();
                    break;
                case "4":
                    await TestUpdateIncidentAsync();
                    break;
                case "5":
                    await TestDeleteIncidentAsync();
                    break;
                case "6":
                    await TestAssignTechnicianAsync();
                    break;
                case "7":
                    await TestGetIncidentsByUserLinesAsync();
                    break;
                case "8":
                    await TestGetIncidentsAssignedToTechnicianAsync();
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

    private async Task TestGetAllIncidentsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetIncidentsAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockIncidentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testIncidents);

        // Execute
        Console.WriteLine("[STATUS] Executing GetIncidentsAsync...");
        var result = await _service.GetIncidentsAsync();

        // Verify
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} incidents");
        Console.WriteLine("\n[DATA] Incident List:");
        Console.WriteLine("----------------------------------------");
        foreach (var incident in result)
        {
            Console.WriteLine(FormatIncident(incident));
        }

        // Verify repository call
        _mockIncidentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Console.WriteLine("[VERIFY] Repository method called exactly once");
    }

    private async Task TestGetIncidentByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetIncidentByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Incident ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);

        var incident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);

        if (incident == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockIncidentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incident);

        Console.WriteLine($"[STATUS] Executing GetIncidentByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetIncidentByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Incident found:");
                Console.WriteLine(FormatIncident(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No incident found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateIncidentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateIncidentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Issue Description: ");
        var issue = Console.ReadLine();

        Console.Write("[INPUT] Enter Reason (optional): ");
        var reason = Console.ReadLine();

        Console.Write("[INPUT] Enter Type ID (1-5): ");
        int.TryParse(Console.ReadLine(), out int typeId);

        Console.Write("[INPUT] Enter Reported By User ID: ");
        var reportedBy = Console.ReadLine();

        Console.Write("[INPUT] Is Tech Support (true/false): ");
        bool.TryParse(Console.ReadLine(), out bool isTechSupport);

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateIncidentRequest
        {
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = issue,
            Reason = reason,
            TypeId = typeId,
            StartTime = DateTime.Now,
            ReportedByUserId = reportedBy,
            IsTechSupport = isTechSupport
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
            Reason = reason,
            TypeId = typeId,
            StartTime = request.StartTime,
            Status = "Chờ xử lý",
            ReportedByUserId = reportedBy,
            IsTechSupport = isTechSupport,
            CreatedDate = DateTime.Now,
            Equipment = equipment,
            Line = line
        };

        _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newIncident);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateIncidentAsync...");
            var result = await _service.CreateIncidentAsync(request);

            Console.WriteLine("[SUCCESS] Incident created successfully:");
            Console.WriteLine(FormatIncident(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateIncidentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateIncidentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Incident ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);

        if (existingIncident == null)
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing incident:");
            Console.WriteLine(FormatIncident(existingIncident));
        }

        Console.Write("\n[INPUT] Enter new Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int equipmentId);

        Console.Write("[INPUT] Enter new Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter new Issue: ");
        var issue = Console.ReadLine();

        Console.Write("[INPUT] Enter new Reason: ");
        var reason = Console.ReadLine();

        Console.Write("[INPUT] Enter new Solution: ");
        var solution = Console.ReadLine();

        Console.Write("[INPUT] Enter Status (Chờ xử lý/Đang xử lý/Hoàn thành/Hủy): ");
        var status = Console.ReadLine();

        Console.Write("[INPUT] Enter End Time (yyyy-MM-dd HH:mm:ss or press Enter to skip): ");
        var endTimeInput = Console.ReadLine();
        DateTime? endTime = null;
        if (!string.IsNullOrWhiteSpace(endTimeInput) && DateTime.TryParse(endTimeInput, out DateTime parsedEndTime))
        {
            endTime = parsedEndTime;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateIncidentRequest
        {
            EquipmentId = equipmentId,
            LineId = lineId,
            Issue = issue ?? existingIncident?.Issue,
            Reason = reason ?? existingIncident?.Reason,
            Solution = solution,
            Status = status ?? existingIncident?.Status,
            StartTime = existingIncident?.StartTime ?? DateTime.Now,
            EndTime = endTime,
            TypeId = existingIncident?.TypeId,
            ReportedByUserId = existingIncident?.ReportedByUserId,
            IsTechSupport = existingIncident?.IsTechSupport ?? false
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
            Reason = request.Reason,
            Solution = request.Solution,
            Status = request.Status,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
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
            Console.WriteLine("[STATUS] Executing UpdateIncidentAsync...");
            var result = await _service.UpdateIncidentAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Incident updated successfully:");
                Console.WriteLine(FormatIncident(result));
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

    private async Task TestDeleteIncidentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteIncidentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Incident ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == id);
        if (existingIncident != null)
        {
            Console.WriteLine($"[WARNING] Will delete incident ID: {id}");
            Console.WriteLine(FormatIncident(existingIncident));
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete incident with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockIncidentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteIncidentAsync...");
            var result = await _service.DeleteIncidentAsync(id);

            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Incident deleted successfully" : "Failed to delete incident")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestAssignTechnicianAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: AssignTechnicianAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Incident ID: ");
        int.TryParse(Console.ReadLine(), out int incidentId);

        Console.Write("[INPUT] Enter Technician ID: ");
        var technicianId = Console.ReadLine();

        Console.Write("[INPUT] Update Status to 'Đang xử lý'? (true/false): ");
        bool.TryParse(Console.ReadLine(), out bool updateStatus);

        var existingIncident = _testIncidents.FirstOrDefault(i => i.IncidentId == incidentId);
        if (existingIncident == null)
        {
            Console.WriteLine($"[NOT FOUND] Incident with ID {incidentId} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Incident:");
            Console.WriteLine(FormatIncident(existingIncident));
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
            Console.WriteLine("[STATUS] Executing AssignTechnicianAsync...");
            var result = await _service.AssignTechnicianAsync(incidentId, technicianId!, updateStatus);

            Console.WriteLine($"[SUCCESS] Assign technician result: {result}");
            if (result && existingIncident != null)
            {
                Console.WriteLine($"[RESULT] Technician {technicianId} assigned to incident {incidentId}");
                Console.WriteLine(FormatIncident(existingIncident));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetIncidentsByUserLinesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetIncidentsByUserLinesAsync");
        Console.WriteLine("=========================================");

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
            Console.WriteLine($"[STATUS] Executing GetIncidentsByUserLinesAsync for user: {userId}...");
            var result = await _service.GetIncidentsByUserLinesAsync(userId!);

            Console.WriteLine($"[SUCCESS] Found {result.Count} incidents for user's lines");
            Console.WriteLine("\n[DATA] Incident List:");
            Console.WriteLine("----------------------------------------");
            foreach (var incident in result)
            {
                Console.WriteLine(FormatIncident(incident));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetIncidentsAssignedToTechnicianAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetIncidentsAssignedToTechnicianAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Technician ID: ");
        var technicianId = Console.ReadLine();

        // Setup mock
        var technicianIncidents = _testIncidents.Where(i => i.AssignedTo == technicianId).ToList();
        _mockIncidentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testIncidents);

        try
        {
            Console.WriteLine($"[STATUS] Executing GetIncidentsAssignedToTechnicianAsync for technician: {technicianId}...");
            var result = await _service.GetIncidentsAssignedToTechnicianAsync(technicianId!);

            Console.WriteLine($"[SUCCESS] Found {result.Count} incidents assigned to technician");
            Console.WriteLine("\n[DATA] Incident List:");
            Console.WriteLine("----------------------------------------");
            foreach (var incident in result)
            {
                Console.WriteLine(FormatIncident(incident));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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


