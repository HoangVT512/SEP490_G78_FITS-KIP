using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class UserServiceManualTest
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly UserService _service;
    private readonly List<User> _testUsers;
    private readonly List<Department> _testDepartments;

    public UserServiceManualTest()
    {
        _mockRepository = new Mock<IUserRepository>();
        _service = new UserService(_mockRepository.Object);
        _testDepartments = InitializeDepartmentTestData();
        _testUsers = InitializeUserTestData();
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
                    await TestGetUsersWithRolesAsync();
                    break;
                case "2":
                    await TestGetUserByIdAsync();
                    break;
                case "3":
                    await TestCreateUserAsync();
                    break;
                case "4":
                    await TestCreateUserWithAssignmentsAsync();
                    break;
                case "5":
                    await TestUpdateUserAsync();
                    break;
                case "6":
                    await TestDeleteUserAsync();
                    break;
                case "7":
                    await TestGetUsersByRoleAsync();
                    break;
                case "8":
                    await TestGetByEmailAsync();
                    break;
                case "9":
                    await TestGetByEmployeeCodeAsync();
                    break;
                case "10":
                    await TestUpdateProfileAsync();
                    break;
                case "11":
                    await TestResetPasswordAsync();
                    break;
                case "12":
                    await TestGetUserLinesAsync();
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
        Console.WriteLine("USER SERVICE TEST MENU");
        Console.WriteLine("======================");
        Console.WriteLine("1. Test GetUsersWithRolesAsync");
        Console.WriteLine("2. Test GetUserByIdAsync");
        Console.WriteLine("3. Test CreateUserAsync");
        Console.WriteLine("4. Test CreateUserWithAssignmentsAsync");
        Console.WriteLine("5. Test UpdateUserAsync");
        Console.WriteLine("6. Test DeleteUserAsync");
        Console.WriteLine("7. Test GetUsersByRoleAsync");
        Console.WriteLine("8. Test GetByEmailAsync");
        Console.WriteLine("9. Test GetByEmployeeCodeAsync");
        Console.WriteLine("10. Test UpdateProfileAsync");
        Console.WriteLine("11. Test ResetPasswordAsync");
        Console.WriteLine("12. Test GetUserLinesAsync");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestGetUsersWithRolesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsersWithRolesAsync");
        Console.WriteLine("=========================================");

        try
        {
            // Setup mock - convert to UserDTO
            var userDTOs = _testUsers.Select(u => new UserDTO
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                FullName = u.FullName,
                EmployeeCode = u.EmployeeCode,
                PhoneNumber = u.PhoneNumber,
                IsActive = u.IsActive,
                DepartmentId = u.DepartmentId,
                Roles = new List<string> { u.RoleId ?? "" }, // Roles is List<string> in DTO
                LineIds = new List<int>() // LineIds is List<int> in DTO
            }).ToList();

            _mockRepository.Setup(x => x.GetUsersWithRolesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync((IReadOnlyList<UserDTO>)userDTOs);

            // Execute
            Console.WriteLine("[STATUS] Executing GetUsersWithRolesAsync...");
            var result = await _service.GetUsersWithRolesAsync();

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} users");
            Console.WriteLine("\n[DATA] User List:");
            Console.WriteLine("----------------------------------------");
            foreach (var user in result)
            {
                Console.WriteLine(FormatUserDTO(user));
            }

            // Verify repository call
            _mockRepository.Verify(x => x.GetUsersWithRolesAsync(It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUserByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUserByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to test: ");
        var id = Console.ReadLine();

        var user = _testUsers.FirstOrDefault(u => u.Id == id);

        if (user == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockRepository.Setup(x => x.GetUserByIdAsync(id!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        Console.WriteLine($"[STATUS] Executing GetUserByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetUserByIdAsync(id!);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] User found:");
                Console.WriteLine(FormatUser(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No user found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateUserAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateUserAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Username: ");
        var username = Console.ReadLine();

        Console.Write("[INPUT] Enter Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Enter Password: ");
        var password = Console.ReadLine();

        Console.Write("[INPUT] Enter Full Name: ");
        var fullName = Console.ReadLine();

        Console.Write("[INPUT] Enter Employee Code: ");
        var empCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Phone Number: ");
        var phone = Console.ReadLine();

        Console.Write("[INPUT] Enter Role IDs (comma-separated, or press Enter to skip): ");
        var roleInput = Console.ReadLine();
        string[]? roleIds = string.IsNullOrWhiteSpace(roleInput) ? null : roleInput.Split(',').Select(r => r.Trim()).ToArray();

        Console.WriteLine("\n[INPUT] Creating user object...");
        var user = new User
        {
            UserName = username ?? "",
            Email = email ?? "",
            FullName = fullName,
            EmployeeCode = empCode,
            PhoneNumber = phone,
            IsActive = true
        };
        Console.WriteLine($"[INPUT DATA] Username: {user.UserName}, Email: {user.Email}, FullName: {user.FullName}, EmployeeCode: {user.EmployeeCode}");

        // Setup mock
        var newUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            EmployeeCode = user.EmployeeCode,
            PhoneNumber = user.PhoneNumber,
            IsActive = true
        };

        _mockRepository.Setup(x => x.CreateUserAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string[]?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newUser);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateUserAsync...");
            var result = await _service.CreateUserAsync(user, password ?? "", roleIds);

            Console.WriteLine("[SUCCESS] User created successfully:");
            Console.WriteLine(FormatUser(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreateUserWithAssignmentsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateUserWithAssignmentsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Enter Full Name: ");
        var fullName = Console.ReadLine();

        Console.Write("[INPUT] Enter Employee Code: ");
        var empCode = Console.ReadLine();

        Console.Write("[INPUT] Enter Phone Number: ");
        var phone = Console.ReadLine();

        Console.Write("[INPUT] Enter Department ID (or press Enter to skip): ");
        var deptInput = Console.ReadLine();
        int? deptId = string.IsNullOrWhiteSpace(deptInput) ? null : int.Parse(deptInput);

        Console.Write("[INPUT] Enter Line IDs (comma-separated, or press Enter to skip): ");
        var lineInput = Console.ReadLine();
        int[]? lineIds = string.IsNullOrWhiteSpace(lineInput) ? null : lineInput.Split(',').Select(l => int.Parse(l.Trim())).ToArray();

        Console.Write("[INPUT] Enter Role IDs (comma-separated, or press Enter to skip): ");
        var roleInput = Console.ReadLine();
        string[]? roleIds = string.IsNullOrWhiteSpace(roleInput) ? null : roleInput.Split(',').Select(r => r.Trim()).ToArray();

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreateUserRequest
        {
            Email = email ?? "",
            FullName = fullName,
            EmployeeCode = empCode,
            PhoneNumber = phone,
            DepartmentId = deptId,
            LineIds = lineIds,
            RoleIds = roleIds
        };
        Console.WriteLine($"[INPUT DATA] Email: {request.Email}, FullName: {request.FullName}, EmployeeCode: {request.EmployeeCode}, DepartmentId: {request.DepartmentId}, LineIds: {(request.LineIds != null ? string.Join(",", request.LineIds) : "null")}");

        // Setup mock
        var newUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            Email = request.Email,
            FullName = request.FullName,
            EmployeeCode = request.EmployeeCode,
            PhoneNumber = request.PhoneNumber,
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        _mockRepository.Setup(x => x.CreateUserWithAssignmentsAsync(It.IsAny<CreateUserRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newUser);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateUserWithAssignmentsAsync...");
            var result = await _service.CreateUserWithAssignmentsAsync(request);

            Console.WriteLine("[SUCCESS] User created with assignments successfully:");
            Console.WriteLine(FormatUser(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateUserAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateUserAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to update: ");
        var id = Console.ReadLine();

        var existingUser = _testUsers.FirstOrDefault(u => u.Id == id);

        if (existingUser == null)
        {
            Console.WriteLine($"[NOT FOUND] User with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing user:");
            Console.WriteLine(FormatUser(existingUser));
        }

        Console.Write("\n[INPUT] Enter new Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Enter new Full Name: ");
        var fullName = Console.ReadLine();

        Console.Write("[INPUT] Enter new Employee Code: ");
        var empCode = Console.ReadLine();

        Console.Write("[INPUT] Enter new Phone Number: ");
        var phone = Console.ReadLine();

        Console.Write("[INPUT] Enter Active status (true/false, or press Enter to keep current): ");
        var activeInput = Console.ReadLine();
        bool isActive = existingUser?.IsActive ?? true;
        if (!string.IsNullOrWhiteSpace(activeInput) && bool.TryParse(activeInput, out bool parsedActive))
        {
            isActive = parsedActive;
        }

        Console.Write("[INPUT] Enter Department ID (or press Enter to keep current): ");
        var deptInput = Console.ReadLine();
        int? deptId = existingUser?.DepartmentId;
        if (!string.IsNullOrWhiteSpace(deptInput) && int.TryParse(deptInput, out int parsedDeptId))
        {
            deptId = parsedDeptId;
        }

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdateUserRequest
        {
            Email = email ?? existingUser?.Email ?? "",
            FullName = fullName ?? existingUser?.FullName,
            EmployeeCode = empCode ?? existingUser?.EmployeeCode,
            PhoneNumber = phone ?? existingUser?.PhoneNumber,
            IsActive = isActive,
            DepartmentId = deptId
        };
        Console.WriteLine($"[INPUT DATA] Email: {request.Email}, FullName: {request.FullName}, IsActive: {request.IsActive}, RoleIds: {(request.RoleIds != null ? string.Join(",", request.RoleIds) : "null")}, LineIds: {(request.LineIds != null ? string.Join(",", request.LineIds) : "null")}");

        // Setup mock
        var updatedUserDTO = new UserDTO
        {
            Id = id!,
            Email = request.Email,
            FullName = request.FullName,
            EmployeeCode = request.EmployeeCode,
            PhoneNumber = request.PhoneNumber,
            IsActive = request.IsActive,
            DepartmentId = request.DepartmentId,
            Roles = request.RoleIds != null ? request.RoleIds.ToList() : new List<string>(),
            LineIds = request.LineIds
        };

        _mockRepository.Setup(x => x.UpdateUserAsync(id!, It.IsAny<UpdateUserRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUserDTO);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateUserAsync...");
            var result = await _service.UpdateUserAsync(id!, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] User updated successfully:");
                Console.WriteLine(FormatUserDTO(result));
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

    private async Task TestDeleteUserAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteUserAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to delete: ");
        var id = Console.ReadLine();

        var existingUser = _testUsers.FirstOrDefault(u => u.Id == id);
        if (existingUser != null)
        {
            Console.WriteLine($"[WARNING] Will delete: {existingUser.FullName} (ID: {id})");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] User with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete user with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.DeleteUserAsync(id!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteUserAsync...");
            var result = await _service.DeleteUserAsync(id!);

            if (result != null)
            {
                Console.WriteLine($"[SUCCESS] User deleted successfully:");
                Console.WriteLine(FormatUser(result));
            }
            else
            {
                Console.WriteLine("[WARNING] Delete returned null - user may not exist");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUsersByRoleAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUsersByRoleAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Role Name (e.g., Admin, Manager, Technician): ");
        var roleName = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(roleName))
        {
            Console.WriteLine("[ERROR] Role name cannot be empty.");
            return;
        }

        try
        {
            // For testing, simulate users with the role
            var usersWithRole = _testUsers.Take(2).ToList();

            // Setup mock
            _mockRepository.Setup(x => x.GetUsersByRoleAsync(roleName, It.IsAny<CancellationToken>()))
                .ReturnsAsync(usersWithRole);

            // Execute
            Console.WriteLine($"[STATUS] Executing GetUsersByRoleAsync with role: {roleName}...");
            var result = await _service.GetUsersByRoleAsync(roleName);

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} users with role '{roleName}'");

            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] User List:");
                Console.WriteLine("----------------------------------------");
                foreach (var user in result)
                {
                    Console.WriteLine(FormatUser(user));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No users found with this role");
            }

            _mockRepository.Verify(x => x.GetUsersByRoleAsync(roleName, It.IsAny<CancellationToken>()), Times.Once);
            Console.WriteLine("[VERIFY] Repository method called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByEmailAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByEmailAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Email to search: ");
        var email = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(email))
        {
            Console.WriteLine("[ERROR] Email cannot be empty.");
            return;
        }

        var user = _testUsers.FirstOrDefault(u => u.Email == email);

        // Setup mock
        _mockRepository.Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        Console.WriteLine($"[STATUS] Executing GetByEmailAsync with email: {email}...");

        try
        {
            var result = await _service.GetByEmailAsync(email);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] User found:");
                Console.WriteLine(FormatUser(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No user found with email: {email}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetByEmployeeCodeAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetByEmployeeCodeAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Employee Code to search: ");
        var empCode = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(empCode))
        {
            Console.WriteLine("[ERROR] Employee code cannot be empty.");
            return;
        }

        var user = _testUsers.FirstOrDefault(u => u.EmployeeCode == empCode);

        // Setup mock
        _mockRepository.Setup(x => x.GetByEmployeeCodeAsync(empCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        Console.WriteLine($"[STATUS] Executing GetByEmployeeCodeAsync with code: {empCode}...");

        try
        {
            var result = await _service.GetByEmployeeCodeAsync(empCode);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] User found:");
                Console.WriteLine(FormatUser(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No user found with employee code: {empCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdateProfileAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdateProfileAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to update profile: ");
        var userId = Console.ReadLine();

        var existingUser = _testUsers.FirstOrDefault(u => u.Id == userId);

        if (existingUser != null)
        {
            Console.WriteLine($"[CURRENT DATA] Existing user:");
            Console.WriteLine(FormatUser(existingUser));
        }

        Console.Write("\n[INPUT] Enter new Full Name: ");
        var fullName = Console.ReadLine();

        Console.Write("[INPUT] Enter new Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Enter new Phone Number: ");
        var phone = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating update profile request...");
        var request = new UpdateProfileRequest
        {
            FullName = fullName ?? existingUser?.FullName ?? "",
            Email = email ?? existingUser?.Email ?? "",
            PhoneNumber = phone ?? existingUser?.PhoneNumber ?? ""
        };
        Console.WriteLine($"[INPUT DATA] FullName: {request.FullName}, Email: {request.Email}, PhoneNumber: {request.PhoneNumber}");

        // Setup mock
        var updatedUser = existingUser != null ? new User
        {
            Id = existingUser.Id,
            UserName = existingUser.UserName,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            EmployeeCode = existingUser.EmployeeCode,
            IsActive = existingUser.IsActive,
            DepartmentId = existingUser.DepartmentId
        } : null;

        _mockRepository.Setup(x => x.UpdateProfileAsync(userId!, It.IsAny<UpdateProfileRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUser);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdateProfileAsync...");
            var result = await _service.UpdateProfileAsync(userId!, request);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Profile updated successfully:");
                Console.WriteLine(FormatUser(result));
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

    private async Task TestResetPasswordAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ResetPasswordAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to reset password: ");
        var userId = Console.ReadLine();

        var existingUser = _testUsers.FirstOrDefault(u => u.Id == userId);

        if (existingUser != null)
        {
            Console.WriteLine($"[CURRENT DATA] User: {existingUser.FullName} ({existingUser.Email})");
        }
        else
        {
            Console.WriteLine($"[WARNING] User with ID {userId} not found in test data");
        }

        Console.Write("\n[INPUT] Enter new password: ");
        var newPassword = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(newPassword))
        {
            Console.WriteLine("[ERROR] Password cannot be empty.");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.ResetPasswordAsync(userId!, newPassword, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing ResetPasswordAsync...");
            var result = await _service.ResetPasswordAsync(userId!, newPassword);

            Console.WriteLine($"[SUCCESS] Reset password result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Password reset successfully" : "Failed to reset password")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUserLinesAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUserLinesAsync");
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
            // For testing, create some mock UserLines
            var userLines = new List<UserLine>
            {
                new UserLine { UserId = userId, LineId = 1 },
                new UserLine { UserId = userId, LineId = 2 }
            };

            // Setup mock
            _mockRepository.Setup(x => x.GetUserLinesAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(userLines);

            // Execute
            Console.WriteLine($"[STATUS] Executing GetUserLinesAsync for user: {userId}...");
            var result = await _service.GetUserLinesAsync(userId);

            // Verify
            Console.WriteLine($"[SUCCESS] Result: Found {result.Count} lines for user");

            if (result.Count > 0)
            {
                Console.WriteLine("\n[DATA] UserLine List:");
                Console.WriteLine("----------------------------------------");
                foreach (var ul in result)
                {
                    Console.WriteLine($"{{UserId:\"{ul.UserId}\", LineId:{ul.LineId}}}");
                }
            }
            else
            {
                Console.WriteLine("[INFO] No lines assigned to this user");
            }

            _mockRepository.Verify(x => x.GetUserLinesAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
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
                DepartmentName = "Production Department",
                IsActive = true
            },
            new Department
            {
                DepartmentId = 2,
                DepartmentName = "Quality Control",
                IsActive = true
            }
        };
    }

    private List<User> InitializeUserTestData()
    {
        return new List<User>
        {
            new User
            {
                Id = "user001",
                UserName = "john.doe",
                Email = "john.doe@company.com",
                FullName = "John Doe",
                EmployeeCode = "EMP001",
                PhoneNumber = "0901234567",
                IsActive = true,
                DepartmentId = 1,
                RoleId = "role001"
            },
            new User
            {
                Id = "user002",
                UserName = "jane.smith",
                Email = "jane.smith@company.com",
                FullName = "Jane Smith",
                EmployeeCode = "EMP002",
                PhoneNumber = "0902345678",
                IsActive = true,
                DepartmentId = 1,
                RoleId = "role002"
            },
            new User
            {
                Id = "user003",
                UserName = "bob.wilson",
                Email = "bob.wilson@company.com",
                FullName = "Bob Wilson",
                EmployeeCode = "EMP003",
                PhoneNumber = "0903456789",
                IsActive = false,
                DepartmentId = 2,
                RoleId = "role001"
            },
            new User
            {
                Id = "user004",
                UserName = "alice.brown",
                Email = "alice.brown@company.com",
                FullName = "Alice Brown",
                EmployeeCode = "EMP004",
                PhoneNumber = "0904567890",
                IsActive = true,
                DepartmentId = 2,
                RoleId = "role003"
            }
        };
    }

    private string FormatUser(User user)
    {
        if (user == null) return "[NULL]";

        return $"{{ID:\"{user.Id}\", Username:\"{user.UserName}\", Email:\"{user.Email}\", FullName:\"{user.FullName}\", EmpCode:\"{user.EmployeeCode}\", Phone:\"{user.PhoneNumber}\", Active:{user.IsActive}, DeptID:{user.DepartmentId}}}";
    }

    private string FormatUserDTO(UserDTO user)
    {
        if (user == null) return "[NULL]";

        var roles = user.Roles != null ? string.Join(",", user.Roles) : "null";
        var lines = user.LineIds != null ? string.Join(",", user.LineIds) : "null";
        return $"{{ID:\"{user.Id}\", Username:\"{user.UserName}\", Email:\"{user.Email}\", FullName:\"{user.FullName}\", EmpCode:\"{user.EmployeeCode}\", Phone:\"{user.PhoneNumber}\", Active:{user.IsActive}, DeptID:{user.DepartmentId}, Roles:[{roles}], Lines:[{lines}]}}";
    }
}

