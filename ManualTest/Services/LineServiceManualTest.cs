using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class LineServiceManualTest
{
    private readonly Mock<ILineRepository> _mockLineRepository;
    private readonly Mock<IDepartmentRepository> _mockDepartmentRepository;
    private readonly LineService _service;
    private readonly List<Line> _testLines;
    private readonly List<Department> _testDepartments;

    public LineServiceManualTest()
    {
        _mockLineRepository = new Mock<ILineRepository>();
        _mockDepartmentRepository = new Mock<IDepartmentRepository>();
        _service = new LineService(_mockLineRepository.Object, _mockDepartmentRepository.Object);
        _testDepartments = InitializeDepartmentTestData();
        _testLines = InitializeLineTestData();
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
                    var linesResult = await TestGetLinesAsync();
                    foreach (var line in linesResult)
                    {
                        Console.WriteLine(FormatLine(line));
                    }
                    break;
                case "2":
                    var activeLinesResult = await TestGetActiveLinesAsync();
                    foreach (var line in activeLinesResult)
                    {
                        Console.WriteLine(FormatLine(line));
                    }
                    break;
                case "3":
                    var lineResult = await TestGetLineByIdAsync();
                    if (lineResult != null)
                    {
                        Console.WriteLine(FormatLine(lineResult));
                    }
                    break;
                case "4":
                    var createResult = await TestCreateLineAsync();
                    if (createResult != null)
                    {
                        Console.WriteLine(FormatLine(createResult));
                    }
                    break;
                case "5":
                    var updateResult = await TestUpdateLineAsync();
                    if (updateResult != null)
                    {
                        Console.WriteLine(FormatLine(updateResult));
                    }
                    break;
                case "6":
                    var departmentLinesResult = await TestGetLinesByDepartmentAsync();
                    foreach (var line in departmentLinesResult)
                    {
                        Console.WriteLine(FormatLine(line));
                    }
                    break;
                case "7":
                    var toggleResult = await TestToggleLineStatusAsync();
                    if (toggleResult != null)
                    {
                        Console.WriteLine(FormatLine(toggleResult));
                    }
                    break;
                case "8":
                    var userLinesResult = await TestGetLinesByUserAsync();
                    foreach (var line in userLinesResult)
                    {
                        Console.WriteLine(FormatLine(line));
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
        Console.WriteLine("MENU TEST LINE SERVICE");
        Console.WriteLine("======================");
        Console.WriteLine("1. Test GetLinesAsync");
        Console.WriteLine("2. Test GetActiveLinesAsync");
        Console.WriteLine("3. Test GetLineByIdAsync");
        Console.WriteLine("4. Test CreateLineAsync");
        Console.WriteLine("5. Test UpdateLineAsync");
        Console.WriteLine("6. Test GetLinesByDepartmentAsync");
        Console.WriteLine("7. Test ToggleLineStatusAsync");
        Console.WriteLine("8. Test GetLinesByUserAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task<IReadOnlyList<Line>> TestGetLinesAsync()
    {
        Console.WriteLine("TEST: GetLinesAsync");

        try
        {
            // Setup mock
            _mockLineRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testLines);

            // Execute
            var result = await _service.GetLinesAsync();

            // Verify
            _mockLineRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} dây chuyền");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Line>();
        }
    }

    private async Task<IReadOnlyList<Line>> TestGetActiveLinesAsync()
    {
        Console.WriteLine("TEST: GetActiveLinesAsync");

        try
        {
            // Setup mock
            _mockLineRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testLines);

            // Execute
            var result = await _service.GetActiveLinesAsync();

            // Verify
            var activeCount = _testLines.Count(l => l.IsActive);
            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} dây chuyền đang hoạt động (Mong đợi: {activeCount})");

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Line>();
        }
    }

    private async Task<Line> TestGetLineByIdAsync()
    {
        Console.WriteLine("TEST: GetLineByIdAsync");

        Console.Write("[INPUT] Enter Line ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var line = _testLines.FirstOrDefault(l => l.LineId == id);

        _mockLineRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        try
        {
            var result = await _service.GetLineByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine($"[THÀNH CÔNG] Tìm thấy dây chuyền với ID: {id}");
            }
            else
            {
                Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy dây chuyền với ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return null;
        }
    }

    private async Task<Line> TestCreateLineAsync()
    {
        Console.WriteLine("TEST: CreateLineAsync");

        Console.Write("[INPUT] Enter Line Name: ");
        var lineName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line Code: ");
        var lineCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        var request = new CreateLineRequest
        {
            LineName = lineName ?? "",
            LineCode = lineCode ?? "",
            DepartmentId = deptId
        };

        // Setup mock
        var department = _testDepartments.FirstOrDefault(d => d.DepartmentId == deptId);
        _mockDepartmentRepository.Setup(x => x.GetByIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var existingLinesInDept = _testLines.Where(l => l.DepartmentId == deptId).ToList();
        _mockLineRepository.Setup(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLinesInDept);

        // Normalize line name and line code as done in the service
        var normalizedLineName = System.Text.RegularExpressions.Regex.Replace(request.LineName.Trim(), @"\s+", " ");
        var normalizedLineCode = request.LineCode.Trim().ToUpper();

        var newLine = new Line
        {
            LineId = _testLines.Max(l => l.LineId) + 1,
            LineName = normalizedLineName,
            LineCode = normalizedLineCode,
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        _mockLineRepository.Setup(x => x.CreateAsync(It.IsAny<Line>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newLine);

        try
        {
            var result = await _service.CreateLineAsync(request);
            Console.WriteLine("[THÀNH CÔNG] Tạo dây chuyền thành công");
            return result;
        }
        catch (LineValidationException ex)
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

    private async Task<Line> TestUpdateLineAsync()
    {
        Console.WriteLine("TEST: UpdateLineAsync");

        Console.Write("[INPUT] Enter Line ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingLine = _testLines.FirstOrDefault(l => l.LineId == id);

        if (existingLine == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy dây chuyền với ID {id}");
            return null;
        }

        Console.Write("[INPUT] Enter new Line Name: ");
        var lineName = Console.ReadLine();

        Console.Write("[INPUT] Enter new Line Code: ");
        var lineCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        var request = new UpdateLineRequest
        {
            LineName = lineName ?? existingLine.LineName,
            LineCode = lineCode ?? existingLine.LineCode,
            DepartmentId = deptId,
            IsActive = existingLine.IsActive
        };

        // Setup mock
        var department = _testDepartments.FirstOrDefault(d => d.DepartmentId == deptId);
        _mockLineRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLine);

        _mockDepartmentRepository.Setup(x => x.GetByIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var existingLinesInDept = _testLines.Where(l => l.DepartmentId == deptId).ToList();
        _mockLineRepository.Setup(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLinesInDept);

        // Normalize line name and line code as done in the service
        var normalizedLineName = System.Text.RegularExpressions.Regex.Replace(request.LineName.Trim(), @"\s+", " ");
        var normalizedLineCode = request.LineCode.Trim().ToUpper();

        // Setup mock for UserLine removal if department changes
        if (existingLine.DepartmentId != request.DepartmentId)
        {
            _mockLineRepository.Setup(x => x.RemoveUserLinesForLineAsync(id, It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
        }

        var updatedLine = new Line
        {
            LineId = id,
            LineName = normalizedLineName,
            LineCode = normalizedLineCode,
            DepartmentId = request.DepartmentId,
            IsActive = request.IsActive
        };

        _mockLineRepository.Setup(x => x.UpdateAsync(It.IsAny<Line>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedLine);

        try
        {
            var result = await _service.UpdateLineAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[THÀNH CÔNG] Cập nhật dây chuyền thành công");
            }
            else
            {
                Console.WriteLine("[CẢNH BÁO] Cập nhật trả về null");
            }
            return result;
        }
        catch (LineValidationException ex)
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

    private async Task<IReadOnlyList<Line>> TestGetLinesByDepartmentAsync()
    {
        Console.WriteLine("TEST: GetLinesByDepartmentAsync");

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        var linesInDept = _testLines.Where(l => l.DepartmentId == deptId).ToList();

        // Setup mock
        _mockLineRepository.Setup(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(linesInDept);

        try
        {
            var result = await _service.GetLinesByDepartmentAsync(deptId);

            _mockLineRepository.Verify(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} dây chuyền cho phòng ban {deptId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Line>();
        }
    }

    private async Task<Line> TestToggleLineStatusAsync()
    {
        Console.WriteLine("TEST: ToggleLineStatusAsync");

        Console.Write("[INPUT] Enter Line ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingLine = _testLines.FirstOrDefault(l => l.LineId == id);

        if (existingLine == null)
        {
            Console.WriteLine($"[KHÔNG TÌM THẤY] Không tìm thấy dây chuyền với ID {id}");
            return null;
        }

        Console.WriteLine($"[TRẠNG THÁI] Sẽ chuyển từ {existingLine.IsActive} sang {!existingLine.IsActive}");

        // Setup mock
        var toggledLine = new Line
        {
            LineId = existingLine.LineId,
            LineName = existingLine.LineName,
            LineCode = existingLine.LineCode,
            DepartmentId = existingLine.DepartmentId,
            IsActive = !existingLine.IsActive
        };

        _mockLineRepository.Setup(x => x.ToggleLineStatusAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledLine);

        try
        {
            var result = await _service.ToggleLineStatusAsync(id);

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

    private async Task<IReadOnlyList<Line>> TestGetLinesByUserAsync()
    {
        Console.WriteLine("TEST: GetLinesByUserAsync");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[LỖI] User ID không được để trống.");
            return new List<Line>();
        }

        // Validate userId format
        if (userId.Length < 3)
        {
            Console.WriteLine("[LỖI] User ID phải có ít nhất 3 ký tự.");
            return new List<Line>();
        }

        // Simulate user validation - check if user exists
        var validUserIds = new[] { "USER001", "USER002", "USER003", "TECH001", "TECH002" };
        var userExists = validUserIds.Contains(userId.ToUpper());

        if (!userExists)
        {
            Console.WriteLine($"[LỖI] Không tìm thấy người dùng '{userId}' hoặc bị từ chối truy cập.");
            return new List<Line>();
        }

        // For testing, simulate different scenarios based on userId
        var userLines = userId.ToUpper() switch
        {
            "USER001" => _testLines.Where(l => l.DepartmentId == 1).ToList(), // Production dept lines
            "USER002" => _testLines.Where(l => l.DepartmentId == 2).ToList(), // Single line
            "USER003" => _testLines.Where(l => l.DepartmentId == 3).ToList(), // QC dept lines
            "TECH001" => _testLines.Where(l => l.IsActive).Take(3).ToList(), // Active lines
            "TECH002" => new List<Line>(), // No lines assigned
            _ => _testLines.Take(2).ToList() // Default fallback
        };

        // Setup mock
        _mockLineRepository.Setup(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userLines);

        try
        {
            var result = await _service.GetLinesByUserAsync(userId);

            _mockLineRepository.Verify(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[THÀNH CÔNG] Tìm thấy {result.Count} dây chuyền cho người dùng '{userId}'");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Xảy ra ngoại lệ: {ex.Message}");
            return new List<Line>();
        }
    }

    private List<Department> InitializeDepartmentTestData()
    {
        return new List<Department>
        {
            new Department
            {
                DepartmentId = 1,
                DepartmentName = "Production Department A",
                ManagerId = "MGR001",
                Description = "Main production facility",
                IsActive = true
            },
            new Department
            {
                DepartmentId = 2,
                DepartmentName = "Production Department B",
                ManagerId = "MGR002",
                Description = "Secondary production facility",
                IsActive = true
            },
            new Department
            {
                DepartmentId = 3,
                DepartmentName = "Quality Control",
                ManagerId = "MGR003",
                Description = "QC Department",
                IsActive = true
            }
        };
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
            },
            new Line
            {
                LineId = 4,
                LineName = "Inspection Line",
                LineCode = "IL001",
                DepartmentId = 3,
                IsActive = false
            },
            new Line
            {
                LineId = 5,
                LineName = "Testing Line",
                LineCode = "TL001",
                DepartmentId = 3,
                IsActive = true
            }
        };
    }

    private string FormatLine(Line line)
    {
        if (line == null) return "[NULL]";
        
        return $"{{ID:{line.LineId}, Name:\"{line.LineName}\", Code:\"{line.LineCode}\", DeptID:{line.DepartmentId}, Active:{line.IsActive}}}";
    }
}
