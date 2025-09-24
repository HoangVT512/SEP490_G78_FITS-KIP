
namespace FITSKIP.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load optional local overrides without committing to git
            builder.Configuration
                .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            // Add services to the container.

            builder.Services.AddControllers();
            // DI registrations for sample endpoint
            builder.Services.AddScoped<FITSKIP.Domain.Interfaces.IUserRepository, FITSKIP.Infrastructure.Repositories.InMemoryUserRepository>();
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

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
