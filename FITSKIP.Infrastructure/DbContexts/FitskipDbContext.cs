using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class FitskipDbContext : IdentityDbContext<User>
{
    public FitskipDbContext()
    {
    }

    public FitskipDbContext(DbContextOptions<FitskipDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Equipment> Equipment { get; set; }

    public virtual DbSet<IncidentHistory> IncidentHistories { get; set; }

    public virtual DbSet<Line> Lines { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<MaintenancePlan> MaintenancePlans { get; set; }

    public virtual DbSet<MaintenanceChecklistItem> MaintenanceChecklistItems { get; set; }

    public virtual DbSet<ProductionOutput> ProductionOutputs { get; set; }

    public virtual DbSet<PurchaseRequest> PurchaseRequests { get; set; }

    public virtual DbSet<ReplacementHistory> ReplacementHistories { get; set; }

    public virtual DbSet<Shift> Shifts { get; set; }

    public virtual DbSet<ShiftSlot> ShiftSlots { get; set; }

    public virtual DbSet<SparePart> SpareParts { get; set; }

    public virtual DbSet<Stage> Stages { get; set; }

    public virtual DbSet<StopType> StopTypes { get; set; }

    public virtual DbSet<UserLine> UserLines { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string is configured in Program.cs via DI
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Important: Call base để Identity có thể configure

        // Ignore Identity tables that we don't need
        modelBuilder.Ignore<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>();
        modelBuilder.Ignore<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>();
        modelBuilder.Ignore<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>();
        modelBuilder.Ignore<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>();
        // Keep AspNetRoleClaims table - don't ignore it

        // Configure custom User properties and relationship with Role
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.FullName).HasMaxLength(250);
            entity.Property(e => e.EmployeeCode).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.RoleId).HasMaxLength(450);

            // Configure one-to-many relationship with Role
            entity.HasOne(e => e.Role)
                .WithMany()
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_AspNetUsers_AspNetRoles_RoleId");

            // Configure many-to-one relationship with Department
            entity.HasOne(e => e.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_AspNetUsers_Departments_DepartmentId");

            // Ignore MaintenancePlans collection to prevent shadow UserId in MaintenancePlan
            entity.Ignore(e => e.MaintenancePlans);
        });

        // Department configuration
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.DepartmentId).HasName("PK__Departme__B2079BCDAEAF02C2");

            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.DepartmentName).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ManagerId).HasMaxLength(450);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Configure Manager relationship (ManagerId points to a User, but not part of Users collection)
            entity.HasOne(d => d.Manager)
                .WithMany()
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__Departmen__Manag__619B8048");
        });

        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasKey(e => e.EquipmentId).HasName("PK__Equipmen__34474599BD4FBDFE");

            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.EquipmentCode).HasMaxLength(50);
            entity.Property(e => e.EquipmentName).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Origin).HasMaxLength(150);
            entity.Property(e => e.Qrcode).HasColumnName("QRCode");
            entity.Property(e => e.StageId).HasColumnName("StageID");
            entity.Property(e => e.Yom).HasColumnName("YOM");

            // Only StageId relationship - Stage.Equipment collection is ignored
            entity.HasOne(d => d.Stage).WithMany()
                .HasForeignKey(d => d.StageId)
                .HasConstraintName("FK__Equipment__Stage__70DDC3D8");
        });

        modelBuilder.Entity<IncidentHistory>(entity =>
        {
            entity.HasKey(e => e.IncidentId).HasName("PK__Incident__5F46CAB00C9D9F0A");

            entity.ToTable("IncidentHistory");

            entity.Property(e => e.IncidentId).HasColumnName("IncidentID");
            entity.Property(e => e.Duration).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.SlotId).HasColumnName("SlotID");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.TypeId).HasColumnName("TypeID");
            entity.Property(e => e.Issue).HasMaxLength(500);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime").HasDefaultValueSql("GETDATE()");

            // Equipment, Type, and Slot relationships - no reverse collections
            entity.HasOne(d => d.Equipment).WithMany()
                .HasForeignKey(d => d.EquipmentId)
                .HasConstraintName("FK__IncidentH__Equip__7B5B524B");

            entity.HasOne(d => d.Type).WithMany(p => p.IncidentHistories)
                .HasForeignKey(d => d.TypeId)
                .HasConstraintName("FK__IncidentH__TypeI__7F2BE32F");

            entity.HasOne(d => d.Slot).WithMany()
                .HasForeignKey(d => d.SlotId)
                .HasConstraintName("FK__IncidentH__SlotI__8A2B4C5D");
        });

        modelBuilder.Entity<Line>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__Lines__2EAE64C9765DBF83");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.LineName).HasMaxLength(250);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Department).WithMany(p => p.Lines)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("FK__Lines__Departmen__6A30C650");

            // Ignore collections to prevent shadow properties
            entity.Ignore(e => e.Equipment);
            entity.Ignore(e => e.IncidentHistories);
        });

        modelBuilder.Entity<MaintenancePlan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Maintena__755C22D75A5E8C31");

            entity.Property(e => e.PlanId).HasColumnName("PlanID");
            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.IntervalType).HasMaxLength(20);
            entity.Property(e => e.AssignedTo).HasMaxLength(450);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Equipment relationship - no reverse collection
            entity.HasOne(d => d.Equipment).WithMany()
                .HasForeignKey(d => d.EquipmentId)
                .HasConstraintName("FK__MaintenanPlan__Equip__1234567");

            // AssignedTo relationship - no reverse collection
            entity.HasOne(d => d.AssignedToUser).WithMany()
                .HasForeignKey(d => d.AssignedTo)
                .HasConstraintName("FK__MaintenanPlan__User__2345678");
        });

        modelBuilder.Entity<MaintenanceChecklistItem>(entity =>
        {
            entity.HasKey(e => e.ChecklistId).HasName("PK__Maintena__26C4E2F5A1234567");

            entity.Property(e => e.ChecklistId).HasColumnName("ChecklistID");
            entity.Property(e => e.PlanId).HasColumnName("PlanID");
            entity.Property(e => e.StepName).HasMaxLength(200);
            entity.Property(e => e.CompletedDate).HasColumnType("datetime");
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasOne(d => d.Plan).WithMany(p => p.ChecklistItems)
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Maintena__PlanID__3456789");
        });

        modelBuilder.Entity<ProductionOutput>(entity =>
        {
            entity.HasKey(e => e.OutputId).HasName("PK__Producti__CE7609460B69FF1F");

            entity.Property(e => e.OutputId).HasColumnName("OutputID");
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.ShiftSlotId).HasColumnName("ShiftSlotID");
            entity.Property(e => e.TargetQuantity).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IdealCycleTime).HasColumnType("decimal(10, 4)");

            entity.HasOne(d => d.Line).WithMany(p => p.ProductionOutputs)
                .HasForeignKey(d => d.LineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Productio__LineI__08B54D69");

            // ShiftSlot relationship - no reverse collection to prevent ShiftId shadow property
            entity.HasOne(d => d.ShiftSlot).WithMany()
                .HasForeignKey(d => d.ShiftSlotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Productio__ShiftSlot__0A9D95DB");
        });

        modelBuilder.Entity<PurchaseRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__Purchase__33A8519A9AC26C34");

            entity.Property(e => e.RequestId).HasColumnName("RequestID");
            entity.Property(e => e.ApprovedAt).HasColumnType("datetime");
            entity.Property(e => e.RejectedAt).HasColumnType("datetime");
            entity.Property(e => e.ApprovedBy).HasMaxLength(450);
            entity.Property(e => e.RejectedBy).HasMaxLength(450);
            entity.Property(e => e.PartId).HasColumnName("PartID");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.RequestedBy).HasMaxLength(450);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.PurchaseRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__PurchaseR__Appro__151B244E");

            entity.HasOne(d => d.RejectedByNavigation).WithMany(p => p.PurchaseRequestRejectedByNavigations)
                .HasForeignKey(d => d.RejectedBy)
                .HasConstraintName("FK__PurchaseR__Rejec__151B245F");

            entity.HasOne(d => d.Part).WithMany(p => p.PurchaseRequests)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PurchaseR__PartI__1332DBDC");

            entity.HasOne(d => d.RequestedByNavigation).WithMany(p => p.PurchaseRequestRequestedByNavigations)
                .HasForeignKey(d => d.RequestedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PurchaseR__Reque__14270015");
        });

        modelBuilder.Entity<ReplacementHistory>(entity =>
        {
            entity.HasKey(e => e.ReplacementId).HasName("PK__Replacem__55AB07E93456789A");

            entity.Property(e => e.ReplacementId).HasColumnName("ReplacementID");
            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.PartId).HasColumnName("PartID");
            entity.Property(e => e.ReplacedDate).HasColumnType("datetime");
            entity.Property(e => e.ReplacedBy).HasMaxLength(450);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.Remarks).HasMaxLength(500);

            // Equipment relationship - no reverse collection
            entity.HasOne(d => d.Equipment).WithMany()
                .HasForeignKey(d => d.EquipmentId)
                .HasConstraintName("FK__Replaceme__Equip__4567890A");

            entity.HasOne(d => d.Part).WithMany(p => p.ReplacementHistories)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Replaceme__PartI__5678901B");

            entity.HasOne(d => d.ReplacedByNavigation).WithMany(p => p.ReplacementHistories)
                .HasForeignKey(d => d.ReplacedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Replaceme__Repla__6789012C");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__Shifts__C0A838E1E127179C");

            entity.Property(e => e.ShiftId).HasColumnName("ShiftID");
            entity.Property(e => e.ShiftName).HasMaxLength(50);

            // Ignore ProductionOutputs collection to prevent shadow ShiftId
            entity.Ignore(e => e.ProductionOutputs);
        });

        modelBuilder.Entity<ShiftSlot>(entity =>
        {
            entity.HasKey(e => e.SlotId).HasName("PK__ShiftSlo__0A124A4FF4CC8D65");

            entity.Property(e => e.SlotId).HasColumnName("SlotID");
            entity.Property(e => e.ShiftId).HasColumnName("ShiftID");

            entity.HasOne(d => d.Shift).WithMany(p => p.ShiftSlots)
                .HasForeignKey(d => d.ShiftId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftSlot__Shift__76969D2E");

            // Ignore ProductionOutputs collection - already handled in ProductionOutput config
            entity.Ignore(e => e.ProductionOutputs);
        });

        modelBuilder.Entity<SparePart>(entity =>
        {
            entity.HasKey(e => e.PartId).HasName("PK__SparePar__7C3F0D30890EDD23");

            entity.Property(e => e.PartId).HasColumnName("PartID");
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.PartName).HasMaxLength(100);
            entity.Property(e => e.PartNumber).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Available");
        });

        modelBuilder.Entity<Stage>(entity =>
        {
            entity.HasKey(e => e.StageId).HasName("PK__Stages__03EB7AF84C50ECAB");

            entity.Property(e => e.StageId).HasColumnName("StageID");
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.StageName).HasMaxLength(100);

            entity.HasOne(d => d.Line).WithMany(p => p.Stages)
                .HasForeignKey(d => d.LineId)
                .HasConstraintName("FK__Stages__LineID__6D0D32F4");

            // Ignore Equipment collection to prevent shadow StageId in Equipment
            entity.Ignore(e => e.Equipment);
        });

        modelBuilder.Entity<StopType>(entity =>
        {
            entity.HasKey(e => e.TypeId).HasName("PK__StopType__516F0395AE2FC0CE");

            entity.ToTable("StopType");

            entity.Property(e => e.TypeId).HasColumnName("TypeID");
            entity.Property(e => e.TypeName).HasMaxLength(250);
        });

        modelBuilder.Entity<UserLine>(entity =>
        {
            entity.HasKey(e => e.UserLineId).HasName("PK__UserLine__3B1F2081CE44FE03");

            entity.Property(e => e.UserLineId).HasColumnName("UserLineID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.Line).WithMany(p => p.UserLines)
                .HasForeignKey(d => d.LineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserLines__LineI__03F0984C");

            entity.HasOne(d => d.User).WithMany(p => p.UserLines)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserLines__UserI__02FC7413");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notification__NotificationID");

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.UserId).HasMaxLength(450);
            entity.Property(e => e.Message).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime").HasDefaultValueSql("GETDATE()");

            entity.HasOne(d => d.User).WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Notifications_Users_UserId");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
