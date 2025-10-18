using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.SeedData
{
    public static class SeedData
    {
        private static readonly PasswordHasher<User> _passwordHasher = new PasswordHasher<User>();

        public static async Task SeedRoles(FitskipDbContext context)
        {
            // Kiểm tra nếu đã có roles thì không seed nữa
            if (!await context.Roles.AnyAsync())
            {
                var roles = new List<IdentityRole>
                {
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý",
                        NormalizedName = "QUẢN LÝ",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Tổ trưởng",
                        NormalizedName = "TỔ TRƯỞNG",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý kỹ thuật",
                        NormalizedName = "QUẢN LÝ KỸ THUẬT",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Kỹ thuật viên",
                        NormalizedName = "KỸ THUẬT VIÊN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản trị viên",
                        NormalizedName = "QUẢN TRỊ VIÊN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }
            else
            {
                // Update NormalizedName của các roles đã tồn tại
                await UpdateExistingRolesNormalizedName(context);
            }
        }

        public static async Task UpdateExistingRolesNormalizedName(FitskipDbContext context)
        {
            var roles = await context.Roles.ToListAsync();

            foreach (var role in roles)
            {
                if (!string.IsNullOrEmpty(role.Name))
                {
                    // Update NormalizedName với dấu tiếng Việt
                    role.NormalizedName = role.Name.ToUpperInvariant();
                }
            }

            await context.SaveChangesAsync();
        }

        public static async Task SeedDepartments(FitskipDbContext context)
        {
            if (!await context.Departments.AnyAsync())
            {
                var departments = new List<Department>
                {
                    new Department
                    {
                        DepartmentName = "Phòng Sản xuất",
                        Description = "Phòng chịu trách nhiệm sản xuất các sản phẩm điện dân dụng"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Kỹ thuật",
                        Description = "Phòng chịu trách nhiệm về kỹ thuật và công nghệ sản xuất"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Kiểm tra chất lượng",
                        Description = "Phòng kiểm tra và đảm bảo chất lượng sản phẩm"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Hành chính",
                        Description = "Phòng quản lý hành chính và nhân sự"
                    },
                    new Department
                    {
                        DepartmentName = "Ban Giám đốc",
                        Description = "Ban điều hành và quản lý công ty"
                    }
                };

                await context.Departments.AddRangeAsync(departments);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUsers(FitskipDbContext context)
        {
            if (!await context.Users.AnyAsync())
            {

                var users = new List<User>();

                // Admin Users - Quản trị viên
                var admin = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "admin.dev",
                    NormalizedUserName = "ADMIN.DEV",
                    Email = "admin.dev@kipvietnam.vn",
                    NormalizedEmail = "ADMIN.DEV@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Văn Quản trị",
                    EmployeeCode = "QTV001",
                    PhoneNumber = "0901234567"
                };
                admin.PasswordHash = _passwordHasher.HashPassword(admin, "123456");
                users.Add(admin);

                // Manager Users - Quản lý
                var manager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly",
                    NormalizedUserName = "QUANLY",
                    Email = "quanly@kipvietnam.vn",
                    NormalizedEmail = "QUANLY@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Trần Thị Mai Anh",
                    EmployeeCode = "QL001",
                    PhoneNumber = "0987654321"
                };
                manager.PasswordHash = _passwordHasher.HashPassword(manager, "123456");
                users.Add(manager);

                // Technical Manager - Quản lý kỹ thuật
                var techManager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly.kythuat",
                    NormalizedUserName = "QUANLY.KYTHUAT",
                    Email = "quanly.kythuat@kipvietnam.vn",
                    NormalizedEmail = "QUANLY.KYTHUAT@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Lê Văn Kỹ thuật",
                    EmployeeCode = "QLKT001",
                    PhoneNumber = "0912345678"
                };
                techManager.PasswordHash = _passwordHasher.HashPassword(techManager, "123456");
                users.Add(techManager);

                // Team Leaders - Tổ trưởng
                var teamLeader = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "totruong.sanxuat",
                    NormalizedUserName = "TOTRUONG.SANXUAT",
                    Email = "totruong.sanxuat@kipvietnam.vn",
                    NormalizedEmail = "TOTRUONG.SANXUAT@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Phạm Văn Sản xuất",
                    EmployeeCode = "TT001",
                    PhoneNumber = "0923456789"
                };
                teamLeader.PasswordHash = _passwordHasher.HashPassword(teamLeader, "123456");
                users.Add(teamLeader);

                // Technicians - Kỹ thuật viên
                var technician = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "kythuat.vien1",
                    NormalizedUserName = "KYTHUAT.VIEN1",
                    Email = "kythuat.vien1@kipvietnam.vn",
                    NormalizedEmail = "KYTHUAT.VIEN1@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Đặng Văn Kỹ thuật",
                    EmployeeCode = "KTV001",
                    PhoneNumber = "0945678901"
                };
                technician.PasswordHash = _passwordHasher.HashPassword(technician, "123456");
                users.Add(technician);

                // Additional Technician - Kỹ thuật viên 2
                var technician2 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "kythuat.vien2",
                    NormalizedUserName = "KYTHUAT.VIEN2",
                    Email = "kythuat.vien2@kipvietnam.vn",
                    NormalizedEmail = "KYTHUAT.VIEN2@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Thị Kỹ thuật",
                    EmployeeCode = "KTV002",
                    PhoneNumber = "0956789012"
                };
                technician2.PasswordHash = _passwordHasher.HashPassword(technician2, "123456");
                users.Add(technician2);
                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUserRoles(FitskipDbContext context)
        {
            // Phân quyền cho người dùng (sử dụng RoleId trong User)
            var roles = await context.Roles.ToListAsync();
            var dbUsers = await context.Users.ToListAsync();

            bool hasChanges = false;

            // Phân quyền Quản trị viên
            var adminRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN TRỊ VIÊN");
            if (adminRole != null)
            {
                var adminUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QTV") == true && u.RoleId == null).ToList();
                foreach (var user in adminUsers)
                {
                    user.RoleId = adminRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Quản lý
            var managerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ");
            if (managerRole != null)
            {
                var managerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QL") == true && !u.EmployeeCode.StartsWith("QLKT") && u.RoleId == null).ToList();
                foreach (var user in managerUsers)
                {
                    user.RoleId = managerRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Quản lý kỹ thuật
            var techManagerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ KỸ THUẬT");
            if (techManagerRole != null)
            {
                var techManagerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QLKT") == true && u.RoleId == null).ToList();
                foreach (var user in techManagerUsers)
                {
                    user.RoleId = techManagerRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Tổ trưởng
            var teamLeaderRole = roles.FirstOrDefault(r => r.NormalizedName == "TỔ TRƯỞNG");
            if (teamLeaderRole != null)
            {
                var teamLeaderUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("TT") == true && u.RoleId == null).ToList();
                foreach (var user in teamLeaderUsers)
                {
                    user.RoleId = teamLeaderRole.Id;
                    hasChanges = true;
                }
            }

            // Phân quyền Kỹ thuật viên
            var technicianRole = roles.FirstOrDefault(r => r.NormalizedName == "KỸ THUẬT VIÊN");
            if (technicianRole != null)
            {
                var technicianUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("KTV") == true && u.RoleId == null).ToList();
                foreach (var user in technicianUsers)
                {
                    user.RoleId = technicianRole.Id;
                    hasChanges = true;
                }
            }

            if (hasChanges)
            {
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedStopTypes(FitskipDbContext context)
        {
            if (!await context.StopTypes.AnyAsync())
            {
                var stopTypes = new List<StopType>
                {
                    new StopType
                    {
                        TypeName = "Chuẩn bị sản xuất"
                    },
                    new StopType
                    {
                        TypeName = "Vệ sinh đầu/cuối ca"
                    },
                    new StopType
                    {
                        TypeName = "Dừng ngắn"
                    },
                    new StopType
                    {
                        TypeName = "Dừng dài"
                    },
                    new StopType
                    {
                        TypeName = "Phế phẩm"
                    },
                    new StopType
                    {
                        TypeName = "Chờ vật tư"
                    },
                    new StopType
                    {
                        TypeName = "Mất điện"
                    },
                    new StopType
                    {
                        TypeName = "Đổi mã"
                    }
                };

                await context.StopTypes.AddRangeAsync(stopTypes);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedLines(FitskipDbContext context)
        {
            if (!await context.Lines.AnyAsync())
            {
                var departments = await context.Departments.ToListAsync();
                var productionDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng Sản xuất");

                if (productionDept != null)
                {
                    var lines = new List<Line>
                    {
                        new Line
                        {
                            LineName = "Dây chuyền sản xuất 1",
                            DepartmentId = productionDept.DepartmentId,
                            IsActive = true
                        },
                        new Line
                        {
                            LineName = "Dây chuyền sản xuất 2",
                            DepartmentId = productionDept.DepartmentId,
                            IsActive = true
                        },
                        new Line
                        {
                            LineName = "Dây chuyền đóng gói",
                            DepartmentId = productionDept.DepartmentId,
                            IsActive = true
                        }
                    };

                    await context.Lines.AddRangeAsync(lines);
                    await context.SaveChangesAsync();
                }
            }
        }

        public static async Task SeedStages(FitskipDbContext context)
        {
            if (!await context.Stages.AnyAsync())
            {
                var lines = await context.Lines.ToListAsync();

                var stages = new List<Stage>();

                foreach (var line in lines)
                {
                    if (line.LineName.Contains("đóng gói"))
                    {
                        stages.AddRange(new List<Stage>
                        {
                            new Stage
                            {
                                StageName = "Kiểm tra sản phẩm",
                                LineId = line.LineId,
                                IsActive = true
                            },
                            new Stage
                            {
                                StageName = "Đóng gói",
                                LineId = line.LineId,
                                IsActive = true
                            },
                            new Stage
                            {
                                StageName = "Dán nhãn",
                                LineId = line.LineId,
                                IsActive = true
                            }
                        });
                    }
                    else
                    {
                        stages.AddRange(new List<Stage>
                        {
                            new Stage
                            {
                                StageName = "Chuẩn bị nguyên liệu",
                                LineId = line.LineId,
                                IsActive = true
                            },
                            new Stage
                            {
                                StageName = "Gia công",
                                LineId = line.LineId,
                                IsActive = true
                            },
                            new Stage
                            {
                                StageName = "Lắp ráp",
                                LineId = line.LineId,
                                IsActive = true
                            },
                            new Stage
                            {
                                StageName = "Kiểm tra",
                                LineId = line.LineId,
                                IsActive = true
                            }
                        });
                    }
                }

                await context.Stages.AddRangeAsync(stages);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedEquipment(FitskipDbContext context)
        {
            if (!await context.Equipment.AnyAsync())
            {
                var stages = await context.Stages.ToListAsync();
                var equipment = new List<Equipment>();

                foreach (var stage in stages)
                {
                    var stageEquipment = new List<Equipment>();

                    switch (stage.StageName)
                    {
                        case "Chuẩn bị nguyên liệu":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"CB{stage.StageId:D3}_001",
                                    EquipmentName = "Máy cắt nguyên liệu",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-2)),
                                    Origin = "Nhật Bản",
                                    Yom = 2020,
                                    Qrcode = $"QR_CB{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                },
                                new Equipment
                                {
                                    EquipmentCode = $"CB{stage.StageId:D3}_002",
                                    EquipmentName = "Máy phân loại",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-1)),
                                    Origin = "Hàn Quốc",
                                    Yom = 2021,
                                    Qrcode = $"QR_CB{stage.StageId:D3}_002",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;

                        case "Gia công":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"GC{stage.StageId:D3}_001",
                                    EquipmentName = "Máy phay CNC",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-3)),
                                    Origin = "Đức",
                                    Yom = 2019,
                                    Qrcode = $"QR_GC{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                },
                                new Equipment
                                {
                                    EquipmentCode = $"GC{stage.StageId:D3}_002",
                                    EquipmentName = "Máy tiện",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-2)),
                                    Origin = "Trung Quốc",
                                    Yom = 2020,
                                    Qrcode = $"QR_GC{stage.StageId:D3}_002",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;

                        case "Lắp ráp":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"LR{stage.StageId:D3}_001",
                                    EquipmentName = "Máy lắp ráp tự động",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-1)),
                                    Origin = "Nhật Bản",
                                    Yom = 2022,
                                    Qrcode = $"QR_LR{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;

                        case "Kiểm tra":
                        case "Kiểm tra sản phẩm":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"KT{stage.StageId:D3}_001",
                                    EquipmentName = "Máy kiểm tra chất lượng",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddMonths(-6)),
                                    Origin = "Mỹ",
                                    Yom = 2023,
                                    Qrcode = $"QR_KT{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;

                        case "Đóng gói":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"DG{stage.StageId:D3}_001",
                                    EquipmentName = "Máy đóng gói tự động",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddMonths(-8)),
                                    Origin = "Đức",
                                    Yom = 2022,
                                    Qrcode = $"QR_DG{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;

                        case "Dán nhãn":
                            stageEquipment.AddRange(new List<Equipment>
                            {
                                new Equipment
                                {
                                    EquipmentCode = $"DN{stage.StageId:D3}_001",
                                    EquipmentName = "Máy dán nhãn",
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddMonths(-4)),
                                    Origin = "Ý",
                                    Yom = 2023,
                                    Qrcode = $"QR_DN{stage.StageId:D3}_001",
                                    StageId = stage.StageId,
                                    IsActive = true
                                }
                            });
                            break;
                    }

                    equipment.AddRange(stageEquipment);
                }

                await context.Equipment.AddRangeAsync(equipment);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedShifts(FitskipDbContext context)
        {
            if (!await context.Shifts.AnyAsync())
            {
                var shifts = new List<Shift>
                {
                    new Shift
                    {
                        ShiftName = "Ca sáng",
                        StartTime = new TimeOnly(6, 0),
                        EndTime = new TimeOnly(14, 0)
                    },
                    new Shift
                    {
                        ShiftName = "Ca chiều",
                        StartTime = new TimeOnly(14, 0),
                        EndTime = new TimeOnly(22, 0)
                    },
                    new Shift
                    {
                        ShiftName = "Ca đêm",
                        StartTime = new TimeOnly(22, 0),
                        EndTime = new TimeOnly(6, 0)
                    }
                };

                await context.Shifts.AddRangeAsync(shifts);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedShiftSlots(FitskipDbContext context)
        {
            if (!await context.ShiftSlots.AnyAsync())
            {
                var shiftSlots = new List<ShiftSlot>
                {
                    // Ca sáng (ShiftID = 1)
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(6, 0), SlotEndTime = new TimeOnly(7, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(7, 0), SlotEndTime = new TimeOnly(8, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(8, 0), SlotEndTime = new TimeOnly(9, 0), Duration = 50 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(9, 0), SlotEndTime = new TimeOnly(10, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(10, 0), SlotEndTime = new TimeOnly(11, 30), Duration = 60 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(11, 30), SlotEndTime = new TimeOnly(12, 30), Duration = 50 },
                    new ShiftSlot { ShiftId = 1, SlotStartTime = new TimeOnly(12, 30), SlotEndTime = new TimeOnly(14, 0), Duration = 90 },
                    // Ca chiều (ShiftID = 2)
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(14, 0), SlotEndTime = new TimeOnly(15, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(15, 0), SlotEndTime = new TimeOnly(16, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(16, 0), SlotEndTime = new TimeOnly(17, 0), Duration = 50 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(17, 0), SlotEndTime = new TimeOnly(18, 30), Duration = 60 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(18, 30), SlotEndTime = new TimeOnly(19, 30), Duration = 60 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(19, 30), SlotEndTime = new TimeOnly(20, 30), Duration = 50 },
                    new ShiftSlot { ShiftId = 2, SlotStartTime = new TimeOnly(20, 30), SlotEndTime = new TimeOnly(22, 0), Duration = 90 },
                    // Ca đêm (ShiftID = 3)
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(22, 0), SlotEndTime = new TimeOnly(23, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(23, 0), SlotEndTime = new TimeOnly(0, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(0, 0), SlotEndTime = new TimeOnly(1, 0), Duration = 50 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(1, 0), SlotEndTime = new TimeOnly(3, 0), Duration = 75 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(3, 0), SlotEndTime = new TimeOnly(4, 0), Duration = 60 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(4, 0), SlotEndTime = new TimeOnly(5, 0), Duration = 50 },
                    new ShiftSlot { ShiftId = 3, SlotStartTime = new TimeOnly(5, 0), SlotEndTime = new TimeOnly(6, 0), Duration = 60 }
                };

                await context.ShiftSlots.AddRangeAsync(shiftSlots);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedIncidentHistories(FitskipDbContext context)
        {
            if (!await context.IncidentHistories.AnyAsync())
            {
                var equipment = await context.Equipment.ToListAsync();
                var stopTypes = await context.StopTypes.ToListAsync();
                var shiftSlots = await context.ShiftSlots.ToListAsync();

                if (!equipment.Any() || !stopTypes.Any())
                    return;

                var incidents = new List<IncidentHistory>();
                var random = new Random();

                // Tạo 15 incidents mẫu
                for (int i = 0; i < 15; i++)
                {
                    var selectedEquipment = equipment[random.Next(equipment.Count)];
                    var selectedStopType = stopTypes[random.Next(stopTypes.Count)];
                    var selectedSlot = shiftSlots.Any() ? shiftSlots[random.Next(shiftSlots.Count)] : null;

                    // Random thời gian trong 7 ngày qua
                    var daysAgo = random.Next(0, 7);
                    var incidentDate = DateTime.Now.AddDays(-daysAgo);

                    // Random thời gian trong ngày
                    var startHour = random.Next(6, 20);
                    var startMinute = random.Next(0, 60);
                    var startTime = new DateTime(incidentDate.Year, incidentDate.Month, incidentDate.Day, startHour, startMinute, 0);

                    // Duration từ 5 phút đến 2 giờ (120 phút)
                    var durationMinutes = random.Next(5, 121);
                    var endTime = startTime.AddMinutes(durationMinutes);

                    // Đảm bảo không vượt quá thời gian hiện tại
                    if (endTime > DateTime.Now)
                    {
                        endTime = DateTime.Now;
                        var actualDuration = (endTime - startTime).TotalMinutes;
                        durationMinutes = (int)Math.Max(1, actualDuration);
                    }

                    var finalDuration = Math.Max(1, (decimal)durationMinutes);

                    var incident = new IncidentHistory
                    {
                        EquipmentId = selectedEquipment.EquipmentId,
                        StartTime = startTime,
                        EndTime = endTime,
                        Duration = finalDuration,
                        TypeId = selectedStopType.TypeId,
                        SlotId = selectedSlot?.SlotId,
                        Issue = GetRandomIssue(selectedStopType.TypeName ?? "", random),
                        Reason = GetRandomReason(selectedStopType.TypeName ?? "", random),
                        Solution = GetRandomSolution(selectedStopType.TypeName ?? "", random),
                        CreatedDate = startTime.AddMinutes(random.Next(1, 15))
                    };

                    incidents.Add(incident);
                }

                await context.IncidentHistories.AddRangeAsync(incidents);
                await context.SaveChangesAsync();
            }
        }

        private static string GetRandomIssue(string stopTypeName, Random random)
        {
            var issues = stopTypeName switch
            {
                "Chuẩn bị sản xuất" => new[]
                {
                    "Chuẩn bị nguyên liệu đầu ca",
                    "Họp đầu ca",
                },
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "Vệ sinh máy đầu ca",
                    "Vệ sinh máy cuối ca",
                    "Dọn dẹp khu vực sản xuất",
                    "Kiểm tra vệ sinh"
                },
                "dừng ngắn" => new[]
                {
                    "Máy dừng hoạt động ngắn",
                    "Tạm dừng để điều chỉnh",
                    "Dừng để kiểm tra nhanh",
                    "Tạm nghỉ giữa ca",
                    "Dừng để vệ sinh nhanh"
                },
                "dừng dài" => new[]
                {
                    "Máy hỏng nặng cần sửa chữa",
                    "Bảo trì định kỳ kéo dài",
                    "Thiếu phụ tùng thay thế",
                    "Sự cố hệ thống điện",
                    "Vấn đề kỹ thuật nghiêm trọng"
                },
                "phế phẩm" => new[]
                {
                    "Sản phẩm không đạt chất lượng",
                    "Lỗi lắp ráp",
                    "Vấn đề nguyên liệu",
                    "Hỏng trong quá trình sản xuất",
                    "Không đạt tiêu chuẩn kỹ thuật"
                },
                "Chờ vật tư" => new[]
                {
                    "Thiếu nguyên liệu",
                    "Chờ linh kiện"
                },
                "Mất điện" => new[]
                {
                    "Mất điện đột ngột",
                },
                "Đổi mã" => new[]
                {
                    "Đổi mã sản phẩm",
                },
                _ => new[] { "Sự cố không xác định", "Cần kiểm tra thêm", "Vấn đề kỹ thuật" }
            };

            return issues[random.Next(issues.Length)];
        }

        private static string GetRandomReason(string stopTypeName, Random random)
        {
            var reasons = stopTypeName switch
            {
                "Chuẩn bị sản xuất" => new[]
                {
                    "",
                },
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "Dọn dẹp sau sản xuất",
                    "Kiểm tra vệ sinh an toàn",
                    "Chuẩn bị cho ca tiếp theo"
                },
                "dừng ngắn" => new[]
                {
                    "Điều chỉnh thông số máy",
                    "Kiểm tra chất lượng nhanh",
                    "Tạm nghỉ giữa ca sản xuất",
                    "Vệ sinh máy nhanh",
                    "Thay đổi setup sản phẩm"
                },
                "dừng dài" => new[]
                {
                    "Hỏng hóc nặng cần sửa chữa",
                    "Thiếu phụ tùng thay thế",
                    "Bảo trì định kỳ kéo dài",
                    "Sự cố hệ thống điện",
                    "Vấn đề kỹ thuật nghiêm trọng"
                },
                "phế phẩm" => new[]
                {
                    "Nguyên liệu không đạt chất lượng",
                    "Lỗi vận hành của công nhân",
                    "Thiết bị không chính xác",
                    "Thiếu kiểm soát chất lượng",
                    "Điều kiện môi trường sản xuất"
                },
                "Chờ vật tư" => new[]
                {
                    "",
                },
                "Mất điện" => new[]
                {
                    "",
                },
                "Đổi mã" => new[]
                {
                    "",
                },
                _ => new[] { "Chưa xác định nguyên nhân", "Đang điều tra", "Cần phân tích thêm" }
            };

            return reasons[random.Next(reasons.Length)];
        }

        private static string GetRandomSolution(string stopTypeName, Random random)
        {
            var solutions = stopTypeName switch
            {
                "Chuẩn bị sản xuất" => new[]
                {
                    "",
                },
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "",
                },
                "dừng ngắn" => new[]
                {
                    "Điều chỉnh lại thông số",
                    "Hoàn thành kiểm tra nhanh",
                    "Tiếp tục sản xuất",
                    "Ghi nhận và theo dõi",
                    "Đào tạo lại quy trình"
                },
                "dừng dài" => new[]
                {
                    "Thay thế phụ tùng hỏng",
                    "Sửa chữa chuyên sâu",
                    "Liên hệ kỹ thuật viên",
                    "Chuẩn bị máy dự phòng",
                    "Lên kế hoạch bảo trì"
                },
                "phế phẩm" => new[]
                {
                    "Kiểm tra chất lượng nguyên liệu",
                    "Đào tạo lại công nhân",
                    "Hiệu chỉnh thiết bị",
                    "Tăng cường kiểm soát chất lượng",
                    "Cải thiện quy trình sản xuất"
                },
                "Chờ vật tư" => new[]
                {
                    "",
                },
                "Mất điện" => new[]
                {
                    "",
                },
                "Đổi mã" => new[]
                {
                    "",
                },
                _ => new[] { "Tiếp tục theo dõi", "Báo cáo cấp trên", "Cần hỗ trợ chuyên gia" }
            };

            return solutions[random.Next(solutions.Length)];
        }

        public static async Task SeedAllData(FitskipDbContext context)
        {
            await SeedRoles(context);
            await SeedDepartments(context);
            await SeedUsers(context);
            await SeedUserRoles(context);
            await SeedStopTypes(context);
            await SeedLines(context);
            await SeedStages(context);
            await SeedEquipment(context);
            await SeedShifts(context);
            await SeedShiftSlots(context);
            await SeedIncidentHistories(context);
        }
    }
}