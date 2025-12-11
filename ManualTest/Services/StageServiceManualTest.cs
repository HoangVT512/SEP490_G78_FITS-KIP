using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
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
                    var stagesResult = await TestGetStagesAsync();
                    foreach (var stage in stagesResult)
                    {
                        Console.WriteLine(FormatStage(stage));
                    }
                    break;
                case "2":
                    var activeStagesResult = await TestGetActiveStagesAsync();
                    foreach (var stage in activeStagesResult)
                    {
                        Console.WriteLine(FormatStage(stage));
                    }
                    break;
                case "3":
                    var stageResult = await TestGetStageByIdAsync();
                    if (stageResult != null)
                    {
                        Console.WriteLine(FormatStage(stageResult));
                    }
                    break;
                case "4":
                    var createResult = await TestCreateStageAsync();
                    if (createResult != null)
                    {
                        Console.WriteLine(FormatStage(createResult));
                    }
                    break;
                case "5":
                    var updateResult = await TestUpdateStageAsync();
                    if (updateResult != null)
                    {
                        Console.WriteLine(FormatStage(updateResult));
                    }
                    break;
                case "6":
                    var toggleResult = await TestToggleStageStatusAsync();
                    if (toggleResult != null)
                    {
                        Console.WriteLine(FormatStage(toggleResult));
                    }
                    break;
                case "7":
                    var lineStagesResult = await TestGetStagesByLineAsync();
                    foreach (var stage in lineStagesResult)
                    {
                        Console.WriteLine(FormatStage(stage));
                    }
                    break;
                case "8":
                    var userStagesResult = await TestGetStagesByUserLinesAsync();
                    foreach (var stage in userStagesResult)
                    {
                        Console.WriteLine(FormatStage(stage));
                    }
                    break;
                case "0":
                    Console.WriteLine("Tạm biệt!");
                    return;
                default:
                    Console.WriteLine("Lựa chọn không hợp lệ. Vui lòng thử lại.");
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

    private async Task<IReadOnlyList<Stage>> TestGetStagesAsync()
    {
        Console.WriteLine("TEST: GetStagesAsync");

        try
        {
            // Setup mock
            _mockStageRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testStages);

            // Execute
            var result = await _service.GetStagesAsync();

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} công đoạn");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Stage>();
        }
    }

    private async Task<IReadOnlyList<Stage>> TestGetActiveStagesAsync()
    {
        Console.WriteLine("TEST: GetActiveStagesAsync");

        try
        {
            // Setup mock
            var activeStages = _testStages.Where(s => s.IsActive).ToList();
            _mockStageRepository.Setup(x => x.GetActiveAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(activeStages);

            // Execute
            var result = await _service.GetActiveStagesAsync();

            // Verify
            var activeCount = _testStages.Count(s => s.IsActive);
            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} công đoạn đang hoạt động (Mong đợi: {activeCount})");

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Stage>();
        }
    }

    private async Task<Stage> TestGetStageByIdAsync()
    {
        Console.WriteLine("TEST: GetStageByIdAsync");

        Console.Write("[INPUT] Enter Stage ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var stage = _testStages.FirstOrDefault(s => s.StageId == id);

        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stage);

        try
        {
            var result = await _service.GetStageByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine($"[THÀNH CÔNG] Tìm thấy công đoạn với ID: {id}");
            }
            else
            {
                Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy công đoạn với ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return null;
        }
    }

    private async Task<Stage> TestCreateStageAsync()
    {
        Console.WriteLine("TEST: CreateStageAsync");

        Console.Write("[INPUT] Enter Stage Name: ");
        var stageName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        var request = new CreateStageRequest
        {
            StageName = stageName ?? "",
            LineId = lineId
        };

        // Setup mock
        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        var existingStagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStagesInLine);

        // Normalize stage name as done in the service
        var normalizedStageName = System.Text.RegularExpressions.Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        var newStage = new Stage
        {
            StageId = _testStages.Max(s => s.StageId) + 1,
            StageName = normalizedStageName,
            LineId = request.LineId,
            IsActive = true
        };

        _mockStageRepository.Setup(x => x.CreateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newStage);

        try
        {
            var result = await _service.CreateStageAsync(request);
            Console.WriteLine("[THÀNH CÔNG] Tạo công đoạn thành công");
            return result;
        }
        catch (StageValidationException ex)
        {
            Console.WriteLine($"[LỖI XÁC THỰC] {ex.Message} (Mã: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return null;
        }
    }

    private async Task<Stage> TestUpdateStageAsync()
    {
        Console.WriteLine("TEST: UpdateStageAsync");

        Console.Write("[INPUT] Enter Stage ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingStage = _testStages.FirstOrDefault(s => s.StageId == id);

        if (existingStage == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy công đoạn với ID {id}");
            return null;
        }

        Console.Write("[INPUT] Enter new Stage Name: ");
        var stageName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        var request = new UpdateStageRequest
        {
            StageName = stageName ?? existingStage.StageName,
            LineId = lineId,
            IsActive = existingStage.IsActive
        };

        // Setup mock
        var line = _testLines.FirstOrDefault(l => l.LineId == lineId);
        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStage);

        _mockLineRepository.Setup(x => x.GetByIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        var existingStagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStagesInLine);

        // Normalize stage name as done in the service
        var normalizedStageName = System.Text.RegularExpressions.Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        var updatedStage = new Stage
        {
            StageId = id,
            StageName = normalizedStageName,
            LineId = request.LineId,
            IsActive = request.IsActive
        };

        _mockStageRepository.Setup(x => x.UpdateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedStage);

        try
        {
            var result = await _service.UpdateStageAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Cập nhật công đoạn thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Cập nhật trả về null");
            }
            return result;
        }
        catch (StageValidationException ex)
        {
            Console.WriteLine($"[LỖI XÁC THỰC] {ex.Message} (Mã: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return null;
        }
    }

    private async Task<Stage> TestToggleStageStatusAsync()
    {
        Console.WriteLine("TEST: ToggleStageStatusAsync");

        Console.Write("[INPUT] Enter Stage ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingStage = _testStages.FirstOrDefault(s => s.StageId == id);

        if (existingStage == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy công đoạn với ID {id}");
            return null;
        }

        Console.WriteLine($"[STATUS] Will toggle from {existingStage.IsActive} to {!existingStage.IsActive}");

        // Setup mock
        _mockStageRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingStage);

        var toggledStage = new Stage
        {
            StageId = existingStage.StageId,
            StageName = existingStage.StageName,
            LineId = existingStage.LineId,
            IsActive = !existingStage.IsActive
        };

        _mockStageRepository.Setup(x => x.UpdateAsync(It.IsAny<Stage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledStage);

        try
        {
            var result = await _service.ToggleStageStatusAsync(id);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Chuyển đổi trạng thái thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Chuyển đổi trả về null");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return null;
        }
    }

    private async Task<IReadOnlyList<Stage>> TestGetStagesByLineAsync()
    {
        Console.WriteLine("TEST: GetStagesByLineAsync");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int lineId);

        var stagesInLine = _testStages.Where(s => s.LineId == lineId).ToList();

        // Setup mock
        _mockStageRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(stagesInLine);

        try
        {
            var result = await _service.GetStagesByLineAsync(lineId);

            _mockStageRepository.Verify(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} công đoạn cho dây chuyền {lineId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Stage>();
        }
    }

    private async Task<IReadOnlyList<Stage>> TestGetStagesByUserLinesAsync()
    {
        Console.WriteLine("TEST: GetStagesByUserLinesAsync");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[LỖI] ID người dùng không được để trống.");
            return new List<Stage>();
        }

        try
        {
            // For testing, simulate some stages for the user's lines
            var userStages = _testStages.Take(3).ToList();

            // Setup mock
            _mockStageRepository.Setup(x => x.GetStagesByUserLinesAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(userStages);

            var result = await _service.GetStagesByUserLinesAsync(userId);

            _mockStageRepository.Verify(x => x.GetStagesByUserLinesAsync(userId, It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} công đoạn cho các dây chuyền của người dùng");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Stage>();
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

