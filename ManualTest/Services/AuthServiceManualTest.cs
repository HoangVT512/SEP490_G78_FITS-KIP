using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class AuthServiceManualTest
{
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly Mock<SignInManager<User>> _mockSignInManager;
    private readonly Mock<IJwtTokenService> _mockJwtTokenService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IMemoryCache> _mockMemoryCache;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<RoleManager<IdentityRole>> _mockRoleManager;
    private readonly Mock<IUserService> _mockUserService;
    private readonly AuthService _service;
    private readonly List<User> _testUsers;
    private readonly List<IdentityRole> _testRoles;

    public AuthServiceManualTest()
    {
        // Setup UserManager mock
        _mockUserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(),
            null!, null!, null!, null!, null!, null!, null!, null!);

        // Setup SignInManager mock
        _mockSignInManager = new Mock<SignInManager<User>>(
            _mockUserManager.Object,
            Mock.Of<Microsoft.AspNetCore.Http.IHttpContextAccessor>(),
            Mock.Of<IUserClaimsPrincipalFactory<User>>(),
            null!, null!, null!);

        _mockJwtTokenService = new Mock<IJwtTokenService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockMemoryCache = new Mock<IMemoryCache>();
        _mockConfiguration = new Mock<IConfiguration>();
        _mockRoleManager = new Mock<RoleManager<IdentityRole>>(
            Mock.Of<IRoleStore<IdentityRole>>(),
            null!, null!, null!, null!);
        _mockUserService = new Mock<IUserService>();

        // Setup configuration for OTP
        _mockConfiguration.Setup(x => x["Otp:ExpireMinutes"])
            .Returns("10");

        _service = new AuthService(
            _mockUserManager.Object,
            _mockSignInManager.Object,
            _mockJwtTokenService.Object,
            _mockEmailService.Object,
            _mockMemoryCache.Object,
            _mockConfiguration.Object,
            _mockRoleManager.Object,
            _mockUserService.Object
        );

        _testUsers = InitializeTestUsers();
        _testRoles = InitializeTestRoles();
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
                        await TestLoginAsync();
                        break;
                    case "2":
                        await TestSendForgotPasswordOtpAsync();
                        break;
                    case "3":
                        await TestVerifyOtpAsync();
                        break;
                    case "4":
                        await TestResetPasswordWithOtpAsync();
                        break;
                    case "5":
                        await TestChangePasswordAsync();
                        break;
                    case "6":
                        await TestLogoutAsync();
                        break;
                    case "0":
                        Console.WriteLine("Tạm biệt!");
                        return;
                    default:
                        Console.WriteLine("Lựa chọn không hợp lệ. Vui lòng thử lại.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi: {ex.Message}");
            }

            Console.WriteLine("\nNhấn phím bất kỳ để tiếp tục...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("MENU TEST AUTH SERVICE");
        Console.WriteLine("======================");
        Console.WriteLine("1. Test LoginAsync");
        Console.WriteLine("2. Test SendForgotPasswordOtpAsync");
        Console.WriteLine("3. Test VerifyOtpAsync");
        Console.WriteLine("4. Test ResetPasswordWithOtpAsync");
        Console.WriteLine("5. Test ChangePasswordAsync");
        Console.WriteLine("6. Test LogoutAsync");
        Console.WriteLine("0. Thoát");
        Console.WriteLine();
        Console.Write("Nhập lựa chọn của bạn: ");
    }

    private async Task TestLoginAsync()
    {

        Console.Write("[INPUT] Nhập Email/Tên đăng nhập/Mã nhân viên: ");
        var identifier = Console.ReadLine();

        Console.Write("[INPUT] Nhập Mật khẩu: ");
        var password = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(password))
        {
            Console.WriteLine("[LỖI] Email/Tên đăng nhập và Mật khẩu là bắt buộc.");
            return;
        }

        var request = new LoginRequest
        {
            EmailOrEmployeeCode = identifier,
            Password = password
        };

        // Setup mocks based on identifier type
        User? testUser = null;
        
        // Setup Users queryable for employee code lookup
        var usersQueryable = _testUsers.AsQueryable();
        _mockUserManager.Setup(x => x.Users)
            .Returns(usersQueryable);
        
        // Check if identifier is email
        if (identifier.Contains("@"))
        {
            testUser = _testUsers.FirstOrDefault(u => u.Email == identifier);
            _mockUserManager.Setup(x => x.FindByEmailAsync(identifier))
                .ReturnsAsync(testUser);
        }
        else
        {
            // Check if it's employee code or username
            testUser = _testUsers.FirstOrDefault(u => 
                u.EmployeeCode == identifier || u.UserName == identifier);
            
            _mockUserManager.Setup(x => x.FindByEmailAsync(identifier))
                .ReturnsAsync((User?)null);
            _mockUserManager.Setup(x => x.FindByNameAsync(identifier))
                .ReturnsAsync(testUser);
        }

        if (testUser != null)
        {
            // Setup password check mock - this will be called by service
            bool isPasswordCorrect = password == "Password123!";
            
            // Service checks IsActive first, then password
            // Mock the CheckPasswordSignInAsync call
            _mockSignInManager.Setup(x => x.CheckPasswordSignInAsync(testUser, password, false))
                .ReturnsAsync(isPasswordCorrect ? SignInResult.Success : SignInResult.Failed);

            // Only setup token generation if user is active and password is correct
            if (testUser.IsActive && isPasswordCorrect)
            {
                var roles = new List<string> { _testRoles.FirstOrDefault(r => r.Id == testUser.RoleId)?.Name ?? "EMPLOYEE" };
                _mockUserManager.Setup(x => x.GetRolesAsync(testUser))
                    .ReturnsAsync(roles);

                // Mock role manager to return role for user
                var userRole = _testRoles.FirstOrDefault(r => r.Id == testUser.RoleId);
                _mockRoleManager.Setup(x => x.FindByIdAsync(testUser.RoleId!))
                    .ReturnsAsync(userRole);

                _mockJwtTokenService.Setup(x => x.GenerateTokenAsync(testUser, roles))
                    .ReturnsAsync("jwt-token-" + testUser.Id);
            }
        }

        try
        {
            var result = await _service.LoginAsync(request);
            Console.WriteLine("[THÀNH CÔNG] Đăng nhập thành công");
            Console.WriteLine($"  Token: {result.Token?.Substring(0, Math.Min(20, result.Token.Length))}...");
            Console.WriteLine($"  Người dùng: {result.User?.FullName} ({result.User?.Email})");
            Console.WriteLine($"  Vai trò: {string.Join(", ", result.User?.Roles ?? new List<string>())}");
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"[LỖI] UnauthorizedAccessException: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
        }
    }

    private async Task TestSendForgotPasswordOtpAsync()
    {

        Console.Write("[INPUT] Nhập Email: ");
        var email = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(email))
        {
            Console.WriteLine("[LỖI] Email rỗng");
            return;
        }

        var request = new ForgotPasswordRequest
        {
            Email = email
        };

        // Setup mocks
        var testUser = _testUsers.FirstOrDefault(u => u.Email == email);
        
        _mockUserManager.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(testUser);

        // Service returns true even if user not found (security: don't reveal email existence)
        // Only throws exception if email is not confirmed
        if (testUser != null)
        {
            if (testUser.EmailConfirmed)
            {
                // Setup email service mock
                _mockEmailService.Setup(x => x.SendEmailAsync(
                    email, 
                    It.IsAny<string>(), 
                    It.IsAny<string>(),
                    It.IsAny<string?>(),
                    default))
                    .Returns(Task.CompletedTask);

                // Setup cache mock for OTP
                var cacheEntry = Mock.Of<ICacheEntry>();
                _mockMemoryCache.Setup(x => x.CreateEntry(It.IsAny<object>()))
                    .Returns(cacheEntry);
            }
            // If email not confirmed, service will throw UnauthorizedAccessException
        }

        try
        {
            var result = await _service.SendForgotPasswordOtpAsync(request);
            Console.WriteLine($"[THÀNH CÔNG] Gửi OTP: {result}");
            if (result)
            {
                Console.WriteLine("  OTP đã được gửi đến địa chỉ email (nếu tồn tại và đã xác thực)");
            }
            else
            {
                Console.WriteLine("  Yêu cầu đã được xử lý (không tiết lộ email có tồn tại hay không)");
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"[LỖI] UnauthorizedAccessException: {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
        }
    }

    private async Task TestLogoutAsync()
    {
        Console.WriteLine("\nTEST: LogoutAsync");
        Console.WriteLine("==================");

        try
        {
            // Setup test data
            var testUser = _testUsers[0];

            _mockUserManager.Setup(x => x.FindByIdAsync(testUser.Id))
                .ReturnsAsync(testUser);

            // Execute
            var result = await _service.LogoutAsync(testUser.Id);

            Console.WriteLine($"[THÀNH CÔNG] Đăng xuất: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    private async Task TestVerifyOtpAsync()
    {

        Console.Write("[INPUT] Nhập Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Nhập OTP: ");
        var otp = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
        {
            Console.WriteLine("[LỖI] Email và OTP là bắt buộc.");
            return;
        }

        var request = new VerifyOtpRequest
        {
            Email = email,
            Otp = otp
        };

        // Setup mock - simulate valid OTP is "123456"
        string? cachedOtp = otp == "123456" ? "123456" : null;
        bool otpExists = cachedOtp != null;

        _mockMemoryCache.Setup(x => x.TryGetValue($"otp:reset:{email}", out cachedOtp))
            .Returns(otpExists);

        try
        {
            var result = await _service.VerifyOtpAsync(request);
            if (result)
            {
                Console.WriteLine("[THÀNH CÔNG] Xác thực OTP: true");
                Console.WriteLine("  OTP hợp lệ");
            }
            else
            {
                Console.WriteLine("[LỖI] Xác thực OTP: false");
                Console.WriteLine("  OTP không hợp lệ hoặc đã hết hạn");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
        }
    }

    private async Task TestResetPasswordWithOtpAsync()
    {

        Console.Write("[INPUT] Nhập Email: ");
        var email = Console.ReadLine();

        Console.Write("[INPUT] Nhập OTP: ");
        var otp = Console.ReadLine();

        Console.Write("[INPUT] Nhập Mật khẩu mới: ");
        var newPassword = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp) || string.IsNullOrWhiteSpace(newPassword))
        {
            Console.WriteLine("[LỖI] Email, OTP và Mật khẩu mới là bắt buộc.");
            return;
        }

        var request = new ResetPasswordWithOtpRequest
        {
            Email = email,
            Otp = otp,
            NewPassword = newPassword
        };

        // Setup mocks
        var testUser = _testUsers.FirstOrDefault(u => u.Email == email);
        
        // Mock OTP validation - valid OTP is "123456"
        string? cachedOtp = otp == "123456" ? "123456" : null;
        bool otpExists = cachedOtp != null;

        _mockMemoryCache.Setup(x => x.TryGetValue($"otp:reset:{email}", out cachedOtp))
            .Returns(otpExists);

        _mockUserManager.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(testUser);

        if (testUser != null && otpExists)
        {
            _mockUserManager.Setup(x => x.GeneratePasswordResetTokenAsync(testUser))
                .ReturnsAsync("reset-token");
            
            // Check if password meets requirements (simulate validation)
            var identityResult = newPassword!.Length >= 6 
                ? IdentityResult.Success 
                : IdentityResult.Failed(new IdentityError { Description = "Password too weak" });
            
            _mockUserManager.Setup(x => x.ResetPasswordAsync(testUser, "reset-token", newPassword))
                .ReturnsAsync(identityResult);

            // Mock cache removal
            _mockMemoryCache.Setup(x => x.Remove($"otp:reset:{email}"));
        }

        try
        {
            var result = await _service.ResetPasswordWithOtpAsync(request);
            if (result)
            {
                Console.WriteLine("[THÀNH CÔNG] Đặt lại mật khẩu: true");
                Console.WriteLine("  Mật khẩu đã được đặt lại thành công");
            }
            else
            {
                Console.WriteLine("[LỖI] Đặt lại mật khẩu: false");
                Console.WriteLine("  Đặt lại mật khẩu thất bại (OTP không hợp lệ hoặc người dùng không tồn tại)");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] Exception xảy ra: {ex.Message}");
        }
    }

    private async Task TestChangePasswordAsync()
    {
        Console.WriteLine("\nTEST: ChangePasswordAsync");
        Console.WriteLine("==========================");

        try
        {
            // Setup test data
            var testUser = _testUsers[0];

            _mockUserManager.Setup(x => x.FindByIdAsync(testUser.Id))
                .ReturnsAsync(testUser);
            _mockUserManager.Setup(x => x.CheckPasswordAsync(testUser, "CurrentPassword123!"))
                .ReturnsAsync(true);
            _mockUserManager.Setup(x => x.ChangePasswordAsync(testUser, "CurrentPassword123!", "NewPassword123!"))
                .ReturnsAsync(IdentityResult.Success);

            // Execute
            var request = new ChangePasswordRequest
            {
                CurrentPassword = "CurrentPassword123!",
                NewPassword = "NewPassword123!"
            };

            var result = await _service.ChangePasswordAsync(testUser.Id, request);

            Console.WriteLine($"[THÀNH CÔNG] Đổi mật khẩu: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[LỖI] {ex.Message}");
        }
    }

    // Helper methods for user input
    private string GetStringInput(string prompt)
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return input ?? "";
    }

    // Test data initialization methods
    private List<User> InitializeTestUsers()
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
                EmailConfirmed = true,
                RoleId = "role001",
                DepartmentId = 1
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
                EmailConfirmed = false,
                RoleId = "role002",
                DepartmentId = 2
            },
            new User
            {
                Id = "user003",
                UserName = "inactive.user",
                Email = "inactive@company.com",
                FullName = "Inactive User",
                EmployeeCode = "EMP003",
                PhoneNumber = "0903456789",
                IsActive = false,
                EmailConfirmed = true,
                RoleId = "role001",
                DepartmentId = 1
            }
        };
    }

    private List<IdentityRole> InitializeTestRoles()
    {
        return new List<IdentityRole>
        {
            new IdentityRole
            {
                Id = "role001",
                Name = "EMPLOYEE"
            },
            new IdentityRole
            {
                Id = "role002",
                Name = "MANAGER"
            },
            new IdentityRole
            {
                Id = "role003",
                Name = "ADMIN"
            }
        };
    }
}
