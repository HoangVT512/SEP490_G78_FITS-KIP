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
        Console.WriteLine("\nTesting GetEquipmentsAsync...");

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetEquipmentsAsync();

        // Verify
        Console.WriteLine($"Result: Found {result.Count} equipments");
        foreach (var equipment in result)
        {
            Console.WriteLine($"   - {equipment.EquipmentName} (Code: {equipment.EquipmentCode}, ID: {equipment.EquipmentId}, Active: {equipment.IsActive})");
        }

        // Verify repository call
        _mockEquipmentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private async Task TestGetEquipmentByIdAsync()
    {
        Console.WriteLine("\nTesting GetEquipmentByIdAsync ()...");
        Console.WriteLine("=============================================");

        Console.Write("Enter Equipment ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);
        
        var equipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        Console.WriteLine($"Executing GetEquipmentByIdAsync with ID: {id}...");
        
        try
        {
            var result = await _service.GetEquipmentByIdAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("Equipment found:");
                Console.WriteLine($"   Name: {result.EquipmentName}");
                Console.WriteLine($"   Code: {result.EquipmentCode}");
                Console.WriteLine($"   ID: {result.EquipmentId}");
                Console.WriteLine($"   Date Use: {result.DateUse}");
                Console.WriteLine($"   Origin: {result.Origin ?? "None"}");
                Console.WriteLine($"   Year of Manufacture: {result.Yom ?? 0}");
                Console.WriteLine($"   Stage: {result.StageName ?? "None"}");
                Console.WriteLine($"   Active: {result.IsActive}");
                Console.WriteLine($"   QR Code: {result.Qrcode ?? "None"}");
            }
            else
            {
                Console.WriteLine($"No equipment found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestCreateEquipmentAsync()
    {
        Console.WriteLine("\nTesting CreateEquipmentAsync ()...");
        Console.WriteLine("=============================================");

        Console.Write("Enter Equipment Code: ");
        var code = Console.ReadLine();
        
        Console.Write("Enter Equipment Name: ");
        var name = Console.ReadLine();
        
        Console.Write("Enter Date Use (yyyy-mm-dd) or press Enter for null: ");
        var dateUseInput = Console.ReadLine();
        DateOnly? dateUse = null;
        if (!string.IsNullOrWhiteSpace(dateUseInput) && DateOnly.TryParse(dateUseInput, out DateOnly parsedDate))
        {
            dateUse = parsedDate;
        }
        
        Console.Write("Enter Origin: ");
        var origin = Console.ReadLine();
        
        Console.Write("Enter Year of Manufacture: ");
        var yomInput = Console.ReadLine();
        int? yom = null;
        if (!string.IsNullOrWhiteSpace(yomInput) && int.TryParse(yomInput, out int parsedYom))
        {
            yom = parsedYom;
        }
        
        Console.Write("Enter Stage ID (or press Enter for null): ");
        var stageIdInput = Console.ReadLine();
        int? stageId = null;
        if (!string.IsNullOrWhiteSpace(stageIdInput) && int.TryParse(stageIdInput, out int parsedStageId))
        {
            stageId = parsedStageId;
        }
        
        Console.Write("Enter Issue: ");
        var issue = Console.ReadLine();
        
        Console.Write("Enter Active status (true/false, default true): ");
        var activeInput = Console.ReadLine();
        bool isActive = true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        var request = new CreateEquipmentRequest
        {
            EquipmentCode = code ?? "",
            EquipmentName = name ?? "",
            DateUse = dateUse,
            Origin = origin,
            Yom = yom,
            StageId = stageId,
            Issue = issue,
            IsActive = isActive
        };

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
            Issue = request.Issue,
            IsActive = request.IsActive,
            Qrcode = "{\"equipmentCode\":\"" + request.EquipmentCode.ToUpper() + "\"}"
        };

        _mockEquipmentRepository.Setup(x => x.CreateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newEquipment);

        try
        {
            Console.WriteLine("Executing CreateEquipmentAsync...");
            var result = await _service.CreateEquipmentAsync(request);
            
            Console.WriteLine("Equipment created successfully:");
            Console.WriteLine($"   Name: {result.EquipmentName}");
            Console.WriteLine($"   Code: {result.EquipmentCode}");
            Console.WriteLine($"   ID: {result.EquipmentId}");
            Console.WriteLine($"   Date Use: {result.DateUse}");
            Console.WriteLine($"   Origin: {result.Origin ?? "None"}");
            Console.WriteLine($"   Year of Manufacture: {result.Yom ?? 0}");
            Console.WriteLine($"   Stage: {result.StageName ?? "None"}");
            Console.WriteLine($"   Active: {result.IsActive}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestUpdateEquipmentAsync()
    {
        Console.WriteLine("\nTesting UpdateEquipmentAsync ()...");
        Console.WriteLine("============================================");

        Console.Write("Enter Equipment ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        Console.WriteLine($"Current equipment: {existingEquipment?.EquipmentName ?? "Not found"}");
        Console.Write("Enter new Equipment Code: ");
        var code = Console.ReadLine();
        
        Console.Write("Enter new Equipment Name: ");
        var name = Console.ReadLine();
        
        Console.Write("Enter new Date Use (yyyy-mm-dd) or press Enter to keep current: ");
        var dateUseInput = Console.ReadLine();
        DateOnly? dateUse = existingEquipment?.DateUse;
        if (!string.IsNullOrWhiteSpace(dateUseInput) && DateOnly.TryParse(dateUseInput, out DateOnly parsedDate))
        {
            dateUse = parsedDate;
        }
        
        Console.Write("Enter new Origin: ");
        var origin = Console.ReadLine();
        
        Console.Write("Enter new Year of Manufacture: ");
        var yomInput = Console.ReadLine();
        int? yom = existingEquipment?.Yom;
        if (!string.IsNullOrWhiteSpace(yomInput) && int.TryParse(yomInput, out int parsedYom))
        {
            yom = parsedYom;
        }
        
        Console.Write("Enter new Stage ID (or press Enter to keep current): ");
        var stageIdInput = Console.ReadLine();
        int? stageId = existingEquipment?.StageId;
        if (!string.IsNullOrWhiteSpace(stageIdInput) && int.TryParse(stageIdInput, out int parsedStageId))
        {
            stageId = parsedStageId;
        }
        
        Console.Write("Enter new Issue: ");
        var issue = Console.ReadLine();
        
        Console.Write("Enter new Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingEquipment?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        var request = new UpdateEquipmentRequest
        {
            EquipmentCode = code ?? existingEquipment?.EquipmentCode ?? "",
            EquipmentName = name ?? existingEquipment?.EquipmentName ?? "",
            DateUse = dateUse,
            Origin = origin ?? existingEquipment?.Origin,
            Yom = yom,
            StageId = stageId,
            Issue = issue ?? existingEquipment?.Issue,
            IsActive = isActive
        };

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
            Issue = request.Issue,
            IsActive = request.IsActive,
            Qrcode = "{\"equipmentCode\":\"" + request.EquipmentCode.ToUpper() + "\"}"
        };

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedEquipment);

        try
        {
            Console.WriteLine("Executing UpdateEquipmentAsync...");
            var result = await _service.UpdateEquipmentAsync(id, request);
            
            if (result != null)
            {
                Console.WriteLine("Equipment updated successfully:");
                Console.WriteLine($"   Name: {result.EquipmentName}");
                Console.WriteLine($"   Code: {result.EquipmentCode}");
                Console.WriteLine($"   ID: {result.EquipmentId}");
                Console.WriteLine($"   Date Use: {result.DateUse}");
                Console.WriteLine($"   Origin: {result.Origin ?? "None"}");
                Console.WriteLine($"   Year of Manufacture: {result.Yom ?? 0}");
                Console.WriteLine($"   Stage: {result.StageName ?? "None"}");
                Console.WriteLine($"   Active: {result.IsActive}");
            }
            else
            {
                Console.WriteLine("Update returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestToggleEquipmentStatusAsync()
    {
        Console.WriteLine("\nTesting ToggleEquipmentStatusAsync ()...");
        Console.WriteLine("==================================================");

        Console.Write("Enter Equipment ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        Console.WriteLine($"Current status: {existingEquipment?.IsActive ?? false}");

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
            Console.WriteLine("Executing ToggleEquipmentStatusAsync...");
            var result = await _service.ToggleEquipmentStatusAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("Status toggled successfully:");
                Console.WriteLine($"   Equipment: {result.EquipmentName}");
                Console.WriteLine($"   Code: {result.EquipmentCode}");
                Console.WriteLine($"   ID: {result.EquipmentId}");
                Console.WriteLine($"   New Status: {result.IsActive}");
            }
            else
            {
                Console.WriteLine("Toggle returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestDeleteEquipmentAsync()
    {
        Console.WriteLine("\nTesting DeleteEquipmentAsync ()...");
        Console.WriteLine("===========================================");

        Console.Write("Enter Equipment ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        Console.Write($"Are you sure you want to delete equipment with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("Delete cancelled");
            return;
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData.FirstOrDefault(e => e.EquipmentId == id));
        _mockEquipmentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("Executing DeleteEquipmentAsync...");
            var result = await _service.DeleteEquipmentAsync(id);
            
            Console.WriteLine($"Delete result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestGetEquipmentsByStageAsync()
    {
        Console.WriteLine("\nTesting GetEquipmentsByStageAsync ()...");
        Console.WriteLine("================================================");

        Console.Write("Enter Stage ID to get equipments: ");
        int.TryParse(Console.ReadLine(), out int stageId);

        var equipmentsInStage = _testData.Where(e => e.StageId == stageId).ToList();
        
        _mockEquipmentRepository.Setup(x => x.GetByStageIdAsync(stageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsInStage);

        try
        {
            Console.WriteLine($"Executing GetEquipmentsByStageAsync with Stage ID: {stageId}...");
            var result = await _service.GetEquipmentsByStageAsync(stageId);
            
            Console.WriteLine($"Found {result.Count} equipments in stage {stageId}:");
            foreach (var equipment in result)
            {
                Console.WriteLine($"   - {equipment.EquipmentName} (Code: {equipment.EquipmentCode}, Active: {equipment.IsActive})");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestGenerateQRCodeAsync()
    {
        Console.WriteLine("\nTesting GenerateQRCodeAsync ()...");
        Console.WriteLine("===========================================");

        Console.Write("Enter Equipment ID to generate QR code: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        if (existingEquipment != null)
        {
            _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingEquipment);
        }

        try
        {
            Console.WriteLine($"Executing GenerateQRCodeAsync with Equipment ID: {id}...");
            var result = await _service.GenerateQRCodeAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("QR Code generated successfully:");
                Console.WriteLine($"   Equipment: {existingEquipment?.EquipmentName}");
                Console.WriteLine($"   Code: {existingEquipment?.EquipmentCode}");
                Console.WriteLine($"   QR Code: {result}");
            }
            else
            {
                Console.WriteLine("QR Code generation returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestGetEquipmentsByTeamLeaderAsync()
    {
        Console.WriteLine("\nTesting GetEquipmentsByTeamLeaderAsync ()...");
        Console.WriteLine("=====================================================");

        Console.Write("Enter User ID (Team Leader): ");
        var userId = Console.ReadLine();

        var equipmentsByTeamLeader = _testData.Where(e => e.Stage?.LineId != null).ToList();
        
        _mockEquipmentRepository.Setup(x => x.GetEquipmentsByTeamLeaderAsync(userId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsByTeamLeader);

        try
        {
            Console.WriteLine($"Executing GetEquipmentsByTeamLeaderAsync with User ID: {userId}...");
            var result = await _service.GetEquipmentsByTeamLeaderAsync(userId ?? "");
            
            Console.WriteLine($"Found {result.Count} equipments for team leader {userId}:");
            foreach (var equipment in result)
            {
                Console.WriteLine($"   - {equipment.EquipmentName} (Code: {equipment.EquipmentCode}, Stage: {equipment.StageName})");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
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
}
