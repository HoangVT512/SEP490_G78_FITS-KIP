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
                        Name = "Người dùng",
                        NormalizedName = "NGUOI DUNG",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Tổ trưởng",
                        NormalizedName = "TO TRUONG",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý kỹ thuật",
                        NormalizedName = "QUAN LY KY THUAT",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Kỹ thuật viên",
                        NormalizedName = "KY THUAT VIEN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Giám đốc",
                        NormalizedName = "GIAM DOC",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản trị viên",
                        NormalizedName = "QUAN TRI VIEN",
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }
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
                    PhoneNumber = "0901234567",
                    Position = "Quản trị viên hệ thống",
                    Gender = "Nam"
                };
                admin.PasswordHash = _passwordHasher.HashPassword(admin, "Admin123@");
                users.Add(admin);

                // Manager Users - Giám đốc
                var manager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "giamdoc",
                    NormalizedUserName = "GIAMDOC",
                    Email = "giamdoc@kipvietnam.vn",
                    NormalizedEmail = "GIAMDOC@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Trần Thị Mai Anh",
                    EmployeeCode = "GD001",
                    PhoneNumber = "0987654321",
                    Position = "Giám đốc điều hành",
                    Gender = "Nữ"
                };
                manager.PasswordHash = _passwordHasher.HashPassword(manager, "Manager123@");
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
                    PhoneNumber = "0912345678",
                    Position = "Quản lý phòng Kỹ thuật",
                    Gender = "Nam"
                };
                techManager.PasswordHash = _passwordHasher.HashPassword(techManager, "TechMgr123@");
                users.Add(techManager);

                // Team Leaders - Tổ trưởng
                var teamLeader1 = new User
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
                    PhoneNumber = "0923456789",
                    Position = "Tổ trưởng ca sản xuất",
                    Gender = "Nam"
                };
                teamLeader1.PasswordHash = _passwordHasher.HashPassword(teamLeader1, "TeamLead123@");
                users.Add(teamLeader1);

                var teamLeader2 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "totruong.qc",
                    NormalizedUserName = "TOTRUONG.QC",
                    Email = "totruong.qc@kipvietnam.vn",
                    NormalizedEmail = "TOTRUONG.QC@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Võ Thị Chất lượng",
                    EmployeeCode = "TT002",
                    PhoneNumber = "0934567890",
                    Position = "Tổ trưởng kiểm tra chất lượng",
                    Gender = "Nữ"
                };
                teamLeader2.PasswordHash = _passwordHasher.HashPassword(teamLeader2, "TeamLead123@");
                users.Add(teamLeader2);

                // Technicians - Kỹ thuật viên
                var technician1 = new User
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
                    PhoneNumber = "0945678901",
                    Position = "Kỹ thuật viên điện tử",
                    Gender = "Nam"
                };
                technician1.PasswordHash = _passwordHasher.HashPassword(technician1, "Tech123@");
                users.Add(technician1);

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
                    FullName = "Hoàng Thị Bảo trì",
                    EmployeeCode = "KTV002",
                    PhoneNumber = "0956789012",
                    Position = "Kỹ thuật viên bảo trì",
                    Gender = "Nữ"
                };
                technician2.PasswordHash = _passwordHasher.HashPassword(technician2, "Tech123@");
                users.Add(technician2);

                // Regular Users - Người dùng
                var user1 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "nhanvien.sanxuat1",
                    NormalizedUserName = "NHANVIEN.SANXUAT1",
                    Email = "nhanvien.sanxuat1@kipvietnam.vn",
                    NormalizedEmail = "NHANVIEN.SANXUAT1@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Văn Sản xuất",
                    EmployeeCode = "NV001",
                    PhoneNumber = "0967890123",
                    Position = "Nhân viên vận hành máy",
                    Gender = "Nam"
                };
                user1.PasswordHash = _passwordHasher.HashPassword(user1, "User123@");
                users.Add(user1);

                var user2 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "nhanvien.sanxuat2",
                    NormalizedUserName = "NHANVIEN.SANXUAT2",
                    Email = "nhanvien.sanxuat2@kipvietnam.vn",
                    NormalizedEmail = "NHANVIEN.SANXUAT2@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Trần Thị Lắp ráp",
                    EmployeeCode = "NV002",
                    PhoneNumber = "0978901234",
                    Position = "Nhân viên lắp ráp",
                    Gender = "Nữ"
                };
                user2.PasswordHash = _passwordHasher.HashPassword(user2, "User123@");
                users.Add(user2);

                var user3 = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "nhanvien.qc",
                    NormalizedUserName = "NHANVIEN.QC",
                    Email = "nhanvien.qc@kipvietnam.vn",
                    NormalizedEmail = "NHANVIEN.QC@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Lê Văn Kiểm tra",
                    EmployeeCode = "NV003",
                    PhoneNumber = "0989012345",
                    Position = "Nhân viên kiểm tra chất lượng",
                    Gender = "Nam"
                };
                user3.PasswordHash = _passwordHasher.HashPassword(user3, "User123@");
                users.Add(user3);

                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUserRoles(FitskipDbContext context)
        {
            // Phân quyền cho người dùng
            if (!await context.UserRoles.AnyAsync())
            {

                var roles = await context.Roles.ToListAsync();
                var dbUsers = await context.Users.ToListAsync();

                var userRoleAssignments = new List<IdentityUserRole<string>>();

                // Phân quyền Quản trị viên
                var adminRole = roles.FirstOrDefault(r => r.NormalizedName == "QUAN TRI VIEN");
                var adminUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QTV") == true).ToList();
                foreach (var user in adminUsers)
                {
                    if (adminRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = adminRole.Id });
                }

                // Phân quyền Giám đốc
                var managerRole = roles.FirstOrDefault(r => r.NormalizedName == "GIAM DOC");
                var managerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("GD") == true).ToList();
                foreach (var user in managerUsers)
                {
                    if (managerRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = managerRole.Id });
                }

                // Phân quyền Quản lý kỹ thuật
                var techManagerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUAN LY KY THUAT");
                var techManagerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QLKT") == true).ToList();
                foreach (var user in techManagerUsers)
                {
                    if (techManagerRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = techManagerRole.Id });
                }

                // Phân quyền Tổ trưởng
                var teamLeaderRole = roles.FirstOrDefault(r => r.NormalizedName == "TO TRUONG");
                var teamLeaderUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("TT") == true).ToList();
                foreach (var user in teamLeaderUsers)
                {
                    if (teamLeaderRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = teamLeaderRole.Id });
                }

                // Phân quyền Kỹ thuật viên
                var technicianRole = roles.FirstOrDefault(r => r.NormalizedName == "KY THUAT VIEN");
                var technicianUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("KTV") == true).ToList();
                foreach (var user in technicianUsers)
                {
                    if (technicianRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = technicianRole.Id });
                }

                // Phân quyền Người dùng thường
                var userRole = roles.FirstOrDefault(r => r.NormalizedName == "NGUOI DUNG");
                var regularUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("NV") == true).ToList();
                foreach (var user in regularUsers)
                {
                    if (userRole != null)
                        userRoleAssignments.Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = userRole.Id });
                }

                await context.UserRoles.AddRangeAsync(userRoleAssignments);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedAllData(FitskipDbContext context)
        {
            await SeedRoles(context);
            await SeedDepartments(context);
            await SeedUsers(context);
            await SeedUserRoles(context);
        }
    }
}