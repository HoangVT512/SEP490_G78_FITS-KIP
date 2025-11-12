using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
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
        Console.WriteLine("LINE SERVICE TEST MENU");
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

            Console.WriteLine($"[SUCCESS] Found {result.Count} lines");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
            Console.WriteLine($"[SUCCESS] Found {result.Count} active lines (Expected: {activeCount})");

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
                Console.WriteLine($"[SUCCESS] Line found with ID: {id}");
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No line found with ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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

        var normalizedCode = lineCode?.Trim().ToUpper();
        var existingLineByCode = _testLines.FirstOrDefault(l => l.LineCode?.ToUpper() == normalizedCode);
        _mockLineRepository.Setup(x => x.GetByLineCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLineByCode);

        var newLine = new Line
        {
            LineId = _testLines.Max(l => l.LineId) + 1,
            LineName = request.LineName.Trim(),
            LineCode = request.LineCode.Trim().ToUpper(),
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        _mockLineRepository.Setup(x => x.CreateAsync(It.IsAny<Line>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newLine);

        try
        {
            var result = await _service.CreateLineAsync(request);
            Console.WriteLine("[SUCCESS] Line created successfully");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
            Console.WriteLine($"[NOT FOUND] Line with ID {id} not found");
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

        var normalizedCode = lineCode?.Trim().ToUpper();
        var existingLineByCode = _testLines.FirstOrDefault(l =>
            l.LineCode?.ToUpper() == normalizedCode && l.LineId != id);
        _mockLineRepository.Setup(x => x.GetByLineCodeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLineByCode);

        var updatedLine = new Line
        {
            LineId = id,
            LineName = request.LineName.Trim(),
            LineCode = request.LineCode.Trim().ToUpper(),
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
                Console.WriteLine("[SUCCESS] Line updated successfully");
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

            Console.WriteLine($"[SUCCESS] Found {result.Count} lines for department {deptId}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
            Console.WriteLine($"[NOT FOUND] Line with ID {id} not found");
            return null;
        }

        Console.WriteLine($"[STATUS] Will toggle from {existingLine.IsActive} to {!existingLine.IsActive}");

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
                Console.WriteLine("[SUCCESS] Status toggled successfully");
            }
            else
            {
                Console.WriteLine("[WARNING] Toggle returned null");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return new List<Line>();
        }

        // For testing, simulate some lines assigned to the user
        var userLines = _testLines.Take(2).ToList();

        // Setup mock
        _mockLineRepository.Setup(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userLines);

        try
        {
            var result = await _service.GetLinesByUserAsync(userId);

            _mockLineRepository.Verify(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()), Times.Once);

            Console.WriteLine($"[SUCCESS] Found {result.Count} lines for user '{userId}'");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
