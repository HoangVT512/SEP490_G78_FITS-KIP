using FITSKIP.Infrastructure.DbContexts;
using FITSKIP.Infrastructure.SeedData;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Threading.Channels;

namespace FITSKIP.API
{
    // Custom user validator to allow empty/null emails
    public class CustomUserValidator<TUser> : Microsoft.AspNetCore.Identity.UserValidator<TUser> where TUser : class
    {
        public override Task<IdentityResult> ValidateAsync(UserManager<TUser> manager, TUser user)
        {
            var errors = new List<IdentityError>();

            // Skip email validation - allow empty/null emails
            // Only validate username if it exists
            var userName = manager.GetUserNameAsync(user).Result;
            if (!string.IsNullOrEmpty(userName))
            {
                if (userName.Length < 1)
                {
                    errors.Add(new IdentityError
                    {
                        Code = "InvalidUserName",
                        Description = "Username must be at least 1 character long."
                    });
                }
            }

            return Task.FromResult(errors.Count == 0 ? IdentityResult.Success : IdentityResult.Failed(errors.ToArray()));
        }
    }

    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);            // Load optional local overrides without committing to git


            builder.Configuration
                .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();



            // Add services to the container.
            //OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Handle reference cycles in JSON serialization
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                });
            builder.Services.AddMemoryCache();
            // Add DbContext with support for test database selection
            var connectionStringName = builder.Environment.IsEnvironment("Testing") ? "TestConnection" : "DefaultConnection";
            var connectionString = builder.Configuration.GetConnectionString(connectionStringName);

            builder.Services.AddDbContext<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>(options =>
                options.UseSqlServer(connectionString));

            // Configure TwilioSettings
            builder.Services.Configure<FITSKIP.Application.Settings.TwilioSettings>(
                builder.Configuration.GetSection("Twilio"));

            // Add Identity with custom password requirements
            builder.Services.AddIdentity<FITSKIP.Domain.Entities.User, Microsoft.AspNetCore.Identity.IdentityRole>(options =>
            {
                // Password settings - simplified requirements
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 0;

                // Lockout settings (optional - you can adjust these)
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                options.User.RequireUniqueEmail = false; // Allow null/empty emails
                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+"; // Allow more characters in username
            })
            .AddEntityFrameworkStores<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>()
            .AddDefaultTokenProviders()
            .AddUserValidator<CustomUserValidator<FITSKIP.Domain.Entities.User>>();

            // DI registrations for repositories and services
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IUserRepository, FITSKIP.Infrastructure.Repositories.UserRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IUserService, FITSKIP.Application.Services.UserService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IRoleRepository, FITSKIP.Infrastructure.Repositories.RoleRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IRoleService, FITSKIP.Application.Services.RoleService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IDepartmentRepository, FITSKIP.Infrastructure.Repositories.DepartmentRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IDepartmentService, FITSKIP.Application.Services.DepartmentService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.ILineRepository, FITSKIP.Infrastructure.Repositories.LineRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.ILineService, FITSKIP.Application.Services.LineService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IRoleRepository, FITSKIP.Infrastructure.Repositories.RoleRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IRoleService, FITSKIP.Application.Services.RoleService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IStageRepository, FITSKIP.Infrastructure.Repositories.StageRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IStageService, FITSKIP.Application.Services.StageService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IEquipmentRepository, FITSKIP.Infrastructure.Repositories.EquipmentRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IEquipmentService, FITSKIP.Application.Services.EquipmentService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.INotificationRepository, FITSKIP.Infrastructure.Repositories.NotificationRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.INotificationHubService, FITSKIP.API.Services.NotificationHubService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.INotificationService, FITSKIP.Application.Services.NotificationService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IPurchaseRequestRepository, FITSKIP.Infrastructure.Repositories.PurchaseRequestRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IPurchaseRequestService, FITSKIP.Application.Services.PurchaseRequestService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.ISparePartRepository, FITSKIP.Infrastructure.Repositories.SparePartRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.ISparePartService, FITSKIP.Application.Services.SparePartService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IIncidentRepository, FITSKIP.Infrastructure.Repositories.IncidentRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IIncidentService, FITSKIP.Application.Services.IncidentService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IDashboardService, FITSKIP.Application.Services.DashboardService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IShiftRepository, FITSKIP.Infrastructure.Repositories.ShiftRepository>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IDashboardRepository, FITSKIP.Infrastructure.Repositories.DashboardRepository>();

            // Import Excel service
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IExcelImportService,
            FITSKIP.Application.Services.ExcelImportService>();
            // JWT Authentication services
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IJwtTokenService, FITSKIP.Application.Services.JwtTokenService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IAuthService, FITSKIP.Application.Services.AuthService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IEmailService, FITSKIP.Application.Services.AcsEmailService>();
            // Add HttpClient for SMS service
            builder.Services.AddHttpClient();

            // SMS Service - Use Mock for testing to avoid Twilio rate limits
            // Change back to TwilioSmsService when ready for production
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.ISmsService, FITSKIP.Application.Services.TwilioSmsService>();
            
            // Azure Storage Service
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IAzureStorageService, FITSKIP.Application.Services.AzureStorageService>();

            builder.Services.AddLogging();

            // JWT Authentication configuration
            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "your-secret-key-here-at-least-32-characters-long");

            Console.WriteLine($"JWT Issuer: {jwtSettings["Issuer"]}");
            Console.WriteLine($"JWT Audience: {jwtSettings["Audience"]}");
            Console.WriteLine($"JWT Key length: {key.Length}");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                        {
                            var token = authHeader.Substring("Bearer ".Length).Trim();
                            context.Token = token;
                            Console.WriteLine($"JWT Token received (first 40 chars): {token[..Math.Min(40, token.Length)]}...");
                        }
                        else
                        {
                            // Check if this is a SignalR request with access_token query parameter
                            var accessToken = context.Request.Query["access_token"];
                            if (!string.IsNullOrEmpty(accessToken))
                            {
                                context.Token = accessToken;
                                Console.WriteLine("JWT Token received from query parameter for SignalR");
                            }
                            else
                            {
                                Console.WriteLine("JWT Token not found in Authorization header");
                            }
                        }
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"JWT Authentication failed: {context.Exception.Message}");
                        Console.WriteLine($"JWT Exception type: {context.Exception.GetType().Name}");
                        Console.WriteLine($"JWT Stack trace: {context.Exception.StackTrace}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("JWT Token validated successfully");
                        Console.WriteLine($"JWT User: {context.Principal?.Identity?.Name}");
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        Console.WriteLine($"JWT Challenge: {context.Error}, {context.ErrorDescription}");
                        Console.WriteLine($"JWT AuthenticateFailure: {context.AuthenticateFailure?.Message}");
                        return Task.CompletedTask;
                    }
                };

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"] ?? "FITSKIP.API",
                    ValidAudience = jwtSettings["Audience"] ?? "FITSKIP.Client",
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero,
                    // Add name claim type mapping
                    NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
                };
            });

            // C1: Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy => policy
                        //.WithOrigins("http://localhost:3000") // React web
                        .SetIsOriginAllowed(origin => true) // Allow all origins - adjust for production
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()); // Required for SignalR
            });

            //C2: Giới hạn pattern IP nội bộ (tùy chọn nâng cao):
            // builder.Services.AddCors(options =>
            // {
            //     options.AddPolicy("AllowFrontend",
            //         policy => policy
            //             .SetIsOriginAllowed(origin =>
            //             {
            //                 if (origin.StartsWith("http://localhost"))
            //                     return true;
            //                 if (origin.StartsWith("http://192.168."))
            //                     return true;
            //                 if (origin.StartsWith("http://10."))
            //                     return true;
            //                 return false;
            //             })
            //             .AllowAnyHeader()
            //             .AllowAnyMethod()
            //             .AllowCredentials());
            // });

            // Add SignalR
            builder.Services.AddSignalR();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "FITSKIP API",
                    Version = "v1",
                    Description = "API cho hệ thống quản lý bảo trì nhà máy FITSKIP"
                });

                // Add JWT Authentication to Swagger
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n" +
                                  "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                                  "Example: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "FITSKIP API V1");
                    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                });
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            // Enable CORS
            app.UseCors("AllowFrontend");

            // Authentication & Authorization
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            // Map SignalR Hub with proper configuration
            app.MapHub<FITSKIP.API.Hubs.NotificationHub>("/hubs/notifications")
                .RequireAuthorization() // Require authentication
                .WithDisplayName("Notification Hub");

            // Seed data before starting the app (skip for Testing environment)
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<FitskipDbContext>();
                try
                {
                    // Apply migrations
                    await context.Database.MigrateAsync();
                    // Seed data
                    await SeedData.SeedAllData(context);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error during migration/seeding: {ex.Message}");
                    throw;
                }
            }

            app.Run();
        }
    }
}
