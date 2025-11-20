using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class DepartmentServiceManualTest
{
    private readonly Mock<IDepartmentRepository> _mockDepartmentRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IRoleRepository> _mockRoleRepository;
    private readonly DepartmentService _service;
    private readonly List<Department> _testData;

    public DepartmentServiceManualTest()
    {
        _mockDepartmentRepository = new Mock<IDepartmentRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockRoleRepository = new Mock<IRoleRepository>();
        _service = new DepartmentService(_mockDepartmentRepository.Object, _mockUserRepository.Object, _mockRoleRepository.Object);
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
                    var allResult = await TestGetAllAsync();
                    Console.WriteLine($"Test returned {allResult.Count} departments");
                    foreach (var dept in allResult)
                    {
                        Console.WriteLine(FormatDepartment(dept));
                    }
                    break;
                case "2":
                    var activeResult = await TestGetActiveAsync();
                    Console.WriteLine($"Test returned {activeResult.Count} active departments");
                    foreach (var dept in activeResult)
                    {
                        Console.WriteLine(FormatDepartment(dept));
                    }
                    break;
                case "3":
                    var getResult = await TestGetByIdAsync();
                    Console.WriteLine($"Test returned: {(getResult != null ? "Department found" : "No department found")}");
                    if (getResult != null)
                    {
                        Console.WriteLine(FormatDepartment(getResult));
                    }
                    break;
                case "4":
                    var createResult = await TestCreateAsync();
                    Console.WriteLine($"Test returned: {(createResult != null ? "Department created" : "Creation failed")}");
                    if (createResult != null)
                    {
                        Console.WriteLine(FormatDepartment(createResult));
                    }
                    break;
                case "5":
                    var updateResult = await TestUpdateAsync();
                    Console.WriteLine($"Test returned: {(updateResult != null ? "Department updated" : "Update failed")}");
                    if (updateResult != null)
                    {
                        Console.WriteLine(FormatDepartment(updateResult));
                    }
                    break;
                case "6":
                    var toggleResult = await TestToggleStatusAsync();
                    Console.WriteLine($"Test returned: {(toggleResult != null ? "Status toggled" : "Toggle failed")}");
                    if (toggleResult != null)
                    {
                        Console.WriteLine(FormatDepartment(toggleResult));
                    }
                    break;
                case "7":
                    var deleteResult = await TestDeleteAsync();
                    Console.WriteLine($"Test returned: {(deleteResult ? "Department deleted" : "Deletion failed")}");
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



    private async Task<IReadOnlyList<DepartmentDTO>> TestGetAllAsync()
    {
        Console.WriteLine("TEST: GetAllAsync");

        // Setup mock
        _mockDepartmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetAllAsync();

        // Verify
        _mockDepartmentRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        Console.WriteLine($"[SUCCESS] Found {result.Count} departments");
        return result;
    }

    private async Task<IReadOnlyList<DepartmentDTO>> TestGetActiveAsync()
    {
        Console.WriteLine("TEST: GetActiveAsync");

        // Setup mock
        _mockDepartmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetActiveAsync();

        // Verify
        var activeCount = _testData.Count(d => d.IsActive);
        Console.WriteLine($"[SUCCESS] Found {result.Count} active departments (Expected: {activeCount})");

        return result;
    }

    private async Task<DepartmentDTO?> TestGetByIdAsync()
    {
        Console.WriteLine("TEST: GetByIdAsync");

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var dept = _testData.FirstOrDefault(d => d.DepartmentId == id);

        _mockDepartmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dept);

        try
        {
            var result = await _service.GetByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine($"[SUCCESS] Department found with ID: {id}");
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No department found with ID: {id}");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }


    private async Task<DepartmentDTO> TestCreateAsync()
    {
        Console.WriteLine("TEST: CreateAsync");

        Console.Write("[INPUT] Enter Department Name: ");
        var name = Console.ReadLine();

        Console.Write("[INPUT] Enter Description (optional): ");
        var description = Console.ReadLine();

        Console.Write("[INPUT] Enter Manager ID (optional): ");
        var managerId = Console.ReadLine();

        var request = new CreateDepartmentRequest
        {
            DepartmentName = name ?? "",
            Description = string.IsNullOrWhiteSpace(description) ? null : description,
            ManagerId = string.IsNullOrWhiteSpace(managerId) ? null : managerId
        };

        // Setup repository mocks
        _mockDepartmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var newDept = new Department
        {
            DepartmentId = _testData.Max(d => d.DepartmentId) + 1,
            DepartmentName = request.DepartmentName.Trim(),
            Description = request.Description?.Trim(),
            ManagerId = request.ManagerId,
            IsActive = true
        };

        _mockDepartmentRepository.Setup(x => x.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newDept);

        // Setup user repository mock for manager validation
        if (!string.IsNullOrWhiteSpace(request.ManagerId))
        {
            var manager = new User
            {
                Id = request.ManagerId,
                FullName = "Test Manager",
                Email = "test@manager.com"
            };
            _mockUserRepository.Setup(x => x.GetUserByIdAsync(request.ManagerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);

            var managers = new List<User> { manager };
            _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý", It.IsAny<CancellationToken>()))
                .ReturnsAsync(managers);
        }

        try
        {
            var result = await _service.CreateAsync(request);
            Console.WriteLine("[SUCCESS] Department created successfully");
            return result;
        }
        catch (DepartmentValidationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message} (Code: {ex.ErrorCode})");
            return null!;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }


    private async Task<DepartmentDTO?> TestUpdateAsync()
    {
        Console.WriteLine("TEST: UpdateAsync");

        Console.Write("[INPUT] Enter Department ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);

        if (existingDept == null)
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found");
            return null;
        }

        Console.Write("[INPUT] Enter new Department Name: ");
        var name = Console.ReadLine();

        Console.Write("[INPUT] Enter new Description (optional): ");
        var description = Console.ReadLine();

        Console.Write("[INPUT] Enter new Active status (true/false): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingDept.IsActive;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        var request = new UpdateDepartmentRequest
        {
            DepartmentName = name ?? existingDept.DepartmentName,
            Description = string.IsNullOrWhiteSpace(description) ? existingDept.Description : description,
            IsActive = isActive
        };

        // Setup repository mocks
        _mockDepartmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);
        _mockDepartmentRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var updatedDept = new Department
        {
            DepartmentId = id,
            DepartmentName = request.DepartmentName.Trim(),
            Description = request.Description?.Trim(),
            ManagerId = existingDept.ManagerId,
            IsActive = request.IsActive
        };

        _mockDepartmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedDept);

        try
        {
            var result = await _service.UpdateAsync(id, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Department updated successfully");
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned null");
            }
            return result;
        }
        catch (DepartmentValidationException ex)
        {
            Console.WriteLine($"[VALIDATION ERROR] {ex.Message} (Code: {ex.ErrorCode})");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            throw;
        }
    }


    private async Task<DepartmentDTO?> TestToggleStatusAsync()
    {
        Console.WriteLine("TEST: ToggleStatusAsync");

        Console.Write("[INPUT] Enter Department ID to toggle status: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);

        if (existingDept == null)
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found");
            return null;
        }

        Console.WriteLine($"[STATUS] Will toggle from {existingDept.IsActive} to {!existingDept.IsActive}");

        // Setup mock
        _mockDepartmentRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);

        var toggledDept = new Department
        {
            DepartmentId = id,
            DepartmentName = existingDept.DepartmentName,
            ManagerId = existingDept.ManagerId,
            Description = existingDept.Description,
            IsActive = !existingDept.IsActive
        };

        _mockDepartmentRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledDept);

        try
        {
            var result = await _service.ToggleStatusAsync(id);

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
            throw;
        }
    }


    private async Task<bool> TestDeleteAsync()
    {
        Console.WriteLine("TEST: DeleteAsync");

        Console.Write("[INPUT] Enter Department ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        if (existingDept == null)
        {
            Console.WriteLine($"[NOT FOUND] Department with ID {id} not found");
            return false;
        }

        Console.Write($"[CONFIRM] Delete department '{existingDept.DepartmentName}'? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return false;
        }

        // Setup mock
        _mockDepartmentRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            var result = await _service.DeleteAsync(id);

            if (result)
            {
                Console.WriteLine("[SUCCESS] Department deleted successfully");
            }
            else
            {
                Console.WriteLine("[FAILED] Failed to delete department");
            }
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
            return false;
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