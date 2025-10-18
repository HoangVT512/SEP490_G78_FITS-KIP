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

    public async Task RunAllTests()
    {
        Console.WriteLine("🧪 DEPARTMENT SERVICE MANUAL TESTS");
        Console.WriteLine("=====================================");

        await TestGetAllAsync();
        await TestGetActiveAsync();
        await TestGetByIdAsync();
        await TestCreateAsync();
        await TestUpdateAsync();
        await TestToggleStatusAsync();
        await TestDeleteAsync();

        Console.WriteLine("\n✅ All tests completed!");
    }

    public async Task RunInteractiveTests()
    {
        Console.WriteLine("🎮 INTERACTIVE DEPARTMENT SERVICE TEST");
        Console.WriteLine("======================================");
        Console.WriteLine("Chọn method để test manual:");
        Console.WriteLine();

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
                    await TestGetByIdAsyncInteractive();
                    break;
                case "4":
                    await TestCreateAsyncInteractive();
                    break;
                case "5":
                    await TestUpdateAsyncInteractive();
                    break;
                case "6":
                    await TestToggleStatusAsyncInteractive();
                    break;
                case "7":
                    await TestDeleteAsyncInteractive();
                    break;
                case "8":
                    await RunAllTests();
                    break;
                case "0":
                    Console.WriteLine("👋 Goodbye!");
                    return;
                default:
                    Console.WriteLine("❌ Invalid choice. Please try again.");
                    break;
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("📋 DEPARTMENT SERVICE TEST MENU");
        Console.WriteLine("===============================");
        Console.WriteLine("1. Test GetAllAsync");
        Console.WriteLine("2. Test GetActiveAsync");
        Console.WriteLine("3. Test GetByIdAsync (Interactive)");
        Console.WriteLine("4. Test CreateAsync (Interactive)");
        Console.WriteLine("5. Test UpdateAsync (Interactive)");
        Console.WriteLine("6. Test ToggleStatusAsync (Interactive)");
        Console.WriteLine("7. Test DeleteAsync (Interactive)");
        Console.WriteLine("8. Run All Tests");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }


    private async Task TestGetAllAsync()
    {
        Console.WriteLine("\n📋 Testing GetAllAsync...");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetAllAsync();

        // Verify
        Console.WriteLine($"✅ Result: Found {result.Count} departments");
        foreach (var dept in result)
        {
            Console.WriteLine($"   - {dept.DepartmentName} (ID: {dept.DepartmentId}, Active: {dept.IsActive})");
        }

        // Verify repository call
        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private async Task TestGetActiveAsync()
    {
        Console.WriteLine("\n📋 Testing GetActiveAsync...");

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        var result = await _service.GetActiveAsync();

        // Verify
        var activeCount = _testData.Count(d => d.IsActive);
        Console.WriteLine($"✅ Result: Found {result.Count} active departments (Expected: {activeCount})");

        foreach (var dept in result)
        {
            Console.WriteLine($"   - {dept.DepartmentName} (Active: {dept.IsActive})");
        }
    }

    private async Task TestGetByIdAsync()
    {
        Console.WriteLine("\n📋 Testing GetByIdAsync...");

        // Test with valid ID
        Console.WriteLine("Testing with valid ID...");
        var validId = 1;
        var validDept = _testData.First(d => d.DepartmentId == validId);

        _mockRepository.Setup(x => x.GetByIdAsync(validId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(validDept);

        var result = await _service.GetByIdAsync(validId);

        if (result != null)
        {
            Console.WriteLine($"✅ Found department: {result.DepartmentName} (ID: {result.DepartmentId})");
        }
        else
        {
            Console.WriteLine("❌ Department not found");
        }

        // Test with invalid ID
        Console.WriteLine("Testing with invalid ID...");
        var invalidId = 999;
        _mockRepository.Setup(x => x.GetByIdAsync(invalidId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        var invalidResult = await _service.GetByIdAsync(invalidId);

        if (invalidResult == null)
        {
            Console.WriteLine("✅ Correctly returned null for invalid ID");
        }
        else
        {
            Console.WriteLine("❌ Should have returned null for invalid ID");
        }
    }

    private async Task TestGetByIdAsyncInteractive()
    {
        Console.WriteLine("\n📋 Testing GetByIdAsync (Interactive)...");
        Console.WriteLine("=======================================");

        Console.Write("Enter Department ID to test: ");
        if (int.TryParse(Console.ReadLine(), out int id))
        {
            var dept = _testData.FirstOrDefault(d => d.DepartmentId == id);
            
            _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(dept);

            Console.WriteLine($"Executing GetByIdAsync with ID: {id}...");
            var result = await _service.GetByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("✅ Department found:");
                Console.WriteLine($"   📁 Name: {result.DepartmentName}");
                Console.WriteLine($"   🆔 ID: {result.DepartmentId}");
                Console.WriteLine($"   👤 Manager: {result.ManagerName ?? "None"}");
                Console.WriteLine($"   ✅ Active: {result.IsActive}");
                Console.WriteLine($"   📝 Description: {result.Description}");
            }
            else
            {
                Console.WriteLine($"❌ No department found with ID: {id}");
            }
        }
        else
        {
            Console.WriteLine("❌ Invalid ID format");
        }
    }

    private async Task TestCreateAsync()
    {
        Console.WriteLine("\n📋 Testing CreateAsync...");

        // Setup mock for existing departments check
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Test valid creation
        Console.WriteLine("Testing valid department creation...");
        var validRequest = new CreateDepartmentRequest
        {
            DepartmentName = "New Department",
            ManagerId = "MGR001",
            Description = "Test department"
        };

        var newDept = new Department
        {
            DepartmentId = 99,
            DepartmentName = validRequest.DepartmentName,
            ManagerId = validRequest.ManagerId,
            Description = validRequest.Description,
            IsActive = true
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newDept);

        try
        {
            var result = await _service.CreateAsync(validRequest);
            Console.WriteLine($"✅ Created department: {result.DepartmentName} (ID: {result.DepartmentId})");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error creating department: {ex.Message}");
        }

        // Test duplicate name
        Console.WriteLine("Testing duplicate department name...");
        var duplicateRequest = new CreateDepartmentRequest
        {
            DepartmentName = "Production Department", // This should already exist
            ManagerId = "MGR002",
            Description = "Duplicate test"
        };

        try
        {
            var duplicateResult = await _service.CreateAsync(duplicateRequest);
            Console.WriteLine("❌ Should have thrown exception for duplicate name");
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"✅ Correctly caught duplicate name error: {ex.Message}");
        }
    }

    private async Task TestCreateAsyncInteractive()
    {
        Console.WriteLine("\n📋 Testing CreateAsync (Interactive)...");
        Console.WriteLine("======================================");

        Console.Write("Enter Department Name: ");
        var name = Console.ReadLine();
        
        Console.Write("Enter Manager ID (or press Enter for null): ");
        var managerId = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(managerId)) managerId = null;
        
        Console.Write("Enter Description: ");
        var description = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(name))
        {
            Console.WriteLine("❌ Department name is required");
            return;
        }

        var request = new CreateDepartmentRequest
        {
            DepartmentName = name,
            ManagerId = managerId,
            Description = description
        };

        // Setup mock
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var newDept = new Department
        {
            DepartmentId = _testData.Max(d => d.DepartmentId) + 1,
            DepartmentName = request.DepartmentName,
            ManagerId = request.ManagerId,
            Description = request.Description,
            IsActive = true
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newDept);

        try
        {
            Console.WriteLine("Executing CreateAsync...");
            var result = await _service.CreateAsync(request);
            
            Console.WriteLine("✅ Department created successfully:");
            Console.WriteLine($"   📁 Name: {result.DepartmentName}");
            Console.WriteLine($"   🆔 ID: {result.DepartmentId}");
            Console.WriteLine($"   👤 Manager: {result.ManagerId ?? "None"}");
            Console.WriteLine($"   📝 Description: {result.Description}");
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Unexpected error: {ex.Message}");
        }
    }

    private async Task TestUpdateAsync()
    {
        Console.WriteLine("\n📋 Testing UpdateAsync...");

        var existingDept = _testData.First();
        var updateId = existingDept.DepartmentId;

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(updateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var updatedDept = new Department
        {
            DepartmentId = updateId,
            DepartmentName = "Updated Department Name",
            ManagerId = "MGR002",
            Description = "Updated description",
            IsActive = true
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedDept);

        var updateRequest = new UpdateDepartmentRequest
        {
            DepartmentName = "Updated Department Name",
            ManagerId = "MGR002",
            Description = "Updated description",
            IsActive = true
        };

        try
        {
            var result = await _service.UpdateAsync(updateId, updateRequest);
            if (result != null)
            {
                Console.WriteLine($"✅ Updated department: {result.DepartmentName} (ID: {result.DepartmentId})");
            }
            else
            {
                Console.WriteLine("❌ Update returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error updating department: {ex.Message}");
        }

        // Test update non-existent department
        Console.WriteLine("Testing update non-existent department...");
        var nonExistentId = 999;
        _mockRepository.Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        var nonExistentResult = await _service.UpdateAsync(nonExistentId, updateRequest);

        if (nonExistentResult == null)
        {
            Console.WriteLine("✅ Correctly returned null for non-existent department");
        }
        else
        {
            Console.WriteLine("❌ Should have returned null for non-existent department");
        }
    }

    private async Task TestUpdateAsyncInteractive()
    {
        Console.WriteLine("\n📋 Testing UpdateAsync (Interactive)...");
        Console.WriteLine("======================================");

        Console.Write("Enter Department ID to update: ");
        if (!int.TryParse(Console.ReadLine(), out int id))
        {
            Console.WriteLine("❌ Invalid ID format");
            return;
        }

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        if (existingDept == null)
        {
            Console.WriteLine($"❌ Department with ID {id} not found in test data");
            return;
        }

        Console.WriteLine($"Current department: {existingDept.DepartmentName}");
        Console.Write("Enter new Department Name: ");
        var name = Console.ReadLine();
        
        Console.Write("Enter new Manager ID (or press Enter to keep current): ");
        var managerId = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(managerId)) managerId = existingDept.ManagerId;
        
        Console.Write("Enter new Description: ");
        var description = Console.ReadLine();

        Console.Write("Enter new Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingDept.IsActive;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        var request = new UpdateDepartmentRequest
        {
            DepartmentName = name ?? existingDept.DepartmentName,
            ManagerId = managerId,
            Description = description ?? existingDept.Description,
            IsActive = isActive
        };

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);
        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var updatedDept = new Department
        {
            DepartmentId = id,
            DepartmentName = request.DepartmentName,
            ManagerId = request.ManagerId,
            Description = request.Description,
            IsActive = request.IsActive
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedDept);

        try
        {
            Console.WriteLine("Executing UpdateAsync...");
            var result = await _service.UpdateAsync(id, request);
            
            if (result != null)
            {
                Console.WriteLine("✅ Department updated successfully:");
                Console.WriteLine($"   📁 Name: {result.DepartmentName}");
                Console.WriteLine($"   🆔 ID: {result.DepartmentId}");
                Console.WriteLine($"   👤 Manager: {result.ManagerId ?? "None"}");
                Console.WriteLine($"   📝 Description: {result.Description}");
                Console.WriteLine($"   ✅ Active: {result.IsActive}");
            }
            else
            {
                Console.WriteLine("❌ Update returned null");
            }
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Unexpected error: {ex.Message}");
        }
    }

    private async Task TestToggleStatusAsync()
    {
        Console.WriteLine("\n📋 Testing ToggleStatusAsync...");

        var existingDept = _testData.First();
        var toggleId = existingDept.DepartmentId;
        var originalStatus = existingDept.IsActive;

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(toggleId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);

        var toggledDept = new Department
        {
            DepartmentId = toggleId,
            DepartmentName = existingDept.DepartmentName,
            ManagerId = existingDept.ManagerId,
            Description = existingDept.Description,
            IsActive = !originalStatus
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledDept);

        try
        {
            var result = await _service.ToggleStatusAsync(toggleId);
            if (result != null)
            {
                Console.WriteLine($"✅ Toggled status from {originalStatus} to {result.IsActive}");
            }
            else
            {
                Console.WriteLine("❌ Toggle returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error toggling status: {ex.Message}");
        }

        // Test toggle non-existent department
        Console.WriteLine("Testing toggle non-existent department...");
        var nonExistentId = 999;
        _mockRepository.Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        var nonExistentResult = await _service.ToggleStatusAsync(nonExistentId);

        if (nonExistentResult == null)
        {
            Console.WriteLine("✅ Correctly returned null for non-existent department");
        }
        else
        {
            Console.WriteLine("❌ Should have returned null for non-existent department");
        }
    }

    private async Task TestToggleStatusAsyncInteractive()
    {
        Console.WriteLine("\n📋 Testing ToggleStatusAsync (Interactive)...");
        Console.WriteLine("===========================================");

        Console.Write("Enter Department ID to toggle status: ");
        if (!int.TryParse(Console.ReadLine(), out int id))
        {
            Console.WriteLine("❌ Invalid ID format");
            return;
        }

        var existingDept = _testData.FirstOrDefault(d => d.DepartmentId == id);
        if (existingDept == null)
        {
            Console.WriteLine($"❌ Department with ID {id} not found in test data");
            return;
        }

        Console.WriteLine($"Current status: {existingDept.IsActive}");

        // Setup mock
        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDept);

        var toggledDept = new Department
        {
            DepartmentId = id,
            DepartmentName = existingDept.DepartmentName,
            ManagerId = existingDept.ManagerId,
            Description = existingDept.Description,
            IsActive = !existingDept.IsActive
        };

        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(toggledDept);

        try
        {
            Console.WriteLine("Executing ToggleStatusAsync...");
            var result = await _service.ToggleStatusAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("✅ Status toggled successfully:");
                Console.WriteLine($"   📁 Department: {result.DepartmentName}");
                Console.WriteLine($"   🆔 ID: {result.DepartmentId}");
                Console.WriteLine($"   ✅ New Status: {result.IsActive}");
            }
            else
            {
                Console.WriteLine("❌ Toggle returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
        }
    }

    private async Task TestDeleteAsync()
    {
        Console.WriteLine("\n📋 Testing DeleteAsync...");

        var deleteId = 1;

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAsync(deleteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            var result = await _service.DeleteAsync(deleteId);
            Console.WriteLine($"✅ Delete result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error deleting department: {ex.Message}");
        }

        // Test delete non-existent department
        Console.WriteLine("Testing delete non-existent department...");
        var nonExistentId = 999;
        _mockRepository.Setup(x => x.DeleteAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var nonExistentResult = await _service.DeleteAsync(nonExistentId);
        Console.WriteLine($"✅ Delete non-existent result: {nonExistentResult}");
    }

    private async Task TestDeleteAsyncInteractive()
    {
        Console.WriteLine("\n📋 Testing DeleteAsync (Interactive)...");
        Console.WriteLine("======================================");

        Console.Write("Enter Department ID to delete: ");
        if (!int.TryParse(Console.ReadLine(), out int id))
        {
            Console.WriteLine("❌ Invalid ID format");
            return;
        }

        Console.Write($"Are you sure you want to delete department with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("❌ Delete cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("Executing DeleteAsync...");
            var result = await _service.DeleteAsync(id);
            
            Console.WriteLine($"✅ Delete result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
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

}