using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class DepartmentServiceManualTest
{
    private readonly Mock<IDepartmentRepository> _mockRepository;
    private readonly DepartmentService _service;
    private readonly List<Department> _testData;

    public DepartmentServiceManualTest()
    {
        _mockRepository = new Mock<IDepartmentRepository>();
        _service = new DepartmentService(_mockRepository.Object);
        _testData = InitializeTestData();
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
                    await TestGetAllAsync();
                    break;
                case "2":
                    await TestGetActiveAsync();
                    break;
                case "3":
                    await TestGetByIdAsync();
                    break;
                case "4":
                    await TestCreateAsync();
                    break;
                case "5":
                    await TestUpdateAsync();
                    break;
                case "6":
                    await TestToggleStatusAsync();
                    break;
                case "7":
                    await TestDeleteAsync();
                    break;
                case "8":
                    Console.WriteLine("All tests option removed. Please use individual test options.");
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
        Console.WriteLine("DEPARTMENT SERVICE TEST MENU");
        Console.WriteLine("=============================");
        Console.WriteLine("1. Test GetAllAsync");
        Console.WriteLine("2. Test GetActiveAsync");
        Console.WriteLine("3. Test GetByIdAsync ()");
        Console.WriteLine("4. Test CreateAsync ()");
        Console.WriteLine("5. Test UpdateAsync ()");
        Console.WriteLine("6. Test ToggleStatusAsync ()");
        Console.WriteLine("7. Test DeleteAsync ()");
        Console.WriteLine("8. Run All Tests");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }



    private async Task TestGetAllAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetAllAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        Console.WriteLine("[STATUS] Executing GetAllAsync...");
        var result = await _service.GetAllAsync();

        // Verify
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} departments");
        Console.WriteLine("\n[DATA] Department List:");
        Console.WriteLine("----------------------------------------");
        foreach (var dept in result)
        {
            Console.WriteLine(FormatDepartment(dept));
        }

        // Verify repository call
        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Console.WriteLine("[VERIFY] Repository method called exactly once");
    }

    private async Task TestGetActiveAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetActiveAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        Console.WriteLine("[STATUS] Executing GetActiveAsync...");
        var result = await _service.GetActiveAsync();

        // Verify
        var activeCount = _testData.Count(d => d.IsActive);
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} active departments (Expected: {activeCount})");
        
        Console.WriteLine("\n[DATA] Active Department List:");
        Console.WriteLine("----------------------------------------");
        foreach (var dept in result)
        {
            Console.WriteLine(FormatDepartment(dept));
        }
    }

    private async Task TestGetByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);
        
        var dept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        
        if (dept == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }
        
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dept);

        Console.WriteLine($"[STATUS] Executing GetByIdAsync with ID: {id}...");
        
        try
        {
            var result = await _service.GetByIdAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Department found:");
                Console.WriteLine(FormatDepartment(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No department found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }


    private async Task TestCreateAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department Name: ");
        var name = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Manager ID (or press Enter for null): ");
        var managerId = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(managerId)) managerId = null;
        
        Console.Write("[INPUT] Enter Description: ");
        var description = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateDepartmentRequest
        {
            DepartmentName = name ?? "",
            Description = description
        };
        Console.WriteLine($"[INPUT DATA] Name: {request.DepartmentName}, Description: {request.Description}");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var newDept = new Department
        {
            DepartmentId = _testData.Max(d => d.DepartmentId) + 1,
            DepartmentName = request.DepartmentName,
            ManagerId = managerId,
            Description = request.Description,
            IsActive = true
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newDept);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateAsync...");
            var result = await _service.CreateAsync(request);
            
            Console.WriteLine("[SUCCESS] Department created successfully:");
            Console.WriteLine(FormatDepartment(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }


    private async Task TestUpdateAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        
        if (existingDept == null)
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing department:");
            Console.WriteLine(FormatDepartmentEntity(existingDept));
        }
        
        Console.Write("\n[INPUT] Enter new Department Name: ");
        var name = Console.ReadLine();
        
        Console.Write("[INPUT] Enter new Manager ID (or press Enter to keep current): ");
        var managerId = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(managerId)) managerId = existingDept?.ManagerId;
        
        Console.Write("[INPUT] Enter new Description: ");
        var description = Console.ReadLine();

        Console.Write("[INPUT] Enter new Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingDept?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateDepartmentRequest
        {
            DepartmentName = name ?? existingDept?.DepartmentName ?? "",
            Description = description ?? existingDept?.Description ?? "",
            IsActive = isActive
        };
        Console.WriteLine($"[INPUT DATA] Name: {request.DepartmentName}, Description: {request.Description}, IsActive: {request.IsActive}");

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var updatedDept = new Department
        {
            DepartmentId = id,
            DepartmentName = request.DepartmentName,
            Description = request.Description,
            IsActive = request.IsActive
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedDept);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateAsync...");
            var result = await _service.UpdateAsync(id, request);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Department updated successfully:");
                Console.WriteLine(FormatDepartment(result));
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


    private async Task TestToggleStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ToggleStatusAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        
        if (existingDept == null)
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Department:");
            Console.WriteLine(FormatDepartmentEntity(existingDept));
            Console.WriteLine($"[CURRENT STATUS] IsActive: {existingDept.IsActive}");
            Console.WriteLine($"[EXPECTED STATUS] Will toggle to: {!existingDept.IsActive}");
        }

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);

        var toggledDept = new Department
        {
            DepartmentId = id,
            DepartmentName = existingDept?.DepartmentName ?? "",
            ManagerId = existingDept?.ManagerId,
            Description = existingDept?.Description ?? "",
            IsActive = !(existingDept?.IsActive ?? false)
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledDept);

        try
        {
            Console.WriteLine("[STATUS] Executing ToggleStatusAsync...");
            var result = await _service.ToggleStatusAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Status toggled successfully:");
                Console.WriteLine(FormatDepartment(result));
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


    private async Task TestDeleteAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        if (existingDept != null)
        {
            Console.WriteLine($"[WARNING] Will delete: {existingDept.DepartmentName} (ID: {id})");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete department with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteAsync...");
            var result = await _service.DeleteAsync(id);
            
            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Department deleted successfully" : "Failed to delete department")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }



    private List<Department> InitializeTestData()
    {
        return new List<Department>
        {
            new Department
            {
                DepartmentId = 1,
                DepartmentName = "Production Department",
                ManagerId = "MGR001",
                Description = "Handles all production activities",
                IsActive = true,
                Manager = new User { Id = "MGR001", FullName = "John Doe" }
            },
            new Department
            {
                DepartmentId = 2,
                DepartmentName = "Quality Assurance",
                ManagerId = "MGR002",
                Description = "Quality control and testing",
                IsActive = true,
                Manager = new User { Id = "MGR002", FullName = "Jane Smith" }
            },
            new Department
            {
                DepartmentId = 3,
                DepartmentName = "Maintenance",
                ManagerId = null,
                Description = "Equipment maintenance",
                IsActive = false,
                Manager = null
            },
            new Department
            {
                DepartmentId = 4,
                DepartmentName = "Warehouse",
                ManagerId = "MGR003",
                Description = "Storage and logistics",
                IsActive = true,
                Manager = new User { Id = "MGR003", FullName = "Bob Johnson" }
            }
        };
    }

    private string FormatDepartment(DepartmentDTO dept)
    {
        if (dept == null) return "[NULL]";
        
        return $"{{{dept.DepartmentId},\"{dept.DepartmentName}\",{(dept.ManagerId ?? "null")},\"{(dept.ManagerName ?? "null")}\",\"{(dept.Description ?? "null")}\",{dept.IsActive.ToString().ToLower()}}}";
    }

    private string FormatDepartmentEntity(Department dept)
    {
        if (dept == null) return "[NULL]";
        
        return $"{{{dept.DepartmentId},\"{dept.DepartmentName}\",{(dept.ManagerId ?? "null")},\"{(dept.Manager?.FullName ?? "null")}\",\"{(dept.Description ?? "null")}\",{dept.IsActive.ToString().ToLower()}}}";
    }

}