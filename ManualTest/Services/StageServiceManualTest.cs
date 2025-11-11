using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class StageServiceManualTest
{
    private readonly Mock<IStageRepository> _mockStageRepository;
    private readonly Mock<ILineRepository> _mockLineRepository;
    private readonly StageService _service;
    private readonly List<Stage> _testStages;
    private readonly List<Line> _testLines;

    public StageServiceManualTest()
    {
        _mockStageRepository = new Mock<IStageRepository>();
        _mockLineRepository = new Mock<ILineRepository>();
        _service = new StageService(_mockStageRepository.Object, _mockLineRepository.Object);
        _testLines = InitializeLineTestData();
        _testStages = InitializeStageTestData();
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
                    await TestGetStagesAsync();
                    break;
                case "2":
                    await TestGetActiveStagesAsync();
                    break;
                case "3":
                    await TestGetStageByIdAsync();
                    break;
                case "4":
                    await TestCreateStageAsync();
                    break;
                case "5":
                    await TestUpdateStageAsync();
                    break;
                case "6":
                    await TestToggleStageStatusAsync();
                    break;
                case "7":
                    await TestGetStagesByLineAsync();
                    break;
                case "8":
                    await TestGetStagesByUserLinesAsync();
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
        Console.WriteLine("STAGE SERVICE TEST MENU");
        Console.WriteLine("=======================");
        Console.WriteLine("1. Test GetStagesAsync");
        Console.WriteLine("2. Test GetActiveStagesAsync");
        Console.WriteLine("3. Test GetStageByIdAsync");
        Console.WriteLine("4. Test CreateStageAsync");
        Console.WriteLine("5. Test UpdateStageAsync");
        Console.WriteLine("6. Test ToggleStageStatusAsync");
        Console.WriteLine("7. Test GetStagesByLineAsync");
        Console.WriteLine("8. Test GetStagesByUserLinesAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetStagesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetStagesAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            _mockStageRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testStages);

            // Execute
            Console.WriteLine("[STATUS] Executing GetStagesAsync...");
            var result = await _service.GetStagesAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} stages");
            Console.WriteLine("\n[DATA] Stage List:");
            Console.WriteLine("----------------------------------------");
            foreach (var stage in result)
            {
                Console.WriteLine(FormatStage(stage));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[ERROR] StackTrace: {ex.StackTrace}");
        }
    }

    private async Task TestGetActiveStagesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetActiveStagesAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            var activeStages = _testStages.Where(s => s.IsActive).ToList();
            _mockStageRepository.Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(activeStages);

            // Execute
            Console.WriteLine("[STATUS] Executing GetActiveStagesAsync...");
            var result = await _service.GetActiveStagesAsync();

            // Verify
            var activeCount = _testStages.Count(s => s.IsActive);
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} active stages (Expected: {activeCount})");

            Console.WriteLine("\n[DATA] Active Stage List:");
            Console.WriteLine("----------------------------------------");
            foreach (var stage in result)
            {
                Console.WriteLine(FormatStage(stage));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetStageByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetStageByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Stage ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);

        var stage = _testStages.FirstOrDefault(s => s.StageId == id);

        if (stage == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stage);

        Console.WriteLine($"[STATUS] Executing GetStageByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetStageByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Stage found:");
                Console.WriteLine(FormatStage(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No stage found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateStageAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateStageAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Stage Name: ");
        var stageName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Description (or press Enter to skip): ");
        var description = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateStageRequest
        {
            StageName = stageName ?? "",
            LineId = lineId,
            Description = description
        };
        Console.WriteLine($"[INPUT DATA] StageName: {request.StageName}, LineId: {request.LineId}, Description: {request.Description}");

        // Setup mock
        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        var existingStagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStagesInLine);

        var newStage = new Stage
        {
            StageId = _testStages.Max(s => s.StageId) + 1,
            StageName = request.StageName.Trim(),
            LineId = request.LineId,
            IsActive = true
        };

        _mockStageRepository.Setup(x => x.CreateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newStage);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateStageAsync...");
            var result = await _service.CreateStageAsync(request);

            Console.WriteLine("[SUCCESS] Stage created successfully:");
            Console.WriteLine(FormatStage(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateStageAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateStageAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Stage ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingStage = _testStages.FirstOrDefault(s => s.StageId == id);

        if (existingStage == null)
        {
            Console.WriteLine($"[NOT FOUND] Stage with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing stage:");
            Console.WriteLine(FormatStage(existingStage));
        }

        Console.Write("\n[INPUT] Enter new Stage Name: ");
        var stageName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        Console.Write("[INPUT] Enter Description (or press Enter to skip): ");
        var description = Console.ReadLine();

        Console.Write("[INPUT] Enter Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingStage?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateStageRequest
        {
            StageName = stageName ?? existingStage?.StageName ?? "",
            LineId = lineId,
            Description = description,
            IsActive = isActive
        };
        Console.WriteLine($"[INPUT DATA] StageName: {request.StageName}, LineId: {request.LineId}, IsActive: {request.IsActive}");

        // Setup mock
        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStage);

        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        var existingStagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStagesInLine);

        var updatedStage = new Stage
        {
            StageId = id,
            StageName = request.StageName.Trim(),
            LineId = request.LineId,
            IsActive = request.IsActive
        };

        _mockStageRepository.Setup(x => x.UpdateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedStage);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateStageAsync...");
            var result = await _service.UpdateStageAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Stage updated successfully:");
                Console.WriteLine(FormatStage(result));
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

    private async Task TestToggleStageStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ToggleStageStatusAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Stage ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingStage = _testStages.FirstOrDefault(s => s.StageId == id);

        if (existingStage == null)
        {
            Console.WriteLine($"[NOT FOUND] Stage with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Stage:");
            Console.WriteLine(FormatStage(existingStage));
            Console.WriteLine($"[CURRENT STATUS] IsActive: {existingStage.IsActive}");
            Console.WriteLine($"[EXPECTED STATUS] Will toggle to: {!existingStage.IsActive}");
        }

        // Setup mock
        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStage);

        var toggledStage = existingStage != null ? new Stage
        {
            StageId = existingStage.StageId,
            StageName = existingStage.StageName,
            LineId = existingStage.LineId,
            IsActive = !existingStage.IsActive
        } : null;

        _mockStageRepository.Setup(x => x.UpdateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledStage);

        try
        {
            Console.WriteLine("[STATUS] Executing ToggleStageStatusAsync...");
            var result = await _service.ToggleStageStatusAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Status toggled successfully:");
                Console.WriteLine(FormatStage(result));
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

    private async Task TestGetStagesByLineAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetStagesByLineAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        var stagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();

        // Setup mock
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stagesInLine);

        Console.WriteLine($"[STATUS] Executing GetStagesByLineAsync with Line ID: {lineId}...");

        try
        {
            var result = await _service.GetStagesByLineAsync(lineId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} stages for line {lineId}");

            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] Stage List:");
                Console.WriteLine("----------------------------------------");
                foreach (var stage in result)
                {
                    Console.WriteLine(FormatStage(stage));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No stages found for this line");
            }

            _mockStageRepository.Verify(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetStagesByUserLinesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetStagesByUserLinesAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        try
        {
            // For testing, simulate some stages for the user's lines
            var userStages = _testStages.Take(3).ToList();

            // Setup mock
            _mockStageRepository.Setup(x => x.GetStagesByUserLinesAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(userStages);

            // Execute
            Console.WriteLine($"[STATUS] Executing GetStagesByUserLinesAsync for user: {userId}...");
            var result = await _service.GetStagesByUserLinesAsync(userId);

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} stages for user's lines");

            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] Stage List:");
                Console.WriteLine("----------------------------------------");
                foreach (var stage in result)
                {
                    Console.WriteLine(FormatStage(stage));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No stages found for this user's lines");
            }

            _mockStageRepository.Verify(x => x.GetStagesByUserLinesAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<Line> InitializeLineTestData()
    {
        return new List<Line>
        {
            new Line
            {
                LineId = 1,
                LineName = "Assembly Line 1",
                LineCode = "AL001",
                DepartmentId = 1,
                IsActive = true
            },
            new Line
            {
                LineId = 2,
                LineName = "Assembly Line 2",
                LineCode = "AL002",
                DepartmentId = 1,
                IsActive = true
            },
            new Line
            {
                LineId = 3,
                LineName = "Packaging Line 1",
                LineCode = "PL001",
                DepartmentId = 2,
                IsActive = true
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
                StageName = "Cutting Stage",
                LineId = 1,
                IsActive = true
            },
            new Stage
            {
                StageId = 2,
                StageName = "Sewing Stage",
                LineId = 1,
                IsActive = true
            },
            new Stage
            {
                StageId = 3,
                StageName = "Quality Check",
                LineId = 1,
                IsActive = true
            },
            new Stage
            {
                StageId = 4,
                StageName = "Finishing Stage",
                LineId = 2,
                IsActive = true
            },
            new Stage
            {
                StageId = 5,
                StageName = "Packaging Stage",
                LineId = 3,
                IsActive = false
            }
        };
    }

    private string FormatStage(Stage stage)
    {
        if (stage == null) return "[NULL]";

        return $"{{ID:{stage.StageId}, Name:\"{stage.StageName}\", LineID:{stage.LineId}, Active:{stage.IsActive}}}";
    }
}

