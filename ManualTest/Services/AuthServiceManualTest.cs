/*using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Moq;
using Microsoft.AspNetCore.Http;

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
    private readonly AuthService _service;
    private readonly List<User> _testData;
    private readonly List<IdentityRole> _roleTestData;

    public AuthServiceManualTest()
    {
        // Setup mocks
        _mockUserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);
        _mockSignInManager = new Mock<SignInManager<User>>(
            _mockUserManager.Object, Mock.Of<IHttpContextAccessor>(), Mock.Of<IUserClaimsPrincipalFactory<User>>(), null, null, null, null);
        _mockJwtTokenService = new Mock<IJwtTokenService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockMemoryCache = new Mock<IMemoryCache>();
        _mockConfiguration = new Mock<IConfiguration>();
        _mockRoleManager = new Mock<RoleManager<IdentityRole>>(
            Mock.Of<IRoleStore<IdentityRole>>(), null, null, null, null);

        _service = new AuthService(
            _mockUserManager.Object,
            _mockSignInManager.Object,
            _mockJwtTokenService.Object,
            _mockEmailService.Object,
            _mockMemoryCache.Object,
            _mockConfiguration.Object,
            _mockRoleManager.Object);

        _testData = InitializeTestData();
        _roleTestData = InitializeRoleTestData();
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
                    await TestLoginAsync();
                    break;
                case "2":
                    await TestLogoutAsync();
                    break;
                case "3":
                    await TestSendForgotPasswordOtpAsync();
                    break;
                case "4":
                    await TestVerifyOtpAsync();
                    break;
                case "5":
                    await TestResetPasswordWithOtpAsync();
                    break;
                case "6":
                    await TestChangePasswordAsync();
                    break;
                case "7":
                    await TestSendEmailVerificationAsync();
                    break;
                case "8":
                    await TestVerifyEmailAsync();
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
        Console.WriteLine("AUTH SERVICE TEST MENU");
        Console.WriteLine("======================");
        Console.WriteLine("1. Test LoginAsync");
        Console.WriteLine("2. Test LogoutAsync ()");
        Console.WriteLine("3. Test SendForgotPasswordOtpAsync ()");
        Console.WriteLine("4. Test VerifyOtpAsync ()");
        Console.WriteLine("5. Test ResetPasswordWithOtpAsync ()");
        Console.WriteLine("6. Test ChangePasswordAsync ()");
        Console.WriteLine("7. Test SendEmailVerificationAsync ()");
        Console.WriteLine("8. Test VerifyEmailAsync ()");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestLoginAsync()
    {
        Console.WriteLine("\nTesting LoginAsync...");
        Console.WriteLine("====================");

        Console.Write("Enter Email or Employee Code: ");
        var emailOrEmployeeCode = Console.ReadLine();

        Console.Write("Enter Password: ");
        var password = Console.ReadLine();

        Console.Write("Remember Me? (true/false): ");
        var rememberMeInput = Console.ReadLine();
        bool rememberMe = false;
        if (!string.IsNullOrWhiteSpace(rememberMeInput) && bool.TryParse(rememberMeInput, out bool parsedRememberMe))
        {
            rememberMe = parsedRememberMe;
        }

        var request = new LoginRequest
        {
            EmailOrEmployeeCode = emailOrEmployeeCode ?? "",
            Password = password ?? "",
            RememberMe = rememberMe
        };

        // Find user by email or employee code
        var user = _testData.FirstOrDefault(u =>
            u.Email == emailOrEmployeeCode || u.EmployeeCode == emailOrEmployeeCode);

        // Setup mocks
        _mockUserManager.Setup(x => x.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(user?.Email == emailOrEmployeeCode ? user : null);

        _mockUserManager.Setup(x => x.Users)
            .Returns(_testData.AsQueryable());

        _mockSignInManager.Setup(x => x.CheckPasswordSignInAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<bool>()))
            .ReturnsAsync(user != null ? SignInResult.Success : SignInResult.Failed);

        if (user != null)
        {
            var role = _roleTestData.FirstOrDefault(r => r.Id == user.RoleId);
            _mockRoleManager.Setup(x => x.FindByIdAsync(It.IsAny<string>()))
                .ReturnsAsync(role);

            _mockJwtTokenService.Setup(x => x.GenerateTokenAsync(It.IsAny<User>(), It.IsAny<List<string>>()))
                .ReturnsAsync("mock-jwt-token");
        }

        try
        {
            Console.WriteLine("Executing LoginAsync...");
            var result = await _service.LoginAsync(request);

            Console.WriteLine("Login successful:");
            Console.WriteLine($"   Token: {result.Token}");
            Console.WriteLine($"   Expiration: {result.Expiration}");
            Console.WriteLine($"   User ID: {result.User.Id}");
            Console.WriteLine($"   User Name: {result.User.UserName}");
            Console.WriteLine($"   Email: {result.User.Email}");
            Console.WriteLine($"   Full Name: {result.User.FullName}");
            Console.WriteLine($"   Employee Code: {result.User.EmployeeCode}");
            Console.WriteLine($"   Is Active: {result.User.IsActive}");
            Console.WriteLine($"   Roles: {string.Join(", ", result.User.Roles ?? new List<string>())}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestLogoutAsync()
    {
        Console.WriteLine("\nTesting LogoutAsync ()...");
        Console.WriteLine("=========================");

        Console.Write("Enter User ID to logout: ");
        var userId = Console.ReadLine();

        var user = _testData.FirstOrDefault(u => u.Id == userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId ?? ""))
            .ReturnsAsync(user);

        try
        {
            Console.WriteLine($"Executing LogoutAsync with User ID: {userId}...");
            var result = await _service.LogoutAsync(userId ?? "");

            Console.WriteLine($"Logout result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestSendForgotPasswordOtpAsync()
    {
        Console.WriteLine("\nTesting SendForgotPasswordOtpAsync ()...");
        Console.WriteLine("=======================================");

        Console.Write("Enter Email: ");
        var email = Console.ReadLine();

        var request = new ForgotPasswordRequest
        {
            Email = email ?? ""
        };

        var user = _testData.FirstOrDefault(u => u.Email == email);

        _mockUserManager.Setup(x => x.FindByEmailAsync(email ?? ""))
            .ReturnsAsync(user);

        _mockConfiguration.Setup(x => x["Otp:ExpireMinutes"])
            .Returns("10");

        _mockMemoryCache.Setup(x => x.Set(It.IsAny<object>(), It.IsAny<object>(), It.IsAny<TimeSpan>()));

        _mockEmailService.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine($"Executing SendForgotPasswordOtpAsync with Email: {email}...");
            var result = await _service.SendForgotPasswordOtpAsync(request);

            Console.WriteLine($"Send OTP result: {result}");
            if (result)
            {
                Console.WriteLine("OTP sent successfully to email");
            }
            else
            {
                Console.WriteLine("Failed to send OTP");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestVerifyOtpAsync()
    {
        Console.WriteLine("\nTesting VerifyOtpAsync ()...");
        Console.WriteLine("=============================");

        Console.Write("Enter Email: ");
        var email = Console.ReadLine();

        Console.Write("Enter OTP: ");
        var otp = Console.ReadLine();

        var request = new VerifyOtpRequest
        {
            Email = email ?? "",
            Otp = otp ?? ""
        };

        // Mock cache with stored OTP
        var mockCacheEntry = new Mock<ICacheEntry>();
        mockCacheEntry.Setup(x => x.Value).Returns("123456"); // Mock stored OTP

        _mockMemoryCache.Setup(x => x.TryGetValue<string>(It.IsAny<object>(), out It.Ref<string>.IsAny))
            .Returns((object key, out string value) =>
            {
                value = "123456"; // Mock stored OTP
                return true;
            });

        try
        {
            Console.WriteLine($"Executing VerifyOtpAsync with Email: {email}, OTP: {otp}...");
            var result = await _service.VerifyOtpAsync(request);

            Console.WriteLine($"Verify OTP result: {result}");
            if (result)
            {
                Console.WriteLine("OTP verification successful");
            }
            else
            {
                Console.WriteLine("OTP verification failed");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestResetPasswordWithOtpAsync()
    {
        Console.WriteLine("\nTesting ResetPasswordWithOtpAsync ()...");
        Console.WriteLine("=======================================");

        Console.Write("Enter Email: ");
        var email = Console.ReadLine();

        Console.Write("Enter OTP: ");
        var otp = Console.ReadLine();

        Console.Write("Enter New Password: ");
        var newPassword = Console.ReadLine();

        var request = new ResetPasswordWithOtpRequest
        {
            Email = email ?? "",
            Otp = otp ?? "",
            NewPassword = newPassword ?? ""
        };

        var user = _testData.FirstOrDefault(u => u.Email == email);

        _mockUserManager.Setup(x => x.FindByEmailAsync(email ?? ""))
            .ReturnsAsync(user);

        _mockMemoryCache.Setup(x => x.TryGetValue<string>(It.IsAny<object>(), out It.Ref<string>.IsAny))
            .Returns((object key, out string value) =>
            {
                value = "123456"; // Mock stored OTP
                return true;
            });

        if (user != null)
        {
            _mockUserManager.Setup(x => x.GeneratePasswordResetTokenAsync(It.IsAny<User>()))
                .ReturnsAsync("mock-reset-token");

            _mockUserManager.Setup(x => x.ResetPasswordAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
        }

        _mockMemoryCache.Setup(x => x.Remove(It.IsAny<object>()));

        try
        {
            Console.WriteLine($"Executing ResetPasswordWithOtpAsync with Email: {email}...");
            var result = await _service.ResetPasswordWithOtpAsync(request);

            Console.WriteLine($"Reset password result: {result}");
            if (result)
            {
                Console.WriteLine("Password reset successful");
            }
            else
            {
                Console.WriteLine("Password reset failed");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestChangePasswordAsync()
    {
        Console.WriteLine("\nTesting ChangePasswordAsync ()...");
        Console.WriteLine("==================================");

        Console.Write("Enter User ID: ");
        var userId = Console.ReadLine();

        Console.Write("Enter Current Password: ");
        var currentPassword = Console.ReadLine();

        Console.Write("Enter New Password: ");
        var newPassword = Console.ReadLine();

        Console.Write("Enter Confirm Password: ");
        var confirmPassword = Console.ReadLine();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = currentPassword ?? "",
            NewPassword = newPassword ?? "",
            ConfirmPassword = confirmPassword ?? ""
        };

        var user = _testData.FirstOrDefault(u => u.Id == userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId ?? ""))
            .ReturnsAsync(user);

        if (user != null)
        {
            _mockUserManager.Setup(x => x.CheckPasswordAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(true); // Mock current password is valid

            _mockUserManager.Setup(x => x.ChangePasswordAsync(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
        }

        try
        {
            Console.WriteLine($"Executing ChangePasswordAsync with User ID: {userId}...");
            var result = await _service.ChangePasswordAsync(userId ?? "", request);

            Console.WriteLine($"Change password result: {result}");
            if (result)
            {
                Console.WriteLine("Password changed successfully");
            }
            else
            {
                Console.WriteLine("Password change failed");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestSendEmailVerificationAsync()
    {
        Console.WriteLine("\nTesting SendEmailVerificationAsync ()...");
        Console.WriteLine("========================================");

        Console.Write("Enter User ID: ");
        var userId = Console.ReadLine();

        var user = _testData.FirstOrDefault(u => u.Id == userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId ?? ""))
            .ReturnsAsync(user);

        if (user != null)
        {
            _mockUserManager.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<User>()))
                .ReturnsAsync("mock-confirmation-token");
        }

        _mockConfiguration.Setup(x => x["Frontend:Url"])
            .Returns("http://localhost:3000");

        _mockEmailService.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine($"Executing SendEmailVerificationAsync with User ID: {userId}...");
            var result = await _service.SendEmailVerificationAsync(userId ?? "");

            Console.WriteLine($"Send email verification result: {result}");
            if (result)
            {
                Console.WriteLine("Email verification sent successfully");
            }
            else
            {
                Console.WriteLine("Failed to send email verification");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private async Task TestVerifyEmailAsync()
    {
        Console.WriteLine("\nTesting VerifyEmailAsync ()...");
        Console.WriteLine("==============================");

        Console.Write("Enter User ID: ");
        var userId = Console.ReadLine();

        Console.Write("Enter Verification Token: ");
        var token = Console.ReadLine();

        var user = _testData.FirstOrDefault(u => u.Id == userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId ?? ""))
            .ReturnsAsync(user);

        if (user != null)
        {
            _mockUserManager.Setup(x => x.ConfirmEmailAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);
        }

        try
        {
            Console.WriteLine($"Executing VerifyEmailAsync with User ID: {userId}...");
            var result = await _service.VerifyEmailAsync(userId ?? "", token ?? "");

            Console.WriteLine($"Verify email result: {result}");
            if (result)
            {
                Console.WriteLine("Email verification successful");
            }
            else
            {
                Console.WriteLine("Email verification failed");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private List<User> InitializeTestData()
    {
        return new List<User>
        {
            new User
            {
                Id = "USER001",
                UserName = "nguyenvana",
                Email = "nguyenvana@company.com",
                FullName = "Nguyễn Văn A",
                EmployeeCode = "EMP001",
                PhoneNumber = "0123456789",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                IsActive = true,
                RoleId = "ROLE001"
            },
            new User
            {
                Id = "USER002",
                UserName = "tranthib",
                Email = "tranthib@company.com",
                FullName = "Trần Thị B",
                EmployeeCode = "EMP002",
                PhoneNumber = "0987654321",
                EmailConfirmed = false,
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                IsActive = true,
                RoleId = "ROLE002"
            },
            new User
            {
                Id = "USER003",
                UserName = "phamvanc",
                Email = "phamvanc@company.com",
                FullName = "Phạm Văn C",
                EmployeeCode = "EMP003",
                PhoneNumber = "0555666777",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = true,
                LockoutEnabled = true,
                AccessFailedCount = 2,
                IsActive = false,
                RoleId = "ROLE001"
            },
            new User
            {
                Id = "MGR001",
                UserName = "levand",
                Email = "levand@company.com",
                FullName = "Lê Văn D",
                EmployeeCode = "MGR001",
                PhoneNumber = "0111222333",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                IsActive = true,
                RoleId = "ROLE003"
            },
            new User
            {
                Id = "ADMIN001",
                UserName = "admin",
                Email = "admin@company.com",
                FullName = "Administrator",
                EmployeeCode = "ADMIN001",
                PhoneNumber = "0999888777",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = true,
                AccessFailedCount = 0,
                IsActive = true,
                RoleId = "ROLE004"
            }
        };
    }

    private List<IdentityRole> InitializeRoleTestData()
    {
        return new List<IdentityRole>
        {
            new IdentityRole
            {
                Id = "ROLE001",
                Name = "Nhân viên",
                NormalizedName = "NHANVIEN"
            },
            new IdentityRole
            {
                Id = "ROLE002",
                Name = "Kỹ thuật viên",
                NormalizedName = "KYTHUATVIEN"
            },
            new IdentityRole
            {
                Id = "ROLE003",
                Name = "Quản lý",
                NormalizedName = "QUANLY"
            },
            new IdentityRole
            {
                Id = "ROLE004",
                Name = "Quản trị viên",
                NormalizedName = "QUANTRI"
            }
        };
    }
}
*/