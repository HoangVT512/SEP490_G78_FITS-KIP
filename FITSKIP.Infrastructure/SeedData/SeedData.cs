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

                // Additional Team Leader - Tổ trưởng (Hoàng)
                var teamLeader2 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "TT002",
                    NormalizedUserName = "TT002",
                    Email = "hoangdz512@gmail.com",
                    NormalizedEmail = "HOANGDZ512@GMAIL.COM",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Vũ Tuấn Hoàng",
                    EmployeeCode = "TT002",
                    PhoneNumber = "0912345678"
                };
                teamLeader2.PasswordHash = _passwordHasher.HashPassword(teamLeader2, "123456");
                users.Add(teamLeader2);
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
                        TypeName = "Vệ sinh đầu/cuối ca"
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
                            LineCode = "LINE001",
                            DepartmentId = productionDept.DepartmentId,
                            IsActive = true
                        },
                        new Line
                        {
                            LineName = "Dây chuyền sản xuất 2",
                            LineCode = "LINE002",
                            DepartmentId = productionDept.DepartmentId,
                            IsActive = true
                        },
                        new Line
                        {
                            LineName = "Dây chuyền đóng gói",
                            LineCode = "LINE003",
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
                        ShiftName = "Ca 1",
                        StartTime = new TimeOnly(7, 0),
                        EndTime = new TimeOnly(15, 0)
                    },
                    new Shift
                    {
                        ShiftName = "Ca 2",
                        StartTime = new TimeOnly(15, 0),
                        EndTime = new TimeOnly(23, 0)
                    }
                };

                await context.Shifts.AddRangeAsync(shifts);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedSpareParts(FitskipDbContext context)
        {
            if (!await context.SpareParts.AnyAsync())
            {
                var spareParts = new List<SparePart>
                {
                    new SparePart
                    {
                        PartNumber = "SP001",
                        PartName = "Dây chuyền truyền động",
                        PartType = "Cơ khí",
                        Material = "Thép không gỉ",
                        Specifications = "Chiều dài 1500mm, Đường kính 50mm",
                        Supplier = "Công ty Cơ khí Việt",
                        PurchasePrice = 125.50m,
                        Quantity = 15,
                        MinQuantity = 5,
                        Location = "Kệ A1",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "12 tháng",
                        DateAdded = DateTime.Now.AddMonths(-6),
                        Status = "Available",
                        DocumentUrl = "/documents/SP001_datasheet.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP002",
                        PartName = "Đầu cảm biến",
                        PartType = "Điện tử",
                        Material = "Nhôm",
                        Specifications = "Loại cảm biến quang học, Đầu ra: 4-20mA",
                        Supplier = "Công ty Siemens Việt Nam",
                        PurchasePrice = 89.75m,
                        Quantity = 8,
                        MinQuantity = 3,
                        Location = "Kệ B2",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "24 tháng",
                        DateAdded = DateTime.Now.AddMonths(-4),
                        Status = "Available",
                        DocumentUrl = "/documents/SP002_manual.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP003",
                        PartName = "Động cơ điện",
                        PartType = "Điện",
                        Material = "Đồng, Thép",
                        Specifications = "Công suất 2.2kW, Tốc độ 1500 RPM, 3 pha",
                        Supplier = "ABB Việt Nam",
                        PurchasePrice = 350.00m,
                        Quantity = 4,
                        MinQuantity = 2,
                        Location = "Kệ C1",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "36 tháng",
                        DateAdded = DateTime.Now.AddMonths(-8),
                        Status = "Available",
                        DocumentUrl = "/documents/SP003_spec.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP004",
                        PartName = "Silinder thủy lực",
                        PartType = "Cơ khí",
                        Material = "Thép cán lạnh",
                        Specifications = "Đường kính 63mm, Hành trình 500mm",
                        Supplier = "Bosch Rexroth",
                        PurchasePrice = 215.25m,
                        Quantity = 6,
                        MinQuantity = 2,
                        Location = "Kệ D3",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "18 tháng",
                        DateAdded = DateTime.Now.AddMonths(-3),
                        Status = "Available",
                        DocumentUrl = "/documents/SP004_drawing.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP005",
                        PartName = "Bộ lọc dầu",
                        PartType = "Cơ khí",
                        Material = "Giấy lọc, Nhôm",
                        Specifications = "Kích thước 120x80mm, Đường kính ngoài 100mm",
                        Supplier = "Mann Filter",
                        PurchasePrice = 45.00m,
                        Quantity = 25,
                        MinQuantity = 10,
                        Location = "Kệ E2",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "6 tháng",
                        DateAdded = DateTime.Now.AddMonths(-2),
                        Status = "Available",
                        DocumentUrl = "/documents/SP005_spec.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP006",
                        PartName = "Van điều khiển pneumatic",
                        PartType = "Điều khiển",
                        Material = "Hợp kim nhôm",
                        Specifications = "5/3 van, Nguồn 4-8 bar",
                        Supplier = "Festo Vietnam",
                        PurchasePrice = 178.50m,
                        Quantity = 7,
                        MinQuantity = 3,
                        Location = "Kệ F1",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "24 tháng",
                        DateAdded = DateTime.Now.AddMonths(-5),
                        Status = "Available",
                        DocumentUrl = "/documents/SP006_catalog.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP007",
                        PartName = "Dây đai tan curoa",
                        PartType = "Truyền động",
                        Material = "Cao su reinforce",
                        Specifications = "Rộng 50mm, Chiều dài 2000mm",
                        Supplier = "Gates Corporation",
                        PurchasePrice = 65.75m,
                        Quantity = 18,
                        MinQuantity = 8,
                        Location = "Kệ A2",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "12 tháng",
                        DateAdded = DateTime.Now.AddMonths(-1),
                        Status = "Available",
                        DocumentUrl = "/documents/SP007_technical.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP008",
                        PartName = "Vòng bi chuyên dụng",
                        PartType = "Cơ khí",
                        Material = "Thép carbon",
                        Specifications = "Bạc vòng bi: 30mm, Đường kính ngoài: 72mm",
                        Supplier = "SKF Việt Nam",
                        PurchasePrice = 52.30m,
                        Quantity = 12,
                        MinQuantity = 4,
                        Location = "Kệ B1",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "8 tháng",
                        DateAdded = DateTime.Now.AddMonths(-7),
                        Status = "Available",
                        DocumentUrl = "/documents/SP008_spec.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP009",
                        PartName = "Bộ niêm phong cơ học",
                        PartType = "Cơ khí",
                        Material = "Graphite, Carbon, PTFE",
                        Specifications = "Đường kính: 50mm, Chiều cao: 20mm",
                        Supplier = "John Crane",
                        PurchasePrice = 95.00m,
                        Quantity = 5,
                        MinQuantity = 2,
                        Location = "Kệ C2",
                        Warehouse = "Kho chính",
                        UoM = "Bộ",
                        ReplacementCycle = "36 tháng",
                        DateAdded = DateTime.Now.AddMonths(-9),
                        Status = "Available",
                        DocumentUrl = "/documents/SP009_guide.pdf",
                        IsActive = true
                    },
                    new SparePart
                    {
                        PartNumber = "SP010",
                        PartName = "Relay điều khiển",
                        PartType = "Điện",
                        Material = "Hợp kim, Đồng",
                        Specifications = "24VDC, 8A",
                        Supplier = "Schneider Electric",
                        PurchasePrice = 28.50m,
                        Quantity = 32,
                        MinQuantity = 15,
                        Location = "Kệ E1",
                        Warehouse = "Kho chính",
                        UoM = "Cái",
                        ReplacementCycle = "60 tháng",
                        DateAdded = DateTime.Now.AddMonths(-11),
                        Status = "Available",
                        DocumentUrl = "/documents/SP010_datasheet.pdf",
                        IsActive = true
                    }
                };

                await context.SpareParts.AddRangeAsync(spareParts);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedIncidentHistories(FitskipDbContext context)
        {
            if (!await context.IncidentHistories.AnyAsync())
            {
                var incidents = new List<IncidentHistory>
                {
                    new IncidentHistory
                    {
                        EquipmentId = 6,
                        LineId = 3,
                        StartTime = new DateTime(2025, 8, 27, 11, 9, 0),
                        EndTime = new DateTime(2025, 8, 27, 11, 14, 0),
                        Duration = 5.00m,
                        TypeId = 1,
                        Reason = "Điều chỉnh thông số máy",
                        Solution = "Ghi nhận và theo dõi",
                        Issue = "Tạm dừng để điều chỉnh",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 8, 27, 11, 21, 0),
                        ReportedByUserId = null,
                        AssignedTo = "e76c056a-a38e-42e1-9d82-e0a225a0653e",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 14,
                        LineId = 3,
                        StartTime = new DateTime(2025, 9, 27, 13, 17, 0),
                        EndTime = new DateTime(2025, 9, 27, 13, 18, 0),
                        Duration = 1.00m,
                        TypeId = 1,
                        Reason = "Vệ sinh máy nhanh",
                        Solution = "Ghi nhận và theo dõi",
                        Issue = "Tạm dừng để điều chỉnh",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 27, 13, 27, 0),
                        ReportedByUserId = null,
                        AssignedTo = "dbd2d565-42fb-41c5-9fed-f84170488e5b",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 1,
                        LineId = 1,
                        StartTime = new DateTime(2025, 10, 10, 7, 9, 0),
                        EndTime = new DateTime(2025, 10, 10, 7, 18, 0),
                        Duration = 9.00m,
                        TypeId = 2,
                        Reason = "Vấn đề kỹ thuật nghiêm trọng",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Vấn đề kỹ thuật nghiêm trọng",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 10, 7, 15, 0),
                        ReportedByUserId = null,
                        AssignedTo = "57a6ea0d-1f03-49ad-8510-266733100913",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 8, 31, 21, 17, 0),
                        EndTime = new DateTime(2025, 8, 31, 21, 30, 0),
                        Duration = 13.00m,
                        TypeId = 2,
                        Reason = "Vấn đề kỹ thuật nghiêm trọng",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Máy hỏng nặng cần sửa chữa",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 8, 31, 21, 28, 0),
                        ReportedByUserId = null,
                        AssignedTo = "79fffa03-0b7b-4f2c-9137-7cc2137dcdf0",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 4,
                        LineId = 1,
                        StartTime = new DateTime(2025, 8, 27, 8, 42, 0),
                        EndTime = new DateTime(2025, 8, 27, 8, 51, 0),
                        Duration = 9.00m,
                        TypeId = 2,
                        Reason = "Thiếu phụ tùng thay thế",
                        Solution = "Liên hệ kỹ thuật viên",
                        Issue = "Bảo trì định kỳ kéo dài",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 8, 27, 8, 47, 0),
                        ReportedByUserId = null,
                        AssignedTo = "c439f9c9-a2e4-4d67-b376-2e4717927f14",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 9, 6, 17, 44, 0),
                        EndTime = new DateTime(2025, 9, 6, 17, 48, 0),
                        Duration = 4.00m,
                        TypeId = 1,
                        Reason = "Thay đổi setup sản phẩm",
                        Solution = "Điều chỉnh lại thông số",
                        Issue = "Tạm nghỉ giữa ca",
                        ImageUrl = "/images/incidents/incident_006.jpg",
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 6, 17, 49, 0),
                        ReportedByUserId = null,
                        AssignedTo = "dbd2d565-42fb-41c5-9fed-f84170488e5b",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 9, 24, 18, 18, 0),
                        EndTime = new DateTime(2025, 9, 24, 18, 33, 0),
                        Duration = 15.00m,
                        TypeId = 2,
                        Reason = "Vấn đề kỹ thuật nghiêm trọng",
                        Solution = "Chuẩn bị máy dự phòng",
                        Issue = "Thiếu phụ tùng thay thế",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 24, 18, 19, 0),
                        ReportedByUserId = null,
                        AssignedTo = "e76c056a-a38e-42e1-9d82-e0a225a0653e",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 13,
                        LineId = 3,
                        StartTime = new DateTime(2025, 10, 7, 12, 14, 0),
                        EndTime = new DateTime(2025, 10, 7, 12, 20, 0),
                        Duration = 6.00m,
                        TypeId = 2,
                        Reason = "Bảo trì định kỳ kéo dài",
                        Solution = "Sửa chữa chuyên sâu",
                        Issue = "Vấn đề kỹ thuật nghiêm trọng",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 7, 12, 28, 0),
                        ReportedByUserId = null,
                        AssignedTo = "e76c056a-a38e-42e1-9d82-e0a225a0653e",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 12,
                        LineId = 2,
                        StartTime = new DateTime(2025, 10, 1, 17, 10, 0),
                        EndTime = new DateTime(2025, 10, 1, 17, 16, 0),
                        Duration = 6.00m,
                        TypeId = 2,
                        Reason = "Hỏng hóc nặng cần sửa chữa",
                        Solution = "Chuẩn bị máy dự phòng",
                        Issue = "Vấn đề kỹ thuật nghiêm trọng",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 1, 17, 11, 0),
                        ReportedByUserId = null,
                        AssignedTo = "c439f9c9-a2e4-4d67-b376-2e4717927f14",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 10, 7, 21, 10, 0),
                        EndTime = new DateTime(2025, 10, 7, 21, 12, 0),
                        Duration = 2.00m,
                        TypeId = 1,
                        Reason = "Thay đổi setup sản phẩm",
                        Solution = "Tiếp tục sản xuất",
                        Issue = "Máy dừng hoạt động ngắn",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 7, 21, 15, 0),
                        ReportedByUserId = null,
                        AssignedTo = "79fffa03-0b7b-4f2c-9137-7cc2137dcdf0",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 10,
                        LineId = 2,
                        StartTime = new DateTime(2025, 10, 20, 14, 12, 0),
                        EndTime = new DateTime(2025, 10, 20, 14, 19, 0),
                        Duration = 7.00m,
                        TypeId = 2,
                        Reason = "Hỏng hóc nặng cần sửa chữa",
                        Solution = "Sửa chữa chuyên sâu",
                        Issue = "Vấn đề kỹ thuật nghiêm trọng",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 20, 14, 16, 0),
                        ReportedByUserId = null,
                        AssignedTo = "7a650883-383e-4c6f-b015-fce620aa7443",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 2,
                        LineId = 1,
                        StartTime = new DateTime(2025, 9, 14, 14, 53, 0),
                        EndTime = new DateTime(2025, 9, 14, 14, 54, 0),
                        Duration = 1.00m,
                        TypeId = 1,
                        Reason = "Điều chỉnh thông số máy",
                        Solution = "Tiếp tục sản xuất",
                        Issue = "Máy dừng hoạt động ngắn",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 14, 14, 55, 0),
                        ReportedByUserId = null,
                        AssignedTo = "57a6ea0d-1f03-49ad-8510-266733100913",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 6,
                        LineId = 1,
                        StartTime = new DateTime(2025, 9, 3, 16, 21, 0),
                        EndTime = new DateTime(2025, 9, 3, 16, 30, 0),
                        Duration = 9.00m,
                        TypeId = 2,
                        Reason = "Hỏng hóc nặng cần sửa chữa",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Bảo trì định kỳ kéo dài",
                        ImageUrl = "/images/incidents/incident_013.jpg",
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 3, 16, 24, 0),
                        ReportedByUserId = null,
                        AssignedTo = "7a650883-383e-4c6f-b015-fce620aa7443",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 6,
                        LineId = 1,
                        StartTime = new DateTime(2025, 9, 12, 8, 17, 0),
                        EndTime = new DateTime(2025, 9, 12, 8, 25, 0),
                        Duration = 8.00m,
                        TypeId = 2,
                        Reason = "Hỏng hóc nặng cần sửa chữa",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Bảo trì định kỳ kéo dài",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 12, 8, 23, 0),
                        ReportedByUserId = null,
                        AssignedTo = "e76c056a-a38e-42e1-9d82-e0a225a0653e",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 12,
                        LineId = 2,
                        StartTime = new DateTime(2025, 9, 29, 16, 0, 0),
                        EndTime = new DateTime(2025, 9, 29, 16, 12, 0),
                        Duration = 12.00m,
                        TypeId = 2,
                        Reason = "Hỏng hóc nặng cần sửa chữa",
                        Solution = "Sửa chữa chuyên sâu",
                        Issue = "Bảo trì định kỳ kéo dài",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 29, 16, 7, 0),
                        ReportedByUserId = null,
                        AssignedTo = "57a6ea0d-1f03-49ad-8510-266733100913",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 5,
                        LineId = 3,
                        StartTime = new DateTime(2025, 9, 8, 16, 6, 0),
                        EndTime = new DateTime(2025, 9, 8, 16, 13, 0),
                        Duration = 7.00m,
                        TypeId = 2,
                        Reason = "Sự cố hệ thống điện",
                        Solution = "Chuẩn bị máy dự phòng",
                        Issue = "Sự cố hệ thống điện",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 8, 16, 11, 0),
                        ReportedByUserId = null,
                        AssignedTo = "09b0abd2-dea5-43d6-81d7-24410558a0a7",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 6,
                        LineId = 1,
                        StartTime = new DateTime(2025, 9, 9, 11, 39, 0),
                        EndTime = new DateTime(2025, 9, 9, 11, 40, 0),
                        Duration = 1.00m,
                        TypeId = 1,
                        Reason = "Thay đổi setup sản phẩm",
                        Solution = "Điều chỉnh lại thông số",
                        Issue = "Máy dừng hoạt động ngắn",
                        ImageUrl = "/images/incidents/incident_017.jpg",
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 9, 11, 44, 0),
                        ReportedByUserId = null,
                        AssignedTo = "7a650883-383e-4c6f-b015-fce620aa7443",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 14,
                        LineId = 3,
                        StartTime = new DateTime(2025, 10, 10, 18, 8, 0),
                        EndTime = new DateTime(2025, 10, 10, 19, 17, 0),
                        Duration = 47.00m,
                        TypeId = 2,
                        Reason = "Vấn đề kỹ thuật nghiêm trọng",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Vấn đề kỹ thuật nghiêm trọng",
                        ImageUrl = "/images/incidents/incident_018.jpg",
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 10, 10, 18, 12, 0),
                        ReportedByUserId = null,
                        AssignedTo = "c439f9c9-a2e4-4d67-b376-2e4717927f14",
                        IsTechSupport = true
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 9, 16, 10, 22, 0),
                        EndTime = new DateTime(2025, 9, 16, 11, 26, 0),
                        Duration = 38.00m,
                        TypeId = 2,
                        Reason = "Thay đổi setup sản phẩm",
                        Solution = "Hoàn thành kiểm tra nhanh",
                        Issue = "Dừng để vệ sinh nhanh",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 16, 10, 26, 0),
                        ReportedByUserId = null,
                        AssignedTo = "79fffa03-0b7b-4f2c-9137-7cc2137dcdf0",
                        IsTechSupport = false
                    },
                    new IncidentHistory
                    {
                        EquipmentId = 7,
                        LineId = 2,
                        StartTime = new DateTime(2025, 9, 7, 9, 25, 0),
                        EndTime = new DateTime(2025, 9, 7, 9, 40, 0),
                        Duration = 15.00m,
                        TypeId = 2,
                        Reason = "Bảo trì định kỳ kéo dài",
                        Solution = "Thay thế phụ tùng hỏng",
                        Issue = "Thiếu phụ tùng thay thế",
                        ImageUrl = null,
                        Status = "Hoàn thành",
                        CreatedDate = new DateTime(2025, 9, 7, 9, 34, 0),
                        ReportedByUserId = null,
                        AssignedTo = "7a650883-383e-4c6f-b015-fce620aa7443",
                        IsTechSupport = true
                    }
                };

                await context.IncidentHistories.AddRangeAsync(incidents);
                await context.SaveChangesAsync();
            }
        }

        private static string GetRandomIssue(string stopTypeName, Random random)
        {
            var issues = stopTypeName switch
            {
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "Vệ sinh máy đầu ca",
                    "Vệ sinh máy cuối ca",
                    "Dọn dẹp khu vực sản xuất",
                    "Kiểm tra vệ sinh"
                },
                "Dừng ngắn" => new[]
                {
                    "Máy dừng hoạt động ngắn",
                    "Tạm dừng để điều chỉnh",
                    "Dừng để kiểm tra nhanh",
                    "Tạm nghỉ giữa ca",
                    "Dừng để vệ sinh nhanh"
                },
                "Dừng dài" => new[]
                {
                    "Máy hỏng nặng cần sửa chữa",
                    "Bảo trì định kỳ kéo dài",
                    "Thiếu phụ tùng thay thế",
                    "Sự cố hệ thống điện",
                    "Vấn đề kỹ thuật nghiêm trọng"
                },
                "Phế phẩm" => new[]
                {
                    "Sản phẩm không đạt chất lượng",
                    "Lỗi lắp ráp",
                    "Vấn đề nguyên liệu",
                    "Hỏng trong quá trình sản xuất",
                    "Không đạt tiêu chuẩn kỹ thuật"
                },
                "Đổi mã" => new[]
                {
                    "Đổi mã sản phẩm",
                    "Thay đổi model sản xuất",
                    "Chuyển đổi dây chuyền"
                },
                _ => new[] { "Sự cố không xác định", "Cần kiểm tra thêm", "Vấn đề kỹ thuật" }
            };

            return issues[random.Next(issues.Length)];
        }

        private static string GetRandomReason(string stopTypeName, Random random)
        {
            var reasons = stopTypeName switch
            {
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "Dọn dẹp sau sản xuất",
                    "Kiểm tra vệ sinh an toàn",
                    "Chuẩn bị cho ca tiếp theo"
                },
                "Dừng ngắn" => new[]
                {
                    "Điều chỉnh thông số máy",
                    "Kiểm tra chất lượng nhanh",
                    "Tạm nghỉ giữa ca sản xuất",
                    "Vệ sinh máy nhanh",
                    "Thay đổi setup sản phẩm"
                },
                "Dừng dài" => new[]
                {
                    "Hỏng hóc nặng cần sửa chữa",
                    "Thiếu phụ tùng thay thế",
                    "Bảo trì định kỳ kéo dài",
                    "Sự cố hệ thống điện",
                    "Vấn đề kỹ thuật nghiêm trọng"
                },
                "Phế phẩm" => new[]
                {
                    "Nguyên liệu không đạt chất lượng",
                    "Lỗi vận hành của công nhân",
                    "Thiết bị không chính xác",
                    "Thiếu kiểm soát chất lượng",
                    "Điều kiện môi trường sản xuất"
                },
                "Đổi mã" => new[]
                {
                    "Yêu cầu thay đổi sản phẩm",
                    "Đơn hàng mới",
                    "Chuyển đổi model theo kế hoạch"
                },
                _ => new[] { "Chưa xác định nguyên nhân", "Đang điều tra", "Cần phân tích thêm" }
            };

            return reasons[random.Next(reasons.Length)];
        }

        private static string GetRandomSolution(string stopTypeName, Random random)
        {
            var solutions = stopTypeName switch
            {
                "Vệ sinh đầu/cuối ca" => new[]
                {
                    "Hoàn thành vệ sinh định kỳ",
                    "Đảm bảo vệ sinh đạt chuẩn",
                    "Chuẩn bị sẵn sàng cho sản xuất"
                },
                "Dừng ngắn" => new[]
                {
                    "Điều chỉnh lại thông số",
                    "Hoàn thành kiểm tra nhanh",
                    "Tiếp tục sản xuất",
                    "Ghi nhận và theo dõi",
                    "Đào tạo lại quy trình"
                },
                "Dừng dài" => new[]
                {
                    "Thay thế phụ tùng hỏng",
                    "Sửa chữa chuyên sâu",
                    "Liên hệ kỹ thuật viên",
                    "Chuẩn bị máy dự phòng",
                    "Lên kế hoạch bảo trì"
                },
                "Phế phẩm" => new[]
                {
                    "Kiểm tra chất lượng nguyên liệu",
                    "Đào tạo lại công nhân",
                    "Hiệu chỉnh thiết bị",
                    "Tăng cường kiểm soát chất lượng",
                    "Cải thiện quy trình sản xuất"
                },
                "Đổi mã" => new[]
                {
                    "Hoàn thành chuyển đổi model",
                    "Cập nhật thông số sản xuất",
                    "Đào tạo công nhân về model mới"
                },
                _ => new[] { "Tiếp tục theo dõi", "Báo cáo cấp trên", "Cần hỗ trợ chuyên gia" }
            };

            return solutions[random.Next(solutions.Length)];
        }

        public static async Task SeedProductionOutputs(FitskipDbContext context)
        {
            if (!await context.ProductionOutputs.AnyAsync())
            {
                var productionOutputs = new List<ProductionOutput>
                {
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 8, 27),
                        ShiftId = 1,
                        SlotTime = "08:00–09:00",
                        LoadingTime = 50,
                        TargetAmount = "120",
                        ResultAmount = "110",
                        OEE = 91.7m,
                        CreatedAt = new DateTime(2025, 8, 27, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 8, 27),
                        ShiftId = 1,
                        SlotTime = "11:30–12:30",
                        LoadingTime = 50,
                        TargetAmount = "100",
                        ResultAmount = "95",
                        OEE = 95.0m,
                        CreatedAt = new DateTime(2025, 8, 27, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 8, 31),
                        ShiftId = 2,
                        SlotTime = "21:00–21:30",
                        LoadingTime = 50,
                        TargetAmount = "90",
                        ResultAmount = "85",
                        OEE = 94.4m,
                        CreatedAt = new DateTime(2025, 8, 31, 22, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 9, 3),
                        ShiftId = 2,
                        SlotTime = "16:00–17:00",
                        LoadingTime = 50,
                        TargetAmount = "100",
                        ResultAmount = "98",
                        OEE = 98.0m,
                        CreatedAt = new DateTime(2025, 9, 3, 18, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 6),
                        ShiftId = 2,
                        SlotTime = "17:00–18:30",
                        LoadingTime = 60,
                        TargetAmount = "120",
                        ResultAmount = "110",
                        OEE = 91.7m,
                        CreatedAt = new DateTime(2025, 9, 6, 19, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 7),
                        ShiftId = 1,
                        SlotTime = "09:00–10:00",
                        LoadingTime = 60,
                        TargetAmount = "130",
                        ResultAmount = "125",
                        OEE = 96.1m,
                        CreatedAt = new DateTime(2025, 9, 7, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 9, 8),
                        ShiftId = 2,
                        SlotTime = "16:00–17:00",
                        LoadingTime = 50,
                        TargetAmount = "100",
                        ResultAmount = "95",
                        OEE = 95.0m,
                        CreatedAt = new DateTime(2025, 9, 8, 18, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 9, 9),
                        ShiftId = 1,
                        SlotTime = "11:00–12:00",
                        LoadingTime = 50,
                        TargetAmount = "100",
                        ResultAmount = "90",
                        OEE = 90.0m,
                        CreatedAt = new DateTime(2025, 9, 9, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 9, 12),
                        ShiftId = 1,
                        SlotTime = "08:00–09:00",
                        LoadingTime = 50,
                        TargetAmount = "120",
                        ResultAmount = "110",
                        OEE = 91.7m,
                        CreatedAt = new DateTime(2025, 9, 12, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 9, 14),
                        ShiftId = 2,
                        SlotTime = "14:00–15:00",
                        LoadingTime = 60,
                        TargetAmount = "150",
                        ResultAmount = "145",
                        OEE = 96.7m,
                        CreatedAt = new DateTime(2025, 9, 14, 18, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 16),
                        ShiftId = 1,
                        SlotTime = "10:00–11:00",
                        LoadingTime = 60,
                        TargetAmount = "140",
                        ResultAmount = "130",
                        OEE = 92.8m,
                        CreatedAt = new DateTime(2025, 9, 16, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 24),
                        ShiftId = 2,
                        SlotTime = "18:00–19:00",
                        LoadingTime = 60,
                        TargetAmount = "120",
                        ResultAmount = "115",
                        OEE = 95.8m,
                        CreatedAt = new DateTime(2025, 9, 24, 20, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 9, 27),
                        ShiftId = 1,
                        SlotTime = "13:00–14:00",
                        LoadingTime = 60,
                        TargetAmount = "100",
                        ResultAmount = "95",
                        OEE = 95.0m,
                        CreatedAt = new DateTime(2025, 9, 27, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 29),
                        ShiftId = 2,
                        SlotTime = "16:00–17:00",
                        LoadingTime = 50,
                        TargetAmount = "110",
                        ResultAmount = "100",
                        OEE = 90.9m,
                        CreatedAt = new DateTime(2025, 9, 29, 18, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 10, 1),
                        ShiftId = 2,
                        SlotTime = "17:00–18:00",
                        LoadingTime = 60,
                        TargetAmount = "120",
                        ResultAmount = "115",
                        OEE = 95.8m,
                        CreatedAt = new DateTime(2025, 10, 1, 20, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 7),
                        ShiftId = 2,
                        SlotTime = "21:00–21:30",
                        LoadingTime = 50,
                        TargetAmount = "100",
                        ResultAmount = "92",
                        OEE = 92.0m,
                        CreatedAt = new DateTime(2025, 10, 7, 22, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 7),
                        ShiftId = 1,
                        SlotTime = "12:00–12:30",
                        LoadingTime = 50,
                        TargetAmount = "80",
                        ResultAmount = "75",
                        OEE = 93.7m,
                        CreatedAt = new DateTime(2025, 10, 7, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 10, 10),
                        ShiftId = 1,
                        SlotTime = "07:00–08:00",
                        LoadingTime = 60,
                        TargetAmount = "130",
                        ResultAmount = "120",
                        OEE = 92.3m,
                        CreatedAt = new DateTime(2025, 10, 10, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 10),
                        ShiftId = 2,
                        SlotTime = "18:00–19:00",
                        LoadingTime = 60,
                        TargetAmount = "110",
                        ResultAmount = "105",
                        OEE = 95.5m,
                        CreatedAt = new DateTime(2025, 10, 10, 20, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 10, 20),
                        ShiftId = 2,
                        SlotTime = "14:00–15:00",
                        LoadingTime = 60,
                        TargetAmount = "120",
                        ResultAmount = "115",
                        OEE = 95.8m,
                        CreatedAt = new DateTime(2025, 10, 20, 18, 0, 0)
                    },
                    // Các ngày chỉ có sản lượng, không có sự cố:
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 8, 20),
                        ShiftId = 1,
                        SlotTime = "06:00–07:00",
                        LoadingTime = 60,
                        TargetAmount = "100",
                        ResultAmount = "95",
                        OEE = 95.0m,
                        CreatedAt = new DateTime(2025, 8, 20, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 1),
                        ShiftId = 2,
                        SlotTime = "15:00–16:00",
                        LoadingTime = 60,
                        TargetAmount = "120",
                        ResultAmount = "118",
                        OEE = 98.3m,
                        CreatedAt = new DateTime(2025, 9, 1, 20, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 9, 10),
                        ShiftId = 2,
                        SlotTime = "22:00–23:00",
                        LoadingTime = 60,
                        TargetAmount = "110",
                        ResultAmount = "105",
                        OEE = 95.5m,
                        CreatedAt = new DateTime(2025, 9, 10, 23, 59, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 9, 20),
                        ShiftId = 1,
                        SlotTime = "09:00–10:00",
                        LoadingTime = 60,
                        TargetAmount = "130",
                        ResultAmount = "125",
                        OEE = 96.1m,
                        CreatedAt = new DateTime(2025, 9, 20, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 9, 30),
                        ShiftId = 2,
                        SlotTime = "18:30–19:30",
                        LoadingTime = 60,
                        TargetAmount = "115",
                        ResultAmount = "108",
                        OEE = 93.9m,
                        CreatedAt = new DateTime(2025, 9, 30, 20, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 3),
                        ShiftId = 2,
                        SlotTime = "01:00–03:00",
                        LoadingTime = 75,
                        TargetAmount = "120",
                        ResultAmount = "110",
                        OEE = 91.6m,
                        CreatedAt = new DateTime(2025, 10, 3, 6, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 10, 5),
                        ShiftId = 1,
                        SlotTime = "10:00–11:30",
                        LoadingTime = 60,
                        TargetAmount = "150",
                        ResultAmount = "140",
                        OEE = 93.3m,
                        CreatedAt = new DateTime(2025, 10, 5, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 10, 12),
                        ShiftId = 2,
                        SlotTime = "19:30–20:30",
                        LoadingTime = 50,
                        TargetAmount = "90",
                        ResultAmount = "85",
                        OEE = 94.4m,
                        CreatedAt = new DateTime(2025, 10, 12, 22, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 15),
                        ShiftId = 2,
                        SlotTime = "05:00–06:00",
                        LoadingTime = 60,
                        TargetAmount = "100",
                        ResultAmount = "97",
                        OEE = 97.0m,
                        CreatedAt = new DateTime(2025, 10, 15, 6, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 10, 18),
                        ShiftId = 1,
                        SlotTime = "11:30–12:30",
                        LoadingTime = 50,
                        TargetAmount = "120",
                        ResultAmount = "118",
                        OEE = 98.3m,
                        CreatedAt = new DateTime(2025, 10, 18, 14, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 2,
                        Date = new DateTime(2025, 10, 22),
                        ShiftId = 2,
                        SlotTime = "15:00–16:00",
                        LoadingTime = 60,
                        TargetAmount = "130",
                        ResultAmount = "120",
                        OEE = 92.3m,
                        CreatedAt = new DateTime(2025, 10, 22, 18, 0, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 3,
                        Date = new DateTime(2025, 10, 25),
                        ShiftId = 2,
                        SlotTime = "22:00–23:00",
                        LoadingTime = 60,
                        TargetAmount = "140",
                        ResultAmount = "135",
                        OEE = 96.4m,
                        CreatedAt = new DateTime(2025, 10, 25, 23, 59, 0)
                    },
                    new ProductionOutput
                    {
                        LineId = 1,
                        Date = new DateTime(2025, 10, 28),
                        ShiftId = 1,
                        SlotTime = "08:00–09:00",
                        LoadingTime = 50,
                        TargetAmount = "120",
                        ResultAmount = "115",
                        OEE = 95.8m,
                        CreatedAt = new DateTime(2025, 10, 28, 14, 0, 0)
                    }
                };

                await context.ProductionOutputs.AddRangeAsync(productionOutputs);
                await context.SaveChangesAsync();
            }
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
            await SeedSpareParts(context);
            await SeedIncidentHistories(context);
            await SeedProductionOutputs(context);
        }
    }
}