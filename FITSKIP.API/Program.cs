
using FITSKIP.Infrastructure.DbContexts;
using FITSKIP.Infrastructure.SeedData;
using Microsoft.EntityFrameworkCore;

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

            builder.Services.AddControllers();
            // Add DbContext
            builder.Services.AddDbContext<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add Identity
            builder.Services.AddIdentity<FITSKIP.Domain.Entities.User, Microsoft.AspNetCore.Identity.IdentityRole>()
                .AddEntityFrameworkStores<FITSKIP.Infrastructure.DbContexts.FitskipDbContext>();

            // DI registrations for sample endpoint
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IUserRepository, FITSKIP.Infrastructure.Repositories.UserRepository>();
            builder.Services.AddScoped<FITSKIP.Application.Interfaces.IUserService, FITSKIP.Application.Services.UserService>();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy => policy
                        .WithOrigins("http://localhost:5173") // React web
                        .AllowAnyHeader()
                        .AllowAnyMethod());
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Seed data
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<FitskipDbContext>();
                await SeedData.SeedAsync(context);
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            // Seed data before starting the app
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<FitskipDbContext>();
                await SeedData.SeedAsync(context);
            }

            app.Run();
        }
    }
}
