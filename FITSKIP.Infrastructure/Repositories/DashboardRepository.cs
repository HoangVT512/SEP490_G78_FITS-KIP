using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly FitskipDbContext _context;

    public DashboardRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public DbSet<IncidentHistory> IncidentHistories => _context.IncidentHistories;
    public DbSet<IncidentShift> IncidentShifts => _context.IncidentShifts;
    public DbSet<Shift> Shifts => _context.Shifts;
    public DbSet<StopType> StopTypes => _context.StopTypes;
    public DbSet<ProductionOutput> ProductionOutputs => _context.ProductionOutputs;  // Added
}