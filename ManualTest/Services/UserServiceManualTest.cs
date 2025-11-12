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

            try
            {
                switch (choice)
                {
                    case "1":
                        var result1 = await TestGetUsersWithRolesAsync();
                        Console.WriteLine($"Found {result1.Count} users");
                        foreach (var user in result1)
                        {
                            Console.WriteLine(FormatUserDTO(user));
                        }
                        break;
                    case "2":
                        Console.Write("[INPUT] Enter User ID: ");
                        var id2 = Console.ReadLine();
                        var result2 = await TestGetUserByIdAsync(id2 ?? "");
                        if (result2 != null)
                            Console.WriteLine(FormatUser(result2));
                        else
                            Console.WriteLine("User not found");
                        break;
                    case "3":
                        var user3 = new User
                        {
                            UserName = GetStringInput("Username"),
                            Email = GetStringInput("Email"),
                            FullName = GetStringInput("Full Name"),
                            EmployeeCode = GetStringInput("Employee Code"),
                            PhoneNumber = GetStringInput("Phone Number")
                        };
                        Console.Write("[INPUT] Enter Password: ");
                        var password3 = Console.ReadLine();
                        Console.Write("[INPUT] Enter Role IDs (comma-separated): ");
                        var roleInput3 = Console.ReadLine();
                        var roleIds3 = string.IsNullOrWhiteSpace(roleInput3) ? null : roleInput3.Split(',').Select(r => r.Trim()).ToArray();
                        var result3 = await TestCreateUserAsync(user3, password3 ?? "", roleIds3);
                        Console.WriteLine(FormatUser(result3));
                        break;
                    case "4":
                        var request4 = new CreateUserRequest
                        {
                            Email = GetStringInput("Email"),
                            FullName = GetStringInput("Full Name"),
                            EmployeeCode = GetStringInput("Employee Code"),
                            PhoneNumber = GetStringInput("Phone Number"),
                            DepartmentId = GetNullableIntInput("Department ID"),
                            LineIds = GetNullableIntArrayInput("Line IDs (comma-separated)"),
                            RoleIds = GetStringArrayInput("Role IDs (comma-separated)")
                        };
                        var result4 = await TestCreateUserWithAssignmentsAsync(request4);
                        Console.WriteLine(FormatUser(result4));
                        break;
                    case "5":
                        var id5 = GetStringInput("User ID to update");
                        var lineIds = GetNullableIntArrayInput("Line IDs (comma-separated)");
                        var request5 = new UpdateUserRequest
                        {
                            Email = GetStringInput("Email"),
                            FullName = GetStringInput("Full Name"),
                            EmployeeCode = GetStringInput("Employee Code"),
                            PhoneNumber = GetStringInput("Phone Number"),
                            IsActive = GetBoolInput("Is Active", true),
                            DepartmentId = GetNullableIntInput("Department ID"),
                            RoleIds = GetStringArrayInput("Role IDs (comma-separated)"),
                            LineIds = lineIds != null ? new List<int>(lineIds) : null
                        };
                        var result5 = await TestUpdateUserAsync(id5, request5);
                        if (result5 != null)
                            Console.WriteLine(FormatUserDTO(result5));
                        break;
                    case "6":
                        var id6 = GetStringInput("User ID to delete");
                        var result6 = await TestDeleteUserAsync(id6);
                        if (result6 != null)
                            Console.WriteLine(FormatUser(result6));
                        break;
                    case "7":
                        var roleName7 = GetStringInput("Role Name");
                        var result7 = await TestGetUsersByRoleAsync(roleName7);
                        Console.WriteLine($"Found {result7.Count} users");
                        foreach (var user in result7)
                        {
                            Console.WriteLine(FormatUser(user));
                        }
                        break;
                    case "8":
                        var email8 = GetStringInput("Email");
                        var result8 = await TestGetByEmailAsync(email8);
                        if (result8 != null)
                            Console.WriteLine(FormatUser(result8));
                        else
                            Console.WriteLine("User not found");
                        break;
                    case "9":
                        var empCode9 = GetStringInput("Employee Code");
                        var result9 = await TestGetByEmployeeCodeAsync(empCode9);
                        if (result9 != null)
                            Console.WriteLine(FormatUser(result9));
                        else
                            Console.WriteLine("User not found");
                        break;
                    case "10":
                        var userId10 = GetStringInput("User ID");
                        var request10 = new UpdateProfileRequest
                        {
                            FullName = GetStringInput("Full Name"),
                            Email = GetStringInput("Email"),
                            PhoneNumber = GetStringInput("Phone Number")
                        };
                        var result10 = await TestUpdateProfileAsync(userId10, request10);
                        if (result10 != null)
                            Console.WriteLine(FormatUser(result10));
                        break;
                    case "11":
                        var userId11 = GetStringInput("User ID");
                        var newPassword11 = GetStringInput("New Password");
                        var result11 = await TestResetPasswordAsync(userId11, newPassword11);
                        Console.WriteLine($"Reset password result: {result11}");
                        break;
                    case "12":
                        var userId12 = GetStringInput("User ID");
                        var result12 = await TestGetUserLinesAsync(userId12);
                        Console.WriteLine($"Found {result12.Count} lines");
                        foreach (var ul in result12)
                        {
                            Console.WriteLine($"{{UserId:\"{ul.UserId}\", LineId:{ul.LineId}}}");
                        }
                        break;
                    case "0":
                        Console.WriteLine("Goodbye!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice. Please try again.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
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

    private async Task<IReadOnlyList<UserDTO>> TestGetUsersWithRolesAsync()
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
            Roles = new List<string> { u.RoleId ?? "" },
            LineIds = new List<int>()
        }).ToList();

        _mockRepository.Setup(x => x.GetUsersWithRolesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((IReadOnlyList<UserDTO>)userDTOs);

        var result = await _service.GetUsersWithRolesAsync();

        // Verify repository call
        _mockRepository.Verify(x => x.GetUsersWithRolesAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<User?> TestGetUserByIdAsync(string id)
    {
        var user = _testUsers.FirstOrDefault(u => u.Id == id);

        _mockRepository.Setup(x => x.GetUserByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var result = await _service.GetUserByIdAsync(id);
        return result;
    }

    private async Task<User> TestCreateUserAsync(User user, string password, string[]? roleIds)
    {
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

        var result = await _service.CreateUserAsync(user, password, roleIds);
        return result;
    }

    private async Task<User> TestCreateUserWithAssignmentsAsync(CreateUserRequest request)
    {
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

        var result = await _service.CreateUserWithAssignmentsAsync(request);
        return result;
    }

    private async Task<UserDTO?> TestUpdateUserAsync(string id, UpdateUserRequest request)
    {
        var existingUser = _testUsers.FirstOrDefault(u => u.Id == id);
        if (existingUser == null) return null;

        // Setup mock
        var updatedUserDTO = new UserDTO
        {
            Id = id,
            Email = request.Email,
            FullName = request.FullName,
            EmployeeCode = request.EmployeeCode,
            PhoneNumber = request.PhoneNumber,
            IsActive = request.IsActive,
            DepartmentId = request.DepartmentId,
            Roles = request.RoleIds != null ? request.RoleIds.ToList() : new List<string>(),
            LineIds = request.LineIds
        };

        _mockRepository.Setup(x => x.UpdateUserAsync(id, It.IsAny<UpdateUserRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUserDTO);

        var result = await _service.UpdateUserAsync(id, request);
        return result;
    }

    private async Task<User?> TestDeleteUserAsync(string id)
    {
        var existingUser = _testUsers.FirstOrDefault(u => u.Id == id);
        if (existingUser == null) return null;

        // Setup mock
        _mockRepository.Setup(x => x.DeleteUserAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        var result = await _service.DeleteUserAsync(id);
        return result;
    }

    private async Task<IReadOnlyList<User>> TestGetUsersByRoleAsync(string roleName)
    {
        // For testing, simulate users with the role
        var usersWithRole = _testUsers.Take(2).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetUsersByRoleAsync(roleName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usersWithRole);

        var result = await _service.GetUsersByRoleAsync(roleName);

        _mockRepository.Verify(x => x.GetUsersByRoleAsync(roleName, It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<User?> TestGetByEmailAsync(string email)
    {
        var user = _testUsers.FirstOrDefault(u => u.Email == email);

        // Setup mock
        _mockRepository.Setup(x => x.GetByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var result = await _service.GetByEmailAsync(email);
        return result;
    }

    private async Task<User?> TestGetByEmployeeCodeAsync(string empCode)
    {
        var user = _testUsers.FirstOrDefault(u => u.EmployeeCode == empCode);

        // Setup mock
        _mockRepository.Setup(x => x.GetByEmployeeCodeAsync(empCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var result = await _service.GetByEmployeeCodeAsync(empCode);
        return result;
    }

    private async Task<User?> TestUpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var existingUser = _testUsers.FirstOrDefault(u => u.Id == userId);
        if (existingUser == null) return null;

        // Setup mock
        var updatedUser = new User
        {
            Id = existingUser.Id,
            UserName = existingUser.UserName,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            EmployeeCode = existingUser.EmployeeCode,
            IsActive = existingUser.IsActive,
            DepartmentId = existingUser.DepartmentId
        };

        _mockRepository.Setup(x => x.UpdateProfileAsync(userId, It.IsAny<UpdateProfileRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedUser);

        var result = await _service.UpdateProfileAsync(userId, request);
        return result;
    }

    private async Task<bool> TestResetPasswordAsync(string userId, string newPassword)
    {
        var existingUser = _testUsers.FirstOrDefault(u => u.Id == userId);
        if (existingUser == null) return false;

        // Setup mock
        _mockRepository.Setup(x => x.ResetPasswordAsync(userId, newPassword, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _service.ResetPasswordAsync(userId, newPassword);
        return result;
    }

    private async Task<IReadOnlyList<UserLine>> TestGetUserLinesAsync(string userId)
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

        var result = await _service.GetUserLinesAsync(userId);

        _mockRepository.Verify(x => x.GetUserLinesAsync(userId, It.IsAny<CancellationToken>()), Times.Once);

        return result;
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

    private string GetStringInput(string prompt, string defaultValue = "")
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
    }

    private bool GetBoolInput(string prompt, bool defaultValue = false)
    {
        Console.Write($"[INPUT] {prompt} (true/false): ");
        var input = Console.ReadLine();
        return bool.TryParse(input, out bool result) ? result : defaultValue;
    }

    private int? GetNullableIntInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (or press Enter for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input)) return null;
        return int.TryParse(input, out int result) ? result : null;
    }

    private int[]? GetNullableIntArrayInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (or press Enter for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input)) return null;
        return input.Split(',').Select(s => int.TryParse(s.Trim(), out int i) ? i : 0).ToArray();
    }

    private string[]? GetStringArrayInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt} (or press Enter for null): ");
        var input = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(input)) return null;
        return input.Split(',').Select(s => s.Trim()).ToArray();
    }
}

