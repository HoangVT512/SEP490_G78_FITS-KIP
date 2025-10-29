using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class EquipmentServiceManualTest
{
    private readonly Mock<IEquipmentRepository> _mockEquipmentRepository;
    private readonly Mock<IStageRepository> _mockStageRepository;
    private readonly EquipmentService _service;
    private readonly List<Equipment> _testData;
    private readonly List<Stage> _stageTestData;

    public EquipmentServiceManualTest()
    {
        _mockEquipmentRepository = new Mock<IEquipmentRepository>();
        _mockStageRepository = new Mock<IStageRepository>();
        _service = new EquipmentService(_mockEquipmentRepository.Object, _mockStageRepository.Object);
        _testData = InitializeTestData();
        _stageTestData = InitializeStageTestData();
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
                    await TestGetEquipmentsAsync();
                    break;
                case "2":
                    await TestGetEquipmentByIdAsync();
                    break;
                case "3":
                    await TestCreateEquipmentAsync();
                    break;
                case "4":
                    await TestUpdateEquipmentAsync();
                    break;
                case "5":
                    await TestToggleEquipmentStatusAsync();
                    break;
                case "6":
                    await TestDeleteEquipmentAsync();
                    break;
                case "7":
                    await TestGetEquipmentsByStageAsync();
                    break;
                case "8":
                    await TestGenerateQRCodeAsync();
                    break;
                case "9":
                    await TestGetEquipmentsByTeamLeaderAsync();
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
        Console.WriteLine("EQUIPMENT SERVICE TEST MENU");
        Console.WriteLine("===========================");
        Console.WriteLine("1. Test GetEquipmentsAsync");
        Console.WriteLine("2. Test GetEquipmentByIdAsync ()");
        Console.WriteLine("3. Test CreateEquipmentAsync ()");
        Console.WriteLine("4. Test UpdateEquipmentAsync ()");
        Console.WriteLine("5. Test ToggleEquipmentStatusAsync ()");
        Console.WriteLine("6. Test DeleteEquipmentAsync ()");
        Console.WriteLine("7. Test GetEquipmentsByStageAsync ()");
        Console.WriteLine("8. Test GenerateQRCodeAsync ()");
        Console.WriteLine("9. Test GetEquipmentsByTeamLeaderAsync ()");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetEquipmentsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetEquipmentsAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        Console.WriteLine("[STATUS] Executing GetEquipmentsAsync...");
        var result = await _service.GetEquipmentsAsync();

        // Verify
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} equipments");
        Console.WriteLine("\n[DATA] Equipment List:");
        Console.WriteLine("----------------------------------------");
        foreach (var equipment in result)
        {
            Console.WriteLine(FormatEquipment(equipment));
        }

        // Verify repository call
        _mockEquipmentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Console.WriteLine("[VERIFY] Repository method called exactly once");
    }

    private async Task TestGetEquipmentByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetEquipmentByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);
        
        var equipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        if (equipment == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }
        
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        Console.WriteLine($"[STATUS] Executing GetEquipmentByIdAsync with ID: {id}...");
        
        try
        {
            var result = await _service.GetEquipmentByIdAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Equipment found:");
                Console.WriteLine(FormatEquipment(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No equipment found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateEquipmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateEquipmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment Code: ");
        var code = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Equipment Name: ");
        var name = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Date Use (yyyy-mm-dd) or press Enter for null: ");
        var dateUseInput = Console.ReadLine();
        DateOnly? dateUse = null;
        if (!string.IsNullOrWhiteSpace(dateUseInput) && DateOnly.TryParse(dateUseInput, out DateOnly parsedDate))
        {
            dateUse = parsedDate;
        }
        
        Console.Write("[INPUT] Enter Origin: ");
        var origin = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Year of Manufacture: ");
        var yomInput = Console.ReadLine();
        int? yom = null;
        if (!string.IsNullOrWhiteSpace(yomInput) && int.TryParse(yomInput, out int parsedYom))
        {
            yom = parsedYom;
        }
        
        Console.Write("[INPUT] Enter Stage ID (or press Enter for null): ");
        var stageIdInput = Console.ReadLine();
        int? stageId = null;
        if (!string.IsNullOrWhiteSpace(stageIdInput) && int.TryParse(stageIdInput, out int parsedStageId))
        {
            stageId = parsedStageId;
        }
        
        Console.Write("[INPUT] Enter Active status (true/false, default true): ");
        var activeInput = Console.ReadLine();
        bool isActive = true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateEquipmentRequest
        {
            EquipmentCode = code ?? "",
            EquipmentName = name ?? "",
            DateUse = dateUse,
            Origin = origin,
            Yom = yom,
            StageId = stageId,
            IsActive = isActive
        };
        Console.WriteLine($"[INPUT DATA] Code: {request.EquipmentCode}, Name: {request.EquipmentName}, DateUse: {request.DateUse?.ToString() ?? "null"}, Origin: {request.Origin ?? "null"}, Yom: {request.Yom?.ToString() ?? "null"}, StageId: {request.StageId?.ToString() ?? "null"}, IsActive: {request.IsActive}");

        // Setup mock for stage validation if stageId is provided
        if (stageId.HasValue)
        {
            var stage = _stageTestData.FirstOrDefault(s => s.StageId == stageId.Value);
            _mockStageRepository.Setup(x => x.GetByIdAsync(stageId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(stage);
        }

        // Setup mock for duplicate check
        _mockEquipmentRepository.Setup(x => x.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment?)null);

        var newEquipment = new Equipment
        {
            EquipmentId = _testData.Max(e => e.EquipmentId) + 1,
            EquipmentCode = request.EquipmentCode.ToUpper(),
            EquipmentName = request.EquipmentName,
            DateUse = request.DateUse,
            Origin = request.Origin,
            Yom = request.Yom,
            StageId = request.StageId,
            IsActive = request.IsActive,
            Qrcode = "{\"equipmentCode\":\"" + request.EquipmentCode.ToUpper() + "\"}"
        };

        _mockEquipmentRepository.Setup(x => x.CreateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newEquipment);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateEquipmentAsync...");
            var result = await _service.CreateEquipmentAsync(request);
            
            Console.WriteLine("[SUCCESS] Equipment created successfully:");
            Console.WriteLine(FormatEquipment(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateEquipmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateEquipmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        if (existingEquipment == null)
        {
            Console.WriteLine($"[NOT FOUND] Equipment with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing equipment:");
            Console.WriteLine(FormatEquipmentEntity(existingEquipment));
        }
        
        Console.Write("\n[INPUT] Enter new Equipment Code: ");
        var code = Console.ReadLine();
        
        Console.Write("[INPUT] Enter new Equipment Name: ");
        var name = Console.ReadLine();
        
        Console.Write("[INPUT] Enter new Date Use (yyyy-mm-dd) or press Enter to keep current: ");
        var dateUseInput = Console.ReadLine();
        DateOnly? dateUse = existingEquipment?.DateUse;
        if (!string.IsNullOrWhiteSpace(dateUseInput) && DateOnly.TryParse(dateUseInput, out DateOnly parsedDate))
        {
            dateUse = parsedDate;
        }
        
        Console.Write("[INPUT] Enter new Origin: ");
        var origin = Console.ReadLine();
        
        Console.Write("[INPUT] Enter new Year of Manufacture: ");
        var yomInput = Console.ReadLine();
        int? yom = existingEquipment?.Yom;
        if (!string.IsNullOrWhiteSpace(yomInput) && int.TryParse(yomInput, out int parsedYom))
        {
            yom = parsedYom;
        }
        
        Console.Write("[INPUT] Enter new Stage ID (or press Enter to keep current): ");
        var stageIdInput = Console.ReadLine();
        int? stageId = existingEquipment?.StageId;
        if (!string.IsNullOrWhiteSpace(stageIdInput) && int.TryParse(stageIdInput, out int parsedStageId))
        {
            stageId = parsedStageId;
        }
        
        Console.Write("[INPUT] Enter new Issue: ");
        var issue = Console.ReadLine();
        
        Console.Write("[INPUT] Enter new Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingEquipment?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateEquipmentRequest
        {
            EquipmentCode = code ?? existingEquipment?.EquipmentCode ?? "",
            EquipmentName = name ?? existingEquipment?.EquipmentName ?? "",
            DateUse = dateUse,
            Origin = origin ?? existingEquipment?.Origin,
            Yom = yom,
            StageId = stageId,
            IsActive = isActive
        };
        Console.WriteLine($"[INPUT DATA] Code: {request.EquipmentCode}, Name: {request.EquipmentName}, DateUse: {request.DateUse?.ToString() ?? "null"}, Origin: {request.Origin ?? "null"}, Yom: {request.Yom?.ToString() ?? "null"}, StageId: {request.StageId?.ToString() ?? "null"}, IsActive: {request.IsActive}");

        // Setup mock for stage validation if stageId is provided
        if (stageId.HasValue)
        {
            var stage = _stageTestData.FirstOrDefault(s => s.StageId == stageId.Value);
            _mockStageRepository.Setup(x => x.GetByIdAsync(stageId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(stage);
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);
        _mockEquipmentRepository.Setup(x => x.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment?)null);

        var updatedEquipment = new Equipment
        {
            EquipmentId = id,
            EquipmentCode = request.EquipmentCode.ToUpper(),
            EquipmentName = request.EquipmentName,
            DateUse = request.DateUse,
            Origin = request.Origin,
            Yom = request.Yom,
            StageId = request.StageId,
            IsActive = request.IsActive,
            Qrcode = "{\"equipmentCode\":\"" + request.EquipmentCode.ToUpper() + "\"}"
        };

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedEquipment);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateEquipmentAsync...");
            var result = await _service.UpdateEquipmentAsync(id, request);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Equipment updated successfully:");
                Console.WriteLine(FormatEquipment(result));
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

    private async Task TestToggleEquipmentStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ToggleEquipmentStatusAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        if (existingEquipment == null)
        {
            Console.WriteLine($"[NOT FOUND] Equipment with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Equipment:");
            Console.WriteLine(FormatEquipmentEntity(existingEquipment));
            Console.WriteLine($"[CURRENT STATUS] IsActive: {existingEquipment.IsActive}");
            Console.WriteLine($"[EXPECTED STATUS] Will toggle to: {!existingEquipment.IsActive}");
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        var toggledEquipment = new Equipment
        {
            EquipmentId = id,
            EquipmentCode = existingEquipment?.EquipmentCode ?? "",
            EquipmentName = existingEquipment?.EquipmentName ?? "",
            DateUse = existingEquipment?.DateUse,
            Origin = existingEquipment?.Origin,
            Yom = existingEquipment?.Yom,
            StageId = existingEquipment?.StageId,
            Issue = existingEquipment?.Issue,
            IsActive = !(existingEquipment?.IsActive ?? false),
            Qrcode = existingEquipment?.Qrcode
        };

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledEquipment);

        try
        {
            Console.WriteLine("[STATUS] Executing ToggleEquipmentStatusAsync...");
            var result = await _service.ToggleEquipmentStatusAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Status toggled successfully:");
                Console.WriteLine(FormatEquipment(result));
            }
            else
            {
                Console.WriteLine("[WARNING] Toggle returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteEquipmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteEquipmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        if (existingEquipment != null)
        {
            Console.WriteLine($"[WARNING] Will delete: {existingEquipment.EquipmentName} (ID: {id})");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Equipment with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete equipment with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);
        _mockEquipmentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteEquipmentAsync...");
            var result = await _service.DeleteEquipmentAsync(id);
            
            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Equipment deleted successfully" : "Failed to delete equipment")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetEquipmentsByStageAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetEquipmentsByStageAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Stage ID to get equipments: ");
        int.TryParse(Console.ReadLine(), out int stageId);

        var equipmentsInStage = _testData.Where(e => e.StageId == stageId).ToList();
        
        _mockEquipmentRepository.Setup(x => x.GetByStageIdAsync(stageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsInStage);

        try
        {
            Console.WriteLine($"[STATUS] Executing GetEquipmentsByStageAsync with Stage ID: {stageId}...");
            var result = await _service.GetEquipmentsByStageAsync(stageId);
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} equipments in stage {stageId}:");
            Console.WriteLine("\n[DATA] Equipment List:");
            Console.WriteLine("----------------------------------------");
            foreach (var equipment in result)
            {
                Console.WriteLine(FormatEquipment(equipment));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGenerateQRCodeAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GenerateQRCodeAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Equipment ID to generate QR code: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        if (existingEquipment == null)
        {
            Console.WriteLine($"[NOT FOUND] Equipment with ID {id} not found in test data");
        }
        
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        if (existingEquipment != null)
        {
            _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEquipment);
        }

        try
        {
            Console.WriteLine($"[STATUS] Executing GenerateQRCodeAsync with Equipment ID: {id}...");
            var result = await _service.GenerateQRCodeAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] QR Code generated successfully:");
                Console.WriteLine($"   Equipment: {existingEquipment?.EquipmentName}");
                Console.WriteLine($"   Code: {existingEquipment?.EquipmentCode}");
                Console.WriteLine($"   QR Code: {result}");
            }
            else
            {
                Console.WriteLine("[WARNING] QR Code generation returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetEquipmentsByTeamLeaderAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetEquipmentsByTeamLeaderAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID (Team Leader): ");
        var userId = Console.ReadLine();

        var equipmentsByTeamLeader = _testData.Where(e => e.Stage?.LineId != null).ToList();
        
        _mockEquipmentRepository.Setup(x => x.GetEquipmentsByTeamLeaderAsync(userId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsByTeamLeader);

        try
        {
            Console.WriteLine($"[STATUS] Executing GetEquipmentsByTeamLeaderAsync with User ID: {userId}...");
            var result = await _service.GetEquipmentsByUserLinesAsync(userId ?? "");
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} equipments for team leader {userId}:");
            Console.WriteLine("\n[DATA] Equipment List:");
            Console.WriteLine("----------------------------------------");
            foreach (var equipment in result)
            {
                Console.WriteLine(FormatEquipment(equipment));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<Equipment> InitializeTestData()
    {
        return new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = 1,
                EquipmentCode = "EQ001",
                EquipmentName = "Conveyor Belt A",
                DateUse = new DateOnly(2020, 1, 15),
                Origin = "Japan",
                Yom = 2019,
                StageId = 1,
                IsActive = true,
                Qrcode = "{\"equipmentCode\":\"EQ001\"}",
                Stage = new Stage { StageId = 1, StageName = "Assembly Stage 1", LineId = 1 }
            },
            new Equipment
            {
                EquipmentId = 2,
                EquipmentCode = "EQ002",
                EquipmentName = "Welding Machine B",
                DateUse = new DateOnly(2021, 3, 20),
                Origin = "Germany",
                Yom = 2020,
                StageId = 2,
                IsActive = true,
                Qrcode = "{\"equipmentCode\":\"EQ002\"}",
                Stage = new Stage { StageId = 2, StageName = "Welding Stage", LineId = 1 }
            },
            new Equipment
            {
                EquipmentId = 3,
                EquipmentCode = "EQ003",
                EquipmentName = "Quality Check Station",
                DateUse = new DateOnly(2019, 6, 10),
                Origin = "USA",
                Yom = 2018,
                StageId = 3,
                IsActive = false,
                Qrcode = "{\"equipmentCode\":\"EQ003\"}",
                Stage = new Stage { StageId = 3, StageName = "Quality Control", LineId = 2 }
            },
            new Equipment
            {
                EquipmentId = 4,
                EquipmentCode = "EQ004",
                EquipmentName = "Packaging Machine",
                DateUse = new DateOnly(2022, 8, 5),
                Origin = "China",
                Yom = 2021,
                StageId = 4,
                IsActive = true,
                Qrcode = "{\"equipmentCode\":\"EQ004\"}",
                Stage = new Stage { StageId = 4, StageName = "Packaging Stage", LineId = 2 }
            },
            new Equipment
            {
                EquipmentId = 5,
                EquipmentCode = "EQ005",
                EquipmentName = "Cutting Tool Station",
                DateUse = null,
                Origin = "Italy",
                Yom = 2022,
                StageId = null,
                IsActive = true,
                Qrcode = "{\"equipmentCode\":\"EQ005\"}",
                Stage = null
            }
        };
    }

    private List<Stage> InitializeStageTestData()
    {
        return new List<Stage>
        {
            new Stage
            {
                StageId = 1,
                StageName = "Assembly Stage 1",
                LineId = 1,
                IsActive = true,
                Line = new Line { LineId = 1, LineName = "Production Line A" }
            },
            new Stage
            {
                StageId = 2,
                StageName = "Welding Stage",
                LineId = 1,
                IsActive = true,
                Line = new Line { LineId = 1, LineName = "Production Line A" }
            },
            new Stage
            {
                StageId = 3,
                StageName = "Quality Control",
                LineId = 2,
                IsActive = true,
                Line = new Line { LineId = 2, LineName = "Production Line B" }
            },
            new Stage
            {
                StageId = 4,
                StageName = "Packaging Stage",
                LineId = 2,
                IsActive = true,
                Line = new Line { LineId = 2, LineName = "Production Line B" }
            }
        };
    }

    private string FormatEquipment(EquipmentDTO eq)
    {
        if (eq == null) return "[NULL]";
        
        return $"{{{eq.EquipmentId},\"{eq.EquipmentCode}\",\"{eq.EquipmentName}\",{(eq.DateUse.HasValue ? $"new DateOnly({eq.DateUse.Value.Year},{eq.DateUse.Value.Month},{eq.DateUse.Value.Day})" : "null")},\"{(eq.Origin ?? "null")}\",{(eq.Yom?.ToString() ?? "null")},\"{eq.Qrcode ?? "null"}\",{(eq.StageId?.ToString() ?? "null")},\"{(eq.StageName ?? "null")}\",{(eq.LineId?.ToString() ?? "null")},\"{(eq.LineName ?? "null")}\",{eq.IsActive.ToString().ToLower()}}}";
    }

    private string FormatEquipmentEntity(Equipment eq)
    {
        if (eq == null) return "[NULL]";
        
        return $"{{{eq.EquipmentId},\"{eq.EquipmentCode ?? "null"}\",\"{eq.EquipmentName ?? "null"}\",{(eq.DateUse.HasValue ? $"new DateOnly({eq.DateUse.Value.Year},{eq.DateUse.Value.Month},{eq.DateUse.Value.Day})" : "null")},\"{(eq.Origin ?? "null")}\",{(eq.Yom?.ToString() ?? "null")},\"{eq.Qrcode ?? "null"}\",{(eq.StageId?.ToString() ?? "null")},\"{(eq.Stage?.StageName ?? "null")}\",{(eq.Stage?.LineId?.ToString() ?? "null")},\"{(eq.Stage?.Line?.LineName ?? "null")}\",{eq.IsActive.ToString().ToLower()}}}";
    }
}
