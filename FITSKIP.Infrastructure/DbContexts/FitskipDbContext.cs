using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class FitskipDbContext : DbContext
{
    public FitskipDbContext()
    {
    }

    public FitskipDbContext(DbContextOptions<FitskipDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Equipment> Equipment { get; set; }

    public virtual DbSet<ErrorHistory> ErrorHistories { get; set; }

    public virtual DbSet<GroupLine> GroupLines { get; set; }

    public virtual DbSet<Line> Lines { get; set; }

    public virtual DbSet<MaintenanceAssignment> MaintenanceAssignments { get; set; }

    public virtual DbSet<ProductionOutput> ProductionOutputs { get; set; }

    public virtual DbSet<PurchaseRequest> PurchaseRequests { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

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
        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AspNetRo__3214EC07B5BF2996");

            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AspNetRo__3214EC07FC6E9DBD");

            entity.Property(e => e.RoleId).HasMaxLength(450);

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AspNetRol__RoleI__59063A47");
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AspNetUs__3214EC075196AD25");

            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.EmployeeCode).HasMaxLength(50);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.LockoutEnabled).HasDefaultValue(true);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Position).HasMaxLength(100);
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__AspNetUse__RoleI__534D60F1"),
                    l => l.HasOne<AspNetUser>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__AspNetUse__UserI__52593CB8"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId").HasName("PK__AspNetUs__AF2760ADE8FDAD09");
                        j.ToTable("AspNetUserRoles");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AspNetUs__3214EC07305DEDA8");

            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AspNetUse__UserI__5629CD9C");
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey }).HasName("PK__AspNetUs__2B2C5B520838E94C");

            entity.Property(e => e.ProviderDisplayName).HasMaxLength(100);
            entity.Property(e => e.UserId).HasMaxLength(450);

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AspNetUse__UserI__5BE2A6F2");
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name }).HasName("PK__AspNetUs__8CC49841F97A0C97");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AspNetUse__UserI__5EBF139D");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.DepartmentId).HasName("PK__Departme__B2079BCDAEAF02C2");

            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.DepartmentName).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ManagerId).HasMaxLength(450);

            entity.HasOne(d => d.Manager).WithMany(p => p.Departments)
                .HasForeignKey(d => d.ManagerId)
                .HasConstraintName("FK__Departmen__Manag__619B8048");
        });

        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasKey(e => e.EquipmentId).HasName("PK__Equipmen__34474599BD4FBDFE");

            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.EquipmentCode).HasMaxLength(50);
            entity.Property(e => e.EquipmentName).HasMaxLength(255);
            entity.Property(e => e.IdCode).HasMaxLength(250);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.Origin).HasMaxLength(150);
            entity.Property(e => e.Qrcode).HasColumnName("QRCode");
            entity.Property(e => e.StageId).HasColumnName("StageID");
            entity.Property(e => e.Yom).HasColumnName("YOM");

            entity.HasOne(d => d.Line).WithMany(p => p.Equipment)
                .HasForeignKey(d => d.LineId)
                .HasConstraintName("FK__Equipment__LineI__71D1E811");

            entity.HasOne(d => d.Stage).WithMany(p => p.Equipment)
                .HasForeignKey(d => d.StageId)
                .HasConstraintName("FK__Equipment__Stage__70DDC3D8");
        });

        modelBuilder.Entity<ErrorHistory>(entity =>
        {
            entity.HasKey(e => e.ErrorId).HasName("PK__ErrorHis__358565CA8E27F35E");

            entity.ToTable("ErrorHistory");

            entity.Property(e => e.ErrorId).HasColumnName("ErrorID");
            entity.Property(e => e.Duration).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.EquipmentId).HasColumnName("EquipmentID");
            entity.Property(e => e.ErrorDescription).HasMaxLength(255);
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.SlotId).HasColumnName("SlotID");
            entity.Property(e => e.StageId).HasColumnName("StageID");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.TypeId).HasColumnName("TypeID");

            entity.HasOne(d => d.Equipment).WithMany(p => p.ErrorHistories)
                .HasForeignKey(d => d.EquipmentId)
                .HasConstraintName("FK__ErrorHist__Equip__7B5B524B");

            entity.HasOne(d => d.Line).WithMany(p => p.ErrorHistories)
                .HasForeignKey(d => d.LineId)
                .HasConstraintName("FK__ErrorHist__LineI__7D439ABD");

            entity.HasOne(d => d.Slot).WithMany(p => p.ErrorHistories)
                .HasForeignKey(d => d.SlotId)
                .HasConstraintName("FK__ErrorHist__SlotI__7E37BEF6");

            entity.HasOne(d => d.Stage).WithMany(p => p.ErrorHistories)
                .HasForeignKey(d => d.StageId)
                .HasConstraintName("FK__ErrorHist__Stage__7C4F7684");

            entity.HasOne(d => d.Type).WithMany(p => p.ErrorHistories)
                .HasForeignKey(d => d.TypeId)
                .HasConstraintName("FK__ErrorHist__TypeI__7F2BE32F");
        });

        modelBuilder.Entity<GroupLine>(entity =>
        {
            entity.HasKey(e => e.GroupLineId).HasName("PK__GroupLin__23A523FB9505A5CE");

            entity.Property(e => e.GroupLineId).HasColumnName("GroupLineID");
            entity.Property(e => e.GroupLineName).HasMaxLength(250);
            entity.Property(e => e.RoomId).HasColumnName("RoomID");

            entity.HasOne(d => d.Room).WithMany(p => p.GroupLines)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__GroupLine__RoomI__6754599E");
        });

        modelBuilder.Entity<Line>(entity =>
        {
            entity.HasKey(e => e.LineId).HasName("PK__Lines__2EAE64C9765DBF83");

            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.GroupLineId).HasColumnName("GroupLineID");
            entity.Property(e => e.LineName).HasMaxLength(250);

            entity.HasOne(d => d.GroupLine).WithMany(p => p.Lines)
                .HasForeignKey(d => d.GroupLineId)
                .HasConstraintName("FK__Lines__GroupLine__6A30C649");
        });

        modelBuilder.Entity<MaintenanceAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__Maintena__32499E57A8B16523");

            entity.Property(e => e.AssignmentId).HasColumnName("AssignmentID");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CompletedAt).HasColumnType("datetime");
            entity.Property(e => e.ErrorId).HasColumnName("ErrorID");
            entity.Property(e => e.TechnicianId)
                .HasMaxLength(450)
                .HasColumnName("TechnicianID");

            entity.HasOne(d => d.Error).WithMany(p => p.MaintenanceAssignments)
                .HasForeignKey(d => d.ErrorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Maintenan__Error__18EBB532");

            entity.HasOne(d => d.Technician).WithMany(p => p.MaintenanceAssignments)
                .HasForeignKey(d => d.TechnicianId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Maintenan__Techn__19DFD96B");
        });

        modelBuilder.Entity<ProductionOutput>(entity =>
        {
            entity.HasKey(e => e.OutputId).HasName("PK__Producti__CE7609460B69FF1F");

            entity.Property(e => e.OutputId).HasColumnName("OutputID");
            entity.Property(e => e.ActualQuantity).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.LineId).HasColumnName("LineID");
            entity.Property(e => e.ShiftId).HasColumnName("ShiftID");
            entity.Property(e => e.StageId).HasColumnName("StageID");

            entity.HasOne(d => d.Line).WithMany(p => p.ProductionOutputs)
                .HasForeignKey(d => d.LineId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Productio__LineI__08B54D69");

            entity.HasOne(d => d.Shift).WithMany(p => p.ProductionOutputs)
                .HasForeignKey(d => d.ShiftId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Productio__Shift__0A9D95DB");

            entity.HasOne(d => d.Stage).WithMany(p => p.ProductionOutputs)
                .HasForeignKey(d => d.StageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Productio__Stage__09A971A2");
        });

        modelBuilder.Entity<PurchaseRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__Purchase__33A8519A9AC26C34");

            entity.Property(e => e.RequestId).HasColumnName("RequestID");
            entity.Property(e => e.ApprovedAt).HasColumnType("datetime");
            entity.Property(e => e.ApprovedBy).HasMaxLength(450);
            entity.Property(e => e.PartId).HasColumnName("PartID");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.RequestedBy).HasMaxLength(450);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            entity.Property(e => e.Urgency)
                .HasMaxLength(50)
                .HasDefaultValue("Normal");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.PurchaseRequestApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK__PurchaseR__Appro__151B244E");

            entity.HasOne(d => d.Part).WithMany(p => p.PurchaseRequests)
                .HasForeignKey(d => d.PartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PurchaseR__PartI__1332DBDC");

            entity.HasOne(d => d.RequestedByNavigation).WithMany(p => p.PurchaseRequestRequestedByNavigations)
                .HasForeignKey(d => d.RequestedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PurchaseR__Reque__14270015");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__Rooms__3286391944F5E5E2");

            entity.Property(e => e.RoomId).HasColumnName("RoomID");
            entity.Property(e => e.DepartmentId).HasColumnName("DepartmentID");
            entity.Property(e => e.RoomName).HasMaxLength(100);

            entity.HasOne(d => d.Department).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.DepartmentId)
                .HasConstraintName("FK__Rooms__Departmen__6477ECF3");
        });

        modelBuilder.Entity<Shift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__Shifts__C0A838E1E127179C");

            entity.Property(e => e.ShiftId).HasColumnName("ShiftID");
            entity.Property(e => e.ShiftName).HasMaxLength(50);
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
            entity.Property(e => e.CreateDate)
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
