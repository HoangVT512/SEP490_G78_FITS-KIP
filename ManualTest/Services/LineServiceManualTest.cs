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
                    await TestGetLinesAsync();
                    break;
                case "2":
                    await TestGetActiveLinesAsync();
                    break;
                case "3":
                    await TestGetLineByIdAsync();
                    break;
                case "4":
                    await TestCreateLineAsync();
                    break;
                case "5":
                    await TestUpdateLineAsync();
                    break;
                case "6":
                    await TestGetLinesByDepartmentAsync();
                    break;
                case "7":
                    await TestToggleLineStatusAsync();
                    break;
                case "8":
                    await TestGetLinesByUserAsync();
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

    private async Task TestGetLinesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetLinesAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            _mockLineRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testLines);

            // Execute
            Console.WriteLine("[STATUS] Executing GetLinesAsync...");
            var result = await _service.GetLinesAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} lines");
            Console.WriteLine("\n[DATA] Line List:");
            Console.WriteLine("----------------------------------------");
            foreach (var line in result)
            {
                Console.WriteLine(FormatLine(line));
            }

            // Verify repository call
            _mockLineRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            Console.WriteLine($"[ERROR] StackTrace: {ex.StackTrace}");
        }
    }

    private async Task TestGetActiveLinesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetActiveLinesAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock
            _mockLineRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testLines);

            // Execute
            Console.WriteLine("[STATUS] Executing GetActiveLinesAsync...");
            var result = await _service.GetActiveLinesAsync();

            // Verify
            var activeCount = _testLines.Count(l => l.IsActive);
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} active lines (Expected: {activeCount})");
            
            Console.WriteLine("\n[DATA] Active Line List:");
            Console.WriteLine("----------------------------------------");
            foreach (var line in result)
            {
                Console.WriteLine(FormatLine(line));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetLineByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetLineByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);

        var line = _testLines.FirstOrDefault(l => l.LineId == id);
        
        if (line == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockLineRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(line);

        Console.WriteLine($"[STATUS] Executing GetLineByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetLineByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Line found:");
                Console.WriteLine(FormatLine(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No line found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateLineAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateLineAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line Name: ");
        var lineName = Console.ReadLine();

        Console.Write("[INPUT] Enter Line Code: ");
        var lineCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateLineRequest
        {
            LineName = lineName ?? "",
            LineCode = lineCode ?? "",
            DepartmentId = deptId
        };
        Console.WriteLine($"[INPUT DATA] LineName: {request.LineName}, LineCode: {request.LineCode}, DepartmentId: {request.DepartmentId}");

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
            Console.WriteLine("[STATUS] Executing CreateLineAsync...");
            var result = await _service.CreateLineAsync(request);

            Console.WriteLine("[SUCCESS] Line created successfully:");
            Console.WriteLine(FormatLine(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateLineAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateLineAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingLine = _testLines.FirstOrDefault(l => l.LineId == id);
        
        if (existingLine == null)
        {
            Console.WriteLine($"[NOT FOUND] Line with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing line:");
            Console.WriteLine(FormatLine(existingLine));
        }

        Console.Write("\n[INPUT] Enter new Line Name: ");
        var lineName = Console.ReadLine();

        Console.Write("[INPUT] Enter new Line Code: ");
        var lineCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        Console.Write("[INPUT] Enter Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingLine?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateLineRequest
        {
            LineName = lineName ?? existingLine?.LineName ?? "",
            LineCode = lineCode ?? existingLine?.LineCode ?? "",
            DepartmentId = deptId,
            IsActive = isActive
        };
        Console.WriteLine($"[INPUT DATA] LineName: {request.LineName}, LineCode: {request.LineCode}, DepartmentId: {request.DepartmentId}, IsActive: {request.IsActive}");

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
            Console.WriteLine("[STATUS] Executing UpdateLineAsync...");
            var result = await _service.UpdateLineAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Line updated successfully:");
                Console.WriteLine(FormatLine(result));
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

    private async Task TestGetLinesByDepartmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetLinesByDepartmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        var linesInDept = _testLines.Where(l => l.DepartmentId == deptId).ToList();

        // Setup mock
        _mockLineRepository.Setup(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(linesInDept);

        Console.WriteLine($"[STATUS] Executing GetLinesByDepartmentAsync with Department ID: {deptId}...");

        try
        {
            var result = await _service.GetLinesByDepartmentAsync(deptId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} lines for department {deptId}");
            
            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] Line List:");
                Console.WriteLine("----------------------------------------");
                foreach (var line in result)
                {
                    Console.WriteLine(FormatLine(line));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No lines found for this department");
            }

            _mockLineRepository.Verify(x => x.GetByDepartmentIdAsync(deptId, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestToggleLineStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ToggleLineStatusAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Line ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingLine = _testLines.FirstOrDefault(l => l.LineId == id);
        
        if (existingLine == null)
        {
            Console.WriteLine($"[NOT FOUND] Line with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Line:");
            Console.WriteLine(FormatLine(existingLine));
            Console.WriteLine($"[CURRENT STATUS] IsActive: {existingLine.IsActive}");
            Console.WriteLine($"[EXPECTED STATUS] Will toggle to: {!existingLine.IsActive}");
        }

        // Setup mock
        var toggledLine = existingLine != null ? new Line
        {
            LineId = existingLine.LineId,
            LineName = existingLine.LineName,
            LineCode = existingLine.LineCode,
            DepartmentId = existingLine.DepartmentId,
            IsActive = !existingLine.IsActive
        } : null;

        _mockLineRepository.Setup(x => x.ToggleLineStatusAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledLine);

        try
        {
            Console.WriteLine("[STATUS] Executing ToggleLineStatusAsync...");
            var result = await _service.ToggleLineStatusAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Status toggled successfully:");
                Console.WriteLine(FormatLine(result));
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

    private async Task TestGetLinesByUserAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetLinesByUserAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        // For testing, simulate some lines assigned to the user
        var userLines = _testLines.Take(2).ToList();

        // Setup mock
        _mockLineRepository.Setup(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userLines);

        Console.WriteLine($"[STATUS] Executing GetLinesByUserAsync with User ID: {userId}...");

        try
        {
            var result = await _service.GetLinesByUserAsync(userId);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} lines for user '{userId}'");
            
            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] Line List:");
                Console.WriteLine("----------------------------------------");
                foreach (var line in result)
                {
                    Console.WriteLine(FormatLine(line));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No lines assigned to this user");
            }

            _mockLineRepository.Verify(x => x.GetLinesByUserAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
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
