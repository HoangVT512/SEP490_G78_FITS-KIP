using FITSKIP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Domain.Interfaces;

public interface IDashboardRepository
{
    DbSet<IncidentHistory> IncidentHistories { get; }
    DbSet<IncidentShift> IncidentShifts { get; }
    DbSet<Shift> Shifts { get; }
    DbSet<StopType> StopTypes { get; }
    DbSet<ProductionOutput> ProductionOutputs { get; }  // Added
}