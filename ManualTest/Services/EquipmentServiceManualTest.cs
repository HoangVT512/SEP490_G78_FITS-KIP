using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
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
                    var equipmentsResult = await TestGetEquipmentsAsync();
                    foreach (var equipment in equipmentsResult)
                    {
                        Console.WriteLine(FormatEquipment(equipment));
                    }
                    break;
                case "2":
                    var equipmentResult = await TestGetEquipmentByIdAsync();
                    if (equipmentResult != null)
                    {
                        Console.WriteLine(FormatEquipment(equipmentResult));
                    }
                    break;
                case "3":
                    var createResult = await TestCreateEquipmentAsync();
                    if (createResult != null)
                    {
                        Console.WriteLine(FormatEquipment(createResult));
                    }
                    break;
                case "4":
                    var updateResult = await TestUpdateEquipmentAsync();
                    if (updateResult != null)
                    {
                        Console.WriteLine(FormatEquipment(updateResult));
                    }
                    break;
                case "5":
                    var toggleResult = await TestToggleEquipmentStatusAsync();
                    if (toggleResult != null)
                    {
                        Console.WriteLine(FormatEquipment(toggleResult));
                    }
                    break;
                case "6":
                    var deleteResult = await TestDeleteEquipmentAsync();
                    break;
                case "7":
                    var stageEquipmentsResult = await TestGetEquipmentsByStageAsync();
                    foreach (var equipment in stageEquipmentsResult)
                    {
                        Console.WriteLine(FormatEquipment(equipment));
                    }
                    break;
                case "8":
                    var qrResult = await TestGenerateQRCodeAsync();
                    if (qrResult != null)
                    {
                        Console.WriteLine($"QR Code: {qrResult}");
                    }
                    break;
                case "9":
                    var qrCodeResult = await TestGenerateQRCodeByCodeAsync();
                    if (qrCodeResult != null)
                    {
                        Console.WriteLine($"QR Code: {qrCodeResult}");
                    }
                    break;
                case "10":
                    var userEquipmentsResult = await TestGetEquipmentsByUserLinesAsync();
                    foreach (var equipment in userEquipmentsResult)
                    {
                        Console.WriteLine(FormatEquipment(equipment));
                    }
                    break;
                case "11":
                    var lineEquipmentsResult = await TestGetEquipmentsByLineAsync();
                    foreach (var equipment in lineEquipmentsResult)
                    {
                        Console.WriteLine(FormatEquipment(equipment));
                    }
                    break;
                case "0":
                    Console.WriteLine("Tạm biệt!");
                    return;
                default:
                    Console.WriteLine("Lựa chọn không hợp lệ. Vui lòng thử lại.");
                    break;
            }

            Console.WriteLine("\nNhấn phím bất kỳ để tiếp tục...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("MENU TEST EQUIPMENT SERVICE");
        Console.WriteLine("============================");
        Console.WriteLine("1. Test GetEquipmentsAsync");
        Console.WriteLine("2. Test GetEquipmentByIdAsync");
        Console.WriteLine("3. Test CreateEquipmentAsync");
        Console.WriteLine("4. Test UpdateEquipmentAsync");
        Console.WriteLine("5. Test ToggleEquipmentStatusAsync");
        Console.WriteLine("6. Test DeleteEquipmentAsync");
        Console.WriteLine("7. Test GetEquipmentsByStageAsync");
        Console.WriteLine("8. Test GenerateQRCodeAsync (by ID)");
        Console.WriteLine("9. Test GenerateQRCodeAsync (by Code)");
        Console.WriteLine("10. Test GetEquipmentsByUserLinesAsync");
        Console.WriteLine("11. Test GetEquipmentsByLineAsync");
        Console.WriteLine("0. Thoát");
        Console.WriteLine();
        Console.Write("Nhập lựa chọn của bạn: ");
    }

    private async Task<IReadOnlyList<EquipmentDTO>> TestGetEquipmentsAsync()
    {
        Console.WriteLine("TEST: GetEquipmentsAsync");

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetEquipmentsAsync();

        // Verify
        _mockEquipmentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} thiết bị");
        return result;
    }

    private async Task<EquipmentDTO> TestGetEquipmentByIdAsync()
    {
        Console.WriteLine("TEST: GetEquipmentByIdAsync");

        Console.Write("[INPUT] Enter Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var equipment = _testData.FirstOrDefault(e => e.EquipmentId == id);

        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipment);

        try
        {
            var result = await _service.GetEquipmentByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine($"[THÀNH CÔNG] Tìm thấy thiết bị với ID: {id}");
            }
            else
            {
                Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy thiết bị với ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<EquipmentDTO> TestCreateEquipmentAsync()
    {
        Console.WriteLine("TEST: CreateEquipmentAsync");

        Console.Write("[INPUT] Enter Equipment Code: ");
        var code = Console.ReadLine();

        Console.Write("[INPUT] Enter Equipment Name: ");
        var name = Console.ReadLine();

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

        var request = new CreateEquipmentRequest
        {
            EquipmentCode = code ?? "",
            EquipmentName = name ?? "",
            Origin = origin,
            Yom = yom,
            StageId = stageId,
            IsActive = true
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

        // Normalize equipment code as done in the service
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        var newEquipment = new Equipment
        {
            EquipmentId = _testData.Max(e => e.EquipmentId) + 1,
            EquipmentCode = normalizedCode,
            EquipmentName = request.EquipmentName.Trim(),
            Origin = request.Origin?.Trim(),
            Yom = request.Yom,
            StageId = request.StageId,
            IsActive = request.IsActive,
            Qrcode = $"{{\"equipmentCode\":\"{normalizedCode}\"}}"
        };

        _mockEquipmentRepository.Setup(x => x.CreateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newEquipment);

        try
        {
            var result = await _service.CreateEquipmentAsync(request);
            Console.WriteLine("[THÀNH CÔNG] Tạo thiết bị thành công");
            return result;
        }
        catch (EquipmentValidationException ex)
        {
            Console.WriteLine($"[LỖI XÁC THỰC] {ex.Message} (Mã: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<EquipmentDTO> TestUpdateEquipmentAsync()
    {
        Console.WriteLine("TEST: UpdateEquipmentAsync");

        Console.Write("[INPUT] Enter Equipment ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);

        if (existingEquipment == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy thiết bị với ID {id}");
            return null;
        }

        Console.Write("[INPUT] Enter new Equipment Code: ");
        var code = Console.ReadLine();

        Console.Write("[INPUT] Enter new Equipment Name: ");
        var name = Console.ReadLine();

        Console.Write("[INPUT] Enter new Origin: ");
        var origin = Console.ReadLine();

        var request = new UpdateEquipmentRequest
        {
            EquipmentCode = code ?? existingEquipment.EquipmentCode,
            EquipmentName = name ?? existingEquipment.EquipmentName,
            Origin = origin ?? existingEquipment.Origin,
            IsActive = existingEquipment.IsActive
        };

        // Setup mock for stage validation if stageId is provided
        if (existingEquipment.StageId.HasValue)
        {
            var stage = _stageTestData.FirstOrDefault(s => s.StageId == existingEquipment.StageId.Value);
            _mockStageRepository.Setup(x => x.GetByIdAsync(existingEquipment.StageId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(stage);
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);
        _mockEquipmentRepository.Setup(x => x.GetByCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipment?)null);

        // Normalize equipment code as done in the service
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        var updatedEquipment = new Equipment
        {
            EquipmentId = id,
            EquipmentCode = normalizedCode,
            EquipmentName = request.EquipmentName.Trim(),
            Origin = request.Origin?.Trim(),
            Yom = request.Yom,
            DateUse = existingEquipment.DateUse,
            StageId = request.StageId,
            IsActive = request.IsActive,
            Qrcode = $"{{\"equipmentCode\":\"{normalizedCode}\"}}"
        };

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedEquipment);

        try
        {
            var result = await _service.UpdateEquipmentAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Cập nhật thiết bị thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Cập nhật trả về null");
            }
            return result;
        }
        catch (EquipmentValidationException ex)
        {
            Console.WriteLine($"[LỖI XÁC THỰC] {ex.Message} (Mã: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<EquipmentDTO> TestToggleEquipmentStatusAsync()
    {
        Console.WriteLine("TEST: ToggleEquipmentStatusAsync");

        Console.Write("[INPUT] Enter Equipment ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);

        if (existingEquipment == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Thiết bị với ID {id} không tìm thấy");
            return null;
        }

        Console.WriteLine($"[TRẠNG THÁI] Sẽ chuyển từ {existingEquipment.IsActive} sang {!existingEquipment.IsActive}");

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        var toggledEquipment = new Equipment
        {
            EquipmentId = id,
            EquipmentCode = existingEquipment.EquipmentCode,
            EquipmentName = existingEquipment.EquipmentName,
            Origin = existingEquipment.Origin,
            IsActive = !existingEquipment.IsActive,
            Qrcode = existingEquipment.Qrcode
        };

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledEquipment);

        try
        {
            var result = await _service.ToggleEquipmentStatusAsync(id);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Chuyển đổi trạng thái thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Toggle trả về null");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<bool> TestDeleteEquipmentAsync()
    {
        Console.WriteLine("TEST: DeleteEquipmentAsync");

        Console.Write("[INPUT] Enter Equipment ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);
        if (existingEquipment == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Thiết bị với ID {id} không tìm thấy");
            return false;
        }

        Console.Write($"[XÁC NHẬN] Xóa thiết bị '{existingEquipment.EquipmentName}'? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[HỦY] Thao tác xóa đã bị hủy");
            return false;
        }

        // Setup mock
        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);
        _mockEquipmentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            var result = await _service.DeleteEquipmentAsync(id);

            if (result)
            {
                Console.WriteLine("[THÀNH CÔNG] Xóa thiết bị thành công");
            }
            else
            {
                Console.WriteLine("[THẤT BẠI] Không thể xóa thiết bị");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return false;
        }
    }

    private async Task<IReadOnlyList<EquipmentDTO>> TestGetEquipmentsByStageAsync()
    {
        Console.WriteLine("TEST: GetEquipmentsByStageAsync");

        Console.Write("[INPUT] Enter Stage ID: ");
        int.TryParse(Console.ReadLine(), out int stageId);

        var equipmentsInStage = _testData.Where(e => e.StageId == stageId).ToList();

        _mockEquipmentRepository.Setup(x => x.GetByStageIdAsync(stageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsInStage);

        try
        {
            var result = await _service.GetEquipmentsByStageAsync(stageId);
            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} thiết bị trong công đoạn {stageId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return new List<EquipmentDTO>();
        }
    }

    private async Task<string> TestGenerateQRCodeAsync()
    {
        Console.WriteLine("TEST: GenerateQRCodeAsync (by Equipment ID)");

        Console.Write("[INPUT] Enter Equipment ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingEquipment = _testData.FirstOrDefault(e => e.EquipmentId == id);

        if (existingEquipment == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Thiết bị với ID {id} không tìm thấy");
            return null;
        }

        _mockEquipmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        _mockEquipmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Equipment>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEquipment);

        try
        {
            var result = await _service.GenerateQRCodeAsync(id);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Tạo mã QR thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Tạo mã QR trả về null");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<string> TestGenerateQRCodeByCodeAsync()
    {
        Console.WriteLine("TEST: GenerateQRCodeAsync (by Equipment Code)");

        Console.Write("[INPUT] Enter Equipment Code: ");
        var equipmentCode = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(equipmentCode))
        {
            Console.WriteLine("[LỖI] Mã thiết bị không được để trống");
            return null;
        }

        try
        {
            var result = await _service.GenerateQRCodeAsync(equipmentCode);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Tạo mã QR thành công");
                Console.WriteLine($"Generated QR Code: {result}");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Tạo mã QR trả về null");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return null;
        }
    }

    private async Task<IReadOnlyList<EquipmentDTO>> TestGetEquipmentsByUserLinesAsync()
    {
        Console.WriteLine("TEST: GetEquipmentsByUserLinesAsync");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[LỖI] User ID không được để trống");
            return new List<EquipmentDTO>();
        }

        // For demo purposes, return equipments based on userId
        // In real implementation, this would be based on user's assigned lines/equipments
        var equipmentsByUser = userId.ToLower() switch
        {
            "tl001" => _testData.Where(e => e.StageId == 1 || e.StageId == 2).ToList(), // User for Line 1
            "tl002" => _testData.Where(e => e.StageId == 3 || e.StageId == 4).ToList(), // User for Line 2
            _ => _testData.Where(e => e.Stage?.LineId != null).ToList() // Default: all equipments with lines
        };

        _mockEquipmentRepository.Setup(x => x.GetEquipmentsByTeamLeaderAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsByUser);

        try
        {
            var result = await _service.GetEquipmentsByUserLinesAsync(userId);
            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} thiết bị cho người dùng {userId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return new List<EquipmentDTO>();
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

    private async Task<IReadOnlyList<EquipmentDTO>> TestGetEquipmentsByLineAsync()
    {
        Console.WriteLine("TEST: GetEquipmentsByLineAsync");

        Console.Write("[INPUT] Enter Line ID: ");
        var lineIdInput = Console.ReadLine();
        if (!int.TryParse(lineIdInput, out var lineId))
        {
            Console.WriteLine("[LỖI] Line ID không hợp lệ");
            return new List<EquipmentDTO>();
        }

        // Mock data: equipments with stages that belong to the line
        var equipmentsByLine = _testData.Where(e => e.Stage?.LineId == lineId).ToList();

        _mockEquipmentRepository.Setup(x => x.GetByLineIdAsync(lineId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipmentsByLine);

        try
        {
            var result = await _service.GetEquipmentsByLineAsync(lineId);
            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} thiết bị cho dây chuyền {lineId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
            return new List<EquipmentDTO>();
        }
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
