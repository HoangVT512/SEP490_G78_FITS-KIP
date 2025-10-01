using FITSKIP.Infrastructure.DbContexts;
using FITSKIP.Infrastructure.SeedData;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

namespace FITSKIP.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);            // Load optional local overrides without committing to git
            builder.Configuration
                .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            // Add services to the container.

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Handle reference cycles in JSON serialization
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                });

            builder.Services.AddMemoryCache();
            // Add DbContext
            builder.Services.AddDbContext<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add Identity
            builder.Services.AddIdentity<FITSKIP.Domain.Entities.User, Microsoft.AspNetCore.Identity.IdentityRole>()
                .AddEntityFrameworkStores<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>();

            // DI registrations for repositories and services
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IUserRepository, FITSKIP.Infrastructure.Repositories.UserRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IUserService, FITSKIP.Application.Services.UserService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IDepartmentRepository, FITSKIP.Infrastructure.Repositories.DepartmentRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IDepartmentService, FITSKIP.Application.Services.DepartmentService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.ILineRepository, FITSKIP.Infrastructure.Repositories.LineRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.ILineService, FITSKIP.Application.Services.LineService>();
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IStageRepository, FITSKIP.Infrastructure.Repositories.StageRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IStageService, FITSKIP.Application.Services.StageService>();

            // JWT Authentication services
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IJwtTokenService, FITSKIP.Application.Services.JwtTokenService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IAuthService, FITSKIP.Application.Services.AuthService>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IEmailService, FITSKIP.Application.Services.AcsEmailService>();
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
                            Console.WriteLine("JWT Token not found in Authorization header");
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
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy => policy
                        .WithOrigins("http://localhost:3000") // React web
                        .AllowAnyHeader()
                        .AllowAnyMethod());
            });
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
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
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
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
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

            // Seed data before starting the app
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<FitskipDbContext>();
                await SeedData.SeedAllData(context);
            }

            app.Run();
        }
    }
}
