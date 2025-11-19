using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.SeedData
{
    public static class SeedData
    {
        private static readonly PasswordHasher<User> _passwordHasher = new PasswordHasher<User>();

        private static readonly Dictionary<string, (string Name, string Workshop, List<(string Id, string Name, List<(string Code, string Name)> Equipment)> Stages)> ProductionLines = new()
        {
            ["CK-C01"] = ("Gia công tiện / khoan / phay", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C01-S01", "Công đoạn tiện", new List<(string, string)>
                {
                    ("1N-611N-03", "Máy tiện 1И 611Π"),
                    ("T6M16", "Máy tiện T6M16"),
                    ("1K62", "Máy tiện 1K62"),
                    ("C-620", "Máy tiện C 620"),
                }),
                ("CK-C01-S02", "Công đoạn khoan đứng", new List<(string, string)>
                {
                    ("BK25-AT", "Máy khoan đứng BK25 AT"),
                    ("KĐ2-G25", "Máy khoan đứng G25"),
                }),
                ("CK-C01-S03", "Công đoạn khoan cần", new List<(string, string)>
                {
                    ("KC1-NR2", "Khoan cần VR2"),
                    ("KC2-RF20", "Máy khoan cần RF 20"),
                    ("KC3-K325", "Máy khoan cần K325")
                }),
                ("CK-C01-S04", "Công đoạn khoan bàn", new List<(string, string)>
                {
                    ("KB4-K12", "Máy khoan bàn K12"),
                    ("KB29-KITAGAWA", "Máy khoan bàn KITAGAWA"),
                }),
                ("CK-C01-S05", "Công đoạn phay", new List<(string, string)>
                {
                    ("AKUMA-HoWa", "Máy phay nhật AKUMA&HOWA"),
                    ("F2-676N", "Máy phay 676П"),
                    ("F6-FWA41", "Máy phay FWA41"),
                    ("TTGX-HV-35", "Máy phay TTGC HV-35"),
                    ("TTGC-VMC-65E", "Máy phay TTGC VMC 65E")
                })
            }),
            ["CK-C02"] = ("Dập / uốn / cắt tôn", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C02-S01", "Công đoạn cắt tôn & kim loại", new List<(string, string)>
                {
                    ("QLH5/2050", "Máy cắt tôn QLH5/2050"),
                    ("12/2500", "Máy cắt tôn 12/2500"),
                    ("CV1-D300", "Máy cưa vòng D300"),
                    ("LB-6225-TWIN", "Máy cắt góc LB 6225 TWIN")
                }),
                ("CK-C02-S02", "Công đoạn cắt đột & uốn", new List<(string, string)>
                {
                    ("CU2-NSB-606", "Máy cắt đột uốn NSB 606"),
                    ("CĐ2-TIGER-750", "Máy cắt đột TIGER 750"),
                    ("EU1-W-C67Y", "Máy ép uốn W C67Y")
                }),
                ("CK-C02-S03", "Công đoạn dập tự động", new List<(string, string)>
                {
                    ("DTĐ1-YSM-26T", "Máy dập tự động YSM-26T"),
                    ("DTĐ2-YSM-38T", "Máy dập tự động YSM-38T"),
                }),
                ("CK-C02-S04", "Công đoạn dập cơ khí lớn", new List<(string, string)>
                {
                    ("D1-J23-3,15", "Máy dập J23-3,15"),
                    ("KYOKUTO-12T", "Máy dập KYOKUTO-12T"),
                    ("D8-16T-Japan", "Máy dập 16T-Nhật"),
                    ("DOBBY-20T", "Máy dập hơi DOBBY-20T"),
                    ("AMADA-60T", "Máy dập hơi AMADA-60T")
                }),
                ("CK-C02-S05", "Công đoạn ép phụ trợ", new List<(string, string)>
                {
                    ("EB1", "Máy ép bùn")
                })
            }),
            ["CK-C03"] = ("Mạ / xử lý bề mặt", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C03-S01", "Công đoạn tẩy dầu & tiền xử lý", new List<(string, string)>
                {
                    ("QD1-TD", "Máy quay tẩy dầu"),
                    ("LDD1", "Máy lọc dung dịch")
                }),
                ("CK-C03-S02", "Công đoạn phốt phát hóa", new List<(string, string)>
                {
                    ("PPH1", "Hệ thống phốt phát hoá")
                }),
                ("CK-C03-S03", "Công đoạn mạ điện", new List<(string, string)>
                {
                    ("MQ1", "Máy mạ quay tự chế"),
                    ("MQ3", "Máy mạ quay"),
                    ("BN1-300A", "Bộ nguồn mạ 300A"),
                    ("BN3-TC-300A", "Bộ nguồn mạ tự chế 300A"),
                    ("BN5-TC-500A", "Bộ nguồn mạ tự chế 500A"),
                    ("BN6-TC-200A", "Bộ nguồn mạ tự chế 200A")
                }),
                ("CK-C03-S04", "Công đoạn phun sơn", new List<(string, string)>
                {
                    ("BPSN1", "Buồng phun sơn nước")
                }),
                ("CK-C03-S05", "Công đoạn xử lý môi trường", new List<(string, string)>
                {
                    ("HTSLNT1", "Hệ thống xử lý nước thải + khí thải mạ")
                })
            }),
            ["CK-C04"] = ("Hàn linh kiện cơ khí", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C04-S01", "Công đoạn hàn chấm & tiếp điểm", new List<(string, string)>
                {
                    ("HC1-SD-20A", "Máy hàn tiếp điểm SD 20A"),
                    ("HC2-MTPN-75", "Máy hàn chấm MTPΠ 75"),
                    ("HC4-20-KVA", "Máy hàn chấm 20 KVA"),
                    ("HC5-RAS-25KVA", "Máy hàn chấm RAS 25KVA")
                }),
                ("CK-C04-S02", "Công đoạn hàn CO2", new List<(string, string)>
                {
                    ("HCO22-CO2-315", "Máy hàn CO2 315"),
                    ("CO2-NBC-270", "Máy hàn CO2 - NBC 270"),
                    ("CO2-Wig-TN280E", "Máy hàn CO2 Wig TN 280 E")
                }),
                ("CK-C04-S03", "Công đoạn hàn điện", new List<(string, string)>
                {
                    ("HĐ1-BS-300TH", "Máy hàn điện BS 300TH"),
                    ("HĐ2-AC-200", "Máy hàn điện AC 200"),
                    ("HĐ3-TIG-200", "Máy hàn điện TIG 200"),
                    ("HĐ4-JASIC1", "Máy hàn điện 1 pha JASIC1")
                }),
                ("CK-C04-S04", "Công đoạn hàn & cắt gas", new List<(string, string)>
                {
                    ("HH1-GAS", "Bộ hàn hơi GAS"),
                    ("HC2-TTTĐ", "Máy cắt thép tấm tự động")
                })
            }),
            ["CK-C05"] = ("Cắt dây kim loại & tấm", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C05-S01", "Công đoạn cắt dây kim loại", new List<(string, string)>
                {
                    ("GS-4050A", "Máy cắt dây GS 4050A"),
                    ("CD5-JSEDM", "Máy cắt dây đồng JSEDM"),
                }),
                ("CK-C05-S02", "Công đoạn gia công xung điện", new List<(string, string)>
                {
                    ("JSEDM-90A", "Máy xung điện JSEDM 90A"),
                    ("JSEDM-30A", "Máy xung điện JSEDM 30A"),
                    ("GOLD-SUN-75A", "Máy xung điện GOLD SUN 75A"),
                    ("JSEDM-60A", "Máy xung điện JSEDM 60A")
                }),
                ("CK-C05-S03", "Công đoạn khoan xung", new List<(string, string)>
                {
                    ("KX1-NC-EDM", "Máy khoan xung NC-EDM")
                })
            }),
            ["CK-C06"] = ("Đánh bóng & hoàn thiện", "XCK", new List<(string, string, List<(string, string)>)>
            {
                ("CK-C06-S01", "Công đoạn mài dao & dụng cụ", new List<(string, string)>
                {
                    ("MD1-U2", "Máy mài dao U2")
                }),
                ("CK-C06-S02", "Công đoạn mài phẳng", new List<(string, string)>
                {
                    ("MF4-NICCO", "Máy mài phẳng nhật NICCO"),
                    ("MF3-PFG", "Máy mài phẳng PFG"),
                    ("MF6-SPC20", "Máy mài phẳng SPC20")
                }),
                ("CK-C06-S03", "Công đoạn mài tròn", new List<(string, string)>
                {
                    ("MT1", "Máy mài tròn 3Б 12"),
                    ("MT2", "Máy mài tròn KUF 250")
                }),
                ("CK-C06-S04", "Công đoạn đánh bóng", new List<(string, string)>
                {
                    ("ĐB5", "Máy đánh bóng tự chế"),
                    ("LT1", "Máy đánh bóng li tâm")
                }),
                ("CK-C06-S05", "Công đoạn sấy & hoàn thiện", new List<(string, string)>
                {
                    ("QLTX1", "Máy quay ly tâm – sấy chi tiết X1"),
                    ("QLTX2", "Máy quay ly tâm – sấy chi tiết X2"),
                })
            }),
            ["LR-L01"] = ("Lắp ráp thân & vỏ thiết bị", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L01-S01", "Công đoạn lắp khung & vỏ", new List<(string, string)>
                {
                    ("BV1", "Máy bắn vít")
                }),
                ("LR-L01-S02", "Công đoạn lắp chi tiết cơ khí", new List<(string, string)>
                {
                    ("KB3", "Máy khoan bàn 1 pha")
                })
            }),
            ["LR-L02"] = ("Lắp linh kiện điện & đấu nối", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L02-S01", "Công đoạn gắn mô-đun điện", new List<(string, string)>
                {
                    ("BUTT-WELDER", "Máy hàn dây BUTT WELDER ")
                }),
                ("LR-L02-S02", "Công đoạn đấu dây & tiếp điểm", new List<(string, string)>
                {
                    ("FI-NI-10HP", "Máy nén khí FI NI 10HP")
                })
            }),
            ["LR-L03"] = ("Thử chức năng điện – aptomat", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L03-S01", "Công đoạn test aptomat 2P/3P", new List<(string, string)>
                {
                    ("T1-ATOMAT-2P", "Máy tét ATOMAT -2P"),
                    ("T2-ATOMAT-3P", "Máy tét ATOMAT -3P")
                }),
                ("LR-L03-S02", "Công đoạn test cơ & cao áp", new List<(string, string)>
                {
                    ("TC1-ATM", "Máy tét cơ (Ổ cắm, công tắc, ATM)"),
                    ("MTCA1", "Máy tét cao áp")
                }),
                ("LR-L03-S03", "Công đoạn lắp ráp ATM tự động", new List<(string, string)>
                {
                    ("DT-ATM1", "Dây truyền lắp ATM tự động")
                })
            }),
            ["LR-L04"] = ("Lắp ráp quạt & thiết bị chiếu sáng", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L04-S01", "Công đoạn lắp motor & cánh quạt", new List<(string, string)>
                {
                    ("M1-123", "Máy mài 2 đá M123")
                }),
                ("LR-L04-S02", "Công đoạn lắp đèn LED", new List<(string, string)>
                {
                    ("KĐLT1", "Máy kẹp đèn LED với điện trở"),
                }),
                ("LR-L04-S03", "Công đoạn test chức năng quạt & đèn", new List<(string, string)>
                {
                    ("BALMA-3HP", "Máy nén khí BALMA 3HP")
                })
            }),
            ["LR-L05"] = ("Hàn & gắn phụ kiện", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L05-S01", "Công đoạn hàn nhỏ", new List<(string, string)>
                {
                    ("MEQT2", "Máy ép quay tay")
                }),
                ("LR-L05-S02", "Công đoạn gắn phụ kiện", new List<(string, string)>
                {
                    ("TĐTĐ1", "Máy tán đinh tự động")
                })
            }),
            ["LR-L06"] = ("Đóng gói sơ bộ & dán nhãn", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L06-S01", "Công đoạn chuẩn bị bao bì", new List<(string, string)>
                {
                    ("CL1", "Máy cắt lăn"),
                    ("CR1", "Máy cắt rãnh"),
                    ("DG1", "Máy ghim hộp"),
                    ("BPG", "Máy bế phôi giấy")
                }),
                ("LR-L06-S02", "Công đoạn in nhãn sản phẩm", new List<(string, string)>
                {
                    ("LC-TP1-100", "Máy in nhãn SP LC-TP1-100"),
                    ("LC-TP2-100", "Máy in nhãn SP LC-TP2-100"),
                    ("FUFA", "Máy in nhãn sản phẩm FUFA")
                }),
                ("LR-L06-S03", "Công đoạn đóng gói sản phẩm", new List<(string, string)>
                {
                    ("ĐG02", "Máy đóng gói phích cắm 02"),
                    ("ĐG03", "Máy đóng gói phích cắm 03"),
                    ("BGMC1", "Máy bao gói màng co MC1"),
                    ("BGMC2", "Máy bao gói màng co MC2")
                })
            }),
            ["LR-L07"] = ("Kiểm tra cuối & đóng kiện xuất hàng", "XLR", new List<(string, string, List<(string, string)>)>
            {
                ("LR-L07-S01", "Công đoạn đo kiểm cuối", new List<(string, string)>
                {
                    ("ĐQ1", "Máy đo quang")
                }),
                ("LR-L07-S02", "Công đoạn đo cách điện", new List<(string, string)>
                {
                    ("LD-20AH", "Máy sấy khí LD–20AH")
                }),
            }),
            ["DY-D01"] = ("Kéo / bện dây dẫn", "XDY", new List<(string, string, List<(string, string)>)>
            {
                ("DY-D01-S01", "Công đoạn kéo dây đồng", new List<(string, string)>
                {
                    ("KT01", "Máy kéo trung"),
                    ("KN01", "Máy kéo nhỏ 01"),
                    ("KN02", "Máy kéo nhỏ 02"),
                    ("K8Đ1", "Máy kéo 8 đường")
                }),
                ("DY-D01-S02", "Công đoạn bện xoắn dây", new List<(string, string)>
                {
                    ("BX01-630", "Máy bện xoắn 630"),
                    ("BX03-1000", "Máy bện xoắn 1000"),
                    ("BX04-37Đ", "Máy bện xoắn 37 đường"),
                    ("BX05-1+4", "Máy bện xoắn 1+4"),
                    ("BX06-1+3", "Máy bện xoắn 1+3"),
                    ("BX07-650", "Máy bện xoắn 650"),
                })
            }),
            ["DY-D02"] = ("Bọc cách điện PVC/XLPE", "XDY", new List<(string, string, List<(string, string)>)>
            {
                ("DY-D02-S01", "Công đoạn bọc vỏ PVC", new List<(string, string)>
                {
                    ("PVC-80", "Máy bọc dây PVC-80"),
                    ("PVC/XLPE-80", "Máy bọc dây PVC/XLPE-80"),
                    ("PVC/XLPE-100", "Máy bọc dây PVC/XLPE-100"),
                    ("PVC-70+35", "Máy bọc dây PVC 70+35")
                }),
                ("DY-D02-S02", "Công đoạn xử lý nhiệt", new List<(string, string)>
                {
                    ("LUCK01", "Lò đốt chân không")
                })
            }),
            ["DY-D03"] = ("Máy tuốt đầu dây & cắt dây", "XDY", new List<(string, string, List<(string, string)>)>
            {
                ("DY-D03-S01", "Công đoạn tuốt đầu dây", new List<(string, string)>
                {
                    ("TD1", "Máy tuốt đầu dây TD1"),
                    ("TD2", "Máy tuốt đầu dây TD2"),
                    ("TKC1-PC", "Máy tuốt đầu dây kẹp cực ph. cắm")
                }),
                ("DY-D03-S02", "Công đoạn cắt dây theo kích thước", new List<(string, string)>
                {
                    ("CDN1", "Máy cắt dây nguồn"),
                    ("CDBĐ1", "Máy cắt dây bảng điện"),
                    ("CDNTĐ1", "Máy cắt dây nguồn tự động")
                }),
                ("DY-D03-S03", "Công đoạn kẹp cực & xử lý đầu", new List<(string, string)>
                {
                    ("KCD1", "Máy kẹp cực dây"),
                    ("TVDĐ1", "Máy tách vỏ dây điện"),
                    ("TXDĐ1", "Máy tuôn xoắn dây điện")
                })
            }),
            ["DY-D04"] = ("Đánh cuộn & cuộn dây lớn", "XDY", new List<(string, string, List<(string, string)>)>
            {
                ("DY-D04-S01", "Công đoạn đánh cuộn dây", new List<(string, string)>
                {
                    ("ĐC01", "Máy đánh cuộn 01"),
                    ("ĐC02", "Máy đánh cuộn 02"),
                    ("ĐCL1-KG", "Máy đánh cuộn lại (kéo ghen)")
                }),
                ("DY-D04-S02", "Công đoạn cuộn dây cỡ lớn", new List<(string, string)>
                {
                    ("BG+ĐC01", "Máy bao gói + đánh cuộn70+35"),
                    ("TB1-1200", "Máy thu bin 1200"),
                    ("GX1-1200", "Giàn xả 1200")
                })
            }),
            ["DY-D05"] = ("In nhãn & đóng gói dây/cáp", "XDY", new List<(string, string, List<(string, string)>)>
            {
                ("DY-D05-S01", "Công đoạn in nhãn dây cáp", new List<(string, string)>
                {
                    ("7300-LINX", "Máy in phun 7300 - LINX"),
                    ("6900-LINX", "Máy in phun 6900 - LINX"),
                    ("VIDEOJET-1710", "Máy in phun VIDEOJET - 1710"),
                    ("LINX-5900", "Máy in phun LINX-5900")
                }),
                ("DY-D05-S02", "Công đoạn đóng gói dây/cáp", new List<(string, string)>
                {
                    ("BG01", "Máy bao gói cuộn 01"),
                    ("BG02", "Máy bao gói cuộn 02")
                })
            })
        };

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
                    },
                    new IdentityRole
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Quản lý kho",
                        NormalizedName = "QUẢN LÝ KHO",
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
                        DepartmentName = "Phòng ban KHSX",
                        Description = "Kế hoạch sản xuất"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng ban QLCL",
                        Description = "Quản lý chất lượng"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng ban Kỹ Thuật",
                        Description = "Phòng chịu trách nhiệm về kỹ thuật và công nghệ sản xuất"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Kinh Doanh",
                        Description = "Phòng kinh doanh"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng Vật Tư",
                        Description = "Phòng vật tư"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng TCHC",
                        Description = "Phòng tài chính hành chính"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng TCKT",
                        Description = "Phòng tài chính kế toán"
                    },
                    new Department
                    {
                        DepartmentName = "Phòng IT",
                        Description = "Phòng công nghệ thông tin"
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

                // Warehouse Manager - Quản lý kho
                var warehouseManager = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "quanly.kho",
                    NormalizedUserName = "QUANLY.KHO",
                    Email = "quanly.kho@kipvietnam.vn",
                    NormalizedEmail = "QUANLY.KHO@KIPVIETNAM.VN",
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    FullName = "Nguyễn Văn Kho",
                    EmployeeCode = "QLK001",
                    PhoneNumber = "0934567890"
                };
                warehouseManager.PasswordHash = _passwordHasher.HashPassword(warehouseManager, "123456");
                users.Add(warehouseManager);

                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();

                // Update existing users with department, role, and phone
                var departments = await context.Departments.ToListAsync();
                var roles = await context.Roles.ToListAsync();

                var khsxDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban KHSX");
                var kyThuatDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban Kỹ Thuật");
                var vatTuDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban Vật Tư");
                var itDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban IT");

                var quanLyRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ");
                var toTruongRole = roles.FirstOrDefault(r => r.NormalizedName == "TỔ TRƯỞNG");
                var kyThuatVienRole = roles.FirstOrDefault(r => r.NormalizedName == "KỸ THUẬT VIÊN");
                var quanTriVienRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN TRỊ VIÊN");
                var quanLyKhoRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ KHO");
                var quanLyKyThuatRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ KỸ THUẬT");

                // Update Vũ Tuấn Hoàng
                var hoangUser = users.FirstOrDefault(u => u.UserName == "TT002");
                if (hoangUser != null)
                {
                    hoangUser.PhoneNumber = "0912345679";
                    hoangUser.DepartmentId = khsxDept?.DepartmentId;
                    hoangUser.RoleId = toTruongRole?.Id;
                }

                // Update Trần Thị Mai Anh
                var maiAnhUser = users.FirstOrDefault(u => u.UserName == "quanly");
                if (maiAnhUser != null)
                {
                    maiAnhUser.DepartmentId = khsxDept?.DepartmentId;
                    maiAnhUser.RoleId = quanLyRole?.Id;
                }

                // Update Nguyễn Thị Kỹ Thuật
                var nguyenThiKyThuatUser = users.FirstOrDefault(u => u.UserName == "kythuat.vien2");
                if (nguyenThiKyThuatUser != null)
                {
                    nguyenThiKyThuatUser.DepartmentId = kyThuatDept?.DepartmentId;
                    nguyenThiKyThuatUser.RoleId = kyThuatVienRole?.Id;
                }

                // Update Phạm Văn Sản xuất
                var phamVanSanXuatUser = users.FirstOrDefault(u => u.UserName == "totruong.sanxuat");
                if (phamVanSanXuatUser != null)
                {
                    phamVanSanXuatUser.DepartmentId = khsxDept?.DepartmentId;
                    phamVanSanXuatUser.RoleId = toTruongRole?.Id;
                }

                // Update Nguyễn Văn Kho
                var nguyenVanKhoUser = users.FirstOrDefault(u => u.UserName == "quanly.kho");
                if (nguyenVanKhoUser != null)
                {
                    nguyenVanKhoUser.DepartmentId = vatTuDept?.DepartmentId;
                    nguyenVanKhoUser.RoleId = quanLyKhoRole?.Id;
                }

                // Update Nguyễn Văn Quản trị
                var nguyenVanQuanTriUser = users.FirstOrDefault(u => u.UserName == "admin.dev");
                if (nguyenVanQuanTriUser != null)
                {
                    nguyenVanQuanTriUser.DepartmentId = itDept?.DepartmentId;
                    nguyenVanQuanTriUser.RoleId = quanTriVienRole?.Id;
                }

                // Update Đặng Văn Kỹ thuật
                var dangVanKyThuatUser = users.FirstOrDefault(u => u.UserName == "kythuat.vien1");
                if (dangVanKyThuatUser != null)
                {
                    dangVanKyThuatUser.DepartmentId = kyThuatDept?.DepartmentId;
                    dangVanKyThuatUser.RoleId = kyThuatVienRole?.Id;
                }

                // Update Lê Văn Kỹ thuật
                var leVanKyThuatUser = users.FirstOrDefault(u => u.UserName == "quanly.kythuat");
                if (leVanKyThuatUser != null)
                {
                    leVanKyThuatUser.DepartmentId = kyThuatDept?.DepartmentId;
                    leVanKyThuatUser.RoleId = quanLyKyThuatRole?.Id;
                }

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
                var managerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QL") == true && !u.EmployeeCode.StartsWith("QLKT") && !u.EmployeeCode.StartsWith("QLK") && u.RoleId == null).ToList();
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

            // Phân quyền Quản lý kho
            var warehouseManagerRole = roles.FirstOrDefault(r => r.NormalizedName == "QUẢN LÝ KHO");
            if (warehouseManagerRole != null)
            {
                var warehouseManagerUsers = dbUsers.Where(u => u.EmployeeCode?.StartsWith("QLK") == true && u.RoleId == null).ToList();
                foreach (var user in warehouseManagerUsers)
                {
                    user.RoleId = warehouseManagerRole.Id;
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
                var khsxDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban KHSX");
                var qlclDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng ban QLCL");
                var kinhDoanhDept = departments.FirstOrDefault(d => d.DepartmentName == "Phòng Kinh Doanh");

                var lines = new List<Line>();

                // Xưởng Cơ Khí (XCK)
                if (khsxDept != null)
                {
                    lines.AddRange(new List<Line>
                    {
                        new Line { LineName = "Gia công tiện / khoan / phay", LineCode = "CK-C01", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Dập / uốn / cắt tôn", LineCode = "CK-C02", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Mạ / xử lý bề mặt", LineCode = "CK-C03", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Hàn linh kiện cơ khí", LineCode = "CK-C04", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Cắt dây kim loại & tấm", LineCode = "CK-C05", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Đánh bóng & hoàn thiện", LineCode = "CK-C06", DepartmentId = khsxDept.DepartmentId, IsActive = true }
                    });
                }

                // Xưởng Lắp Ráp (XLR)
                if (khsxDept != null && qlclDept != null && kinhDoanhDept != null)
                {
                    lines.AddRange(new List<Line>
                    {
                        new Line { LineName = "Lắp ráp thân & vỏ thiết bị", LineCode = "LR-L01", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Lắp linh kiện điện & đấu nối", LineCode = "LR-L02", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Thử chức năng điện – aptomat", LineCode = "LR-L03", DepartmentId = qlclDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Lắp ráp quạt & thiết bị chiếu sáng", LineCode = "LR-L04", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Hàn & gắn phụ kiện", LineCode = "LR-L05", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Đóng gói sơ bộ & dán nhãn", LineCode = "LR-L06", DepartmentId = kinhDoanhDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Kiểm tra cuối & đóng kiện xuất hàng", LineCode = "LR-L07", DepartmentId = qlclDept.DepartmentId, IsActive = true }
                    });
                }

                // Xưởng Dây (XDY)
                if (khsxDept != null)
                {
                    lines.AddRange(new List<Line>
                    {
                        new Line { LineName = "Kéo / bện dây dẫn", LineCode = "DY-D01", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Bọc cách điện PVC/XLPE", LineCode = "DY-D02", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Máy tuốt đầu dây & cắt dây", LineCode = "DY-D03", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "Đánh cuộn & cuộn dây lớn", LineCode = "DY-D04", DepartmentId = khsxDept.DepartmentId, IsActive = true },
                        new Line { LineName = "In nhãn & đóng gói dây/cáp", LineCode = "DY-D05", DepartmentId = khsxDept.DepartmentId, IsActive = true }
                    });
                }

                await context.Lines.AddRangeAsync(lines);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedStages(FitskipDbContext context)
        {
            if (!await context.Stages.AnyAsync())
            {
                var lines = await context.Lines.ToListAsync();
                var lineDict = lines.ToDictionary(l => l.LineCode!, l => l.LineId);

                var stages = new List<Stage>();

                foreach (var productionLine in ProductionLines)
                {
                    if (lineDict.TryGetValue(productionLine.Key, out var lineId))
                    {
                        foreach (var stage in productionLine.Value.Stages)
                        {
                            var stageEntity = new Stage
                            {
                                StageName = stage.Name,
                                LineId = lineId,
                                IsActive = true
                            };

                            stages.Add(stageEntity);
                        }
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
                var stageDict = stages.ToDictionary(s => $"{s.Line?.LineCode}_{s.StageName}", s => s.StageId);

                var equipment = new List<Equipment>();

                foreach (var productionLine in ProductionLines)
                {
                    foreach (var stage in productionLine.Value.Stages)
                    {
                        var stageKey = $"{productionLine.Key}_{stage.Name}";
                        if (stageDict.TryGetValue(stageKey, out var stageId))
                        {
                            foreach (var equip in stage.Equipment)
                            {
                                var equipmentEntity = new Equipment
                                {
                                    EquipmentCode = equip.Code,
                                    EquipmentName = equip.Name,
                                    DateUse = DateOnly.FromDateTime(DateTime.Now.AddYears(-Random.Shared.Next(1, 5))),
                                    Origin = GetRandomOrigin(),
                                    Yom = DateTime.Now.Year - Random.Shared.Next(1, 10),
                                    Qrcode = $"QR_{equip.Code}",
                                    StageId = stageId,
                                    IsActive = true
                                };

                                equipment.Add(equipmentEntity);
                            }
                        }
                    }
                }

                await context.Equipment.AddRangeAsync(equipment);
                await context.SaveChangesAsync();
            }
        }

        private static string GetRandomOrigin()
        {
            var origins = new[] { "Việt Nam", "Nhật Bản", "Đức", "Mỹ", "Hàn Quốc", "Trung Quốc", "Ý", "Đài Loan" };
            return origins[Random.Shared.Next(origins.Length)];
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
                    new SparePart { PartNumber = "PT01", PartName = "Cơ cấu truyền động", PartType = "Cụm cơ khí", Quantity = 15, MinQuantity = 5, Location = "Kệ A1", IsActive = true },
                    new SparePart { PartNumber = "PT02", PartName = "Lõi từ", PartType = "Cơ cấu từ tính", Quantity = 20, MinQuantity = 8, Location = "Kệ A2", IsActive = true },
                    new SparePart { PartNumber = "PT03", PartName = "Cuộn hút", PartType = "Cuộn điện", Quantity = 25, MinQuantity = 10, Location = "Kệ A3", IsActive = true },
                    new SparePart { PartNumber = "PT04", PartName = "Thanh dẫn chính", PartType = "Dẫn điện", Quantity = 12, MinQuantity = 5, Location = "Kệ B1", IsActive = true },
                    new SparePart { PartNumber = "PT05", PartName = "Bộ dập hồ quang", PartType = "Buồng dập", Quantity = 8, MinQuantity = 3, Location = "Kệ B2", IsActive = true },
                    new SparePart { PartNumber = "PT06", PartName = "Tiếp điểm động", PartType = "Điện khí", Quantity = 30, MinQuantity = 12, Location = "Kệ B3", IsActive = true },
                    new SparePart { PartNumber = "PT07", PartName = "Tiếp điểm tĩnh", PartType = "Điện khí", Quantity = 30, MinQuantity = 12, Location = "Kệ B4", IsActive = true },
                    new SparePart { PartNumber = "PT08", PartName = "Cơ cấu bảo vệ quá tải nhiệt", PartType = "Thermo-magnetic", Quantity = 10, MinQuantity = 4, Location = "Kệ C1", IsActive = true },
                    new SparePart { PartNumber = "PT09", PartName = "Cơ cấu bảo vệ ngắn mạch", PartType = "Từ tính", Quantity = 10, MinQuantity = 4, Location = "Kệ C2", IsActive = true },
                    new SparePart { PartNumber = "PT10", PartName = "Lẫy đóng/ngắt", PartType = "Cơ khí", Quantity = 18, MinQuantity = 7, Location = "Kệ C3", IsActive = true },
                    new SparePart { PartNumber = "PT11", PartName = "Trục truyền lực", PartType = "Cơ khí", Quantity = 12, MinQuantity = 5, Location = "Kệ C4", IsActive = true },
                    new SparePart { PartNumber = "PT12", PartName = "Cơ cấu khóa liên động", PartType = "Cơ khí", Quantity = 8, MinQuantity = 3, Location = "Kệ D1", IsActive = true },
                    new SparePart { PartNumber = "PT13", PartName = "Bộ điều khiển phụ (trip unit)", PartType = "Điện tử", Quantity = 6, MinQuantity = 2, Location = "Kệ D2", IsActive = true },
                    new SparePart { PartNumber = "PT14", PartName = "Vỏ cách điện", PartType = "Nhựa kỹ thuật", Quantity = 15, MinQuantity = 6, Location = "Kệ D3", IsActive = true },
                    new SparePart { PartNumber = "PT15", PartName = "Thanh đấu nối", PartType = "Phụ kiện đấu dây", Quantity = 25, MinQuantity = 10, Location = "Kệ D4", IsActive = true },
                    new SparePart { PartNumber = "PT16", PartName = "Bộ kẹp ray", PartType = "Phụ kiện lắp đặt", Quantity = 20, MinQuantity = 8, Location = "Kệ E1", IsActive = true },
                    new SparePart { PartNumber = "PT17", PartName = "Nắp chắn hồ quang", PartType = "An toàn điện", Quantity = 14, MinQuantity = 5, Location = "Kệ E2", IsActive = true },
                    new SparePart { PartNumber = "PT18", PartName = "Bộ phóng hồ quang", PartType = "Dẫn hướng hồ quang", Quantity = 10, MinQuantity = 4, Location = "Kệ E3", IsActive = true },
                    new SparePart { PartNumber = "PT19", PartName = "Lò xo hồi vị", PartType = "Lò xo cơ khí", Quantity = 35, MinQuantity = 15, Location = "Kệ E4", IsActive = true },
                    new SparePart { PartNumber = "PT20", PartName = "Lò xo tiếp điểm", PartType = "Lò xo điện khí", Quantity = 40, MinQuantity = 18, Location = "Kệ F1", IsActive = true },
                    new SparePart { PartNumber = "PT21", PartName = "Ốc siết tiếp điểm", PartType = "Ốc vít", Quantity = 100, MinQuantity = 40, Location = "Kệ F2", IsActive = true },
                    new SparePart { PartNumber = "PT22", PartName = "Long đền", PartType = "Đệm", Quantity = 50, MinQuantity = 20, Location = "Kệ F3", IsActive = true },
                    new SparePart { PartNumber = "PT23", PartName = "Chốt định vị", PartType = "Cơ khí nhỏ", Quantity = 60, MinQuantity = 25, Location = "Kệ F4", IsActive = true },
                    new SparePart { PartNumber = "PT24", PartName = "Lò xo phụ", PartType = "Cơ khí nhỏ", Quantity = 45, MinQuantity = 20, Location = "Kệ G1", IsActive = true },
                    new SparePart { PartNumber = "PT25", PartName = "Gioăng cách điện", PartType = "Gioăng", Quantity = 55, MinQuantity = 22, Location = "Kệ G2", IsActive = true },
                    new SparePart { PartNumber = "PT26", PartName = "Nắp che phụ", PartType = "Nhựa kỹ thuật", Quantity = 20, MinQuantity = 8, Location = "Kệ G3", IsActive = true },
                    new SparePart { PartNumber = "PT27", PartName = "Tem nhãn", PartType = "Vật tư tiêu hao", Quantity = 200, MinQuantity = 50, Location = "Kệ G4", IsActive = true },
                    new SparePart { PartNumber = "PT28", PartName = "Dầu mỡ bôi trơn", PartType = "Tiêu hao", Quantity = 30, MinQuantity = 10, Location = "Kệ H1", IsActive = true },
                    new SparePart { PartNumber = "PT29", PartName = "Chổi vệ sinh hồ quang", PartType = "Tiêu hao", Quantity = 15, MinQuantity = 5, Location = "Kệ H2", IsActive = true },
                    new SparePart { PartNumber = "PT30", PartName = "Keo khóa ren", PartType = "Hóa chất tiêu hao", Quantity = 25, MinQuantity = 10, Location = "Kệ H3", IsActive = true },
                    new SparePart { PartNumber = "PT31", PartName = "Cảm biến dòng", PartType = "Cảm biến đo", Quantity = 12, MinQuantity = 5, Location = "Kệ H4", IsActive = true },
                    new SparePart { PartNumber = "PT32", PartName = "Cảm biến áp", PartType = "Cảm biến đo", Quantity = 12, MinQuantity = 5, Location = "Kệ I1", IsActive = true },
                    new SparePart { PartNumber = "PT33", PartName = "Module điều khiển", PartType = "Điện tử", Quantity = 8, MinQuantity = 3, Location = "Kệ I2", IsActive = true },
                    new SparePart { PartNumber = "PT34", PartName = "Relay bảo vệ", PartType = "Relay", Quantity = 20, MinQuantity = 8, Location = "Kệ I3", IsActive = true },
                    new SparePart { PartNumber = "PT35", PartName = "Biến dòng đo kiểm", PartType = "CT", Quantity = 10, MinQuantity = 4, Location = "Kệ I4", IsActive = true },
                    new SparePart { PartNumber = "PT36", PartName = "Biến áp cách ly", PartType = "Nguồn", Quantity = 8, MinQuantity = 3, Location = "Kệ J1", IsActive = true },
                    new SparePart { PartNumber = "PT37", PartName = "Màn hình hiển thị", PartType = "HMI", Quantity = 6, MinQuantity = 2, Location = "Kệ J2", IsActive = true },
                    new SparePart { PartNumber = "PT38", PartName = "Công tắc chọn chế độ", PartType = "Điện khí", Quantity = 15, MinQuantity = 6, Location = "Kệ J3", IsActive = true },
                    new SparePart { PartNumber = "PT39", PartName = "Cầu chì bảo vệ", PartType = "An toàn điện", Quantity = 50, MinQuantity = 20, Location = "Kệ J4", IsActive = true },
                    new SparePart { PartNumber = "PT40", PartName = "Bộ nguồn điều khiển", PartType = "Nguồn DC", Quantity = 10, MinQuantity = 4, Location = "Kệ K1", IsActive = true },
                    new SparePart { PartNumber = "PT41", PartName = "Đầu cos nhỏ", PartType = "Cos điện", Quantity = 18, MinQuantity = 7, Location = "Kệ K2", IsActive = true },
                    new SparePart { PartNumber = "PT42", PartName = "Dây dẫn test", PartType = "Dây điện", Quantity = 40, MinQuantity = 15, Location = "Kệ K3", IsActive = true },
                    new SparePart { PartNumber = "PT43", PartName = "Kẹp test", PartType = "Phụ kiện đo", Quantity = 30, MinQuantity = 12, Location = "Kệ K4", IsActive = true },
                    new SparePart { PartNumber = "PT44", PartName = "Giẻ lau cách điện", PartType = "Tiêu hao", Quantity = 80, MinQuantity = 30, Location = "Kệ L1", IsActive = true },
                    new SparePart { PartNumber = "PT45", PartName = "Găng tay cách điện", PartType = "An toàn", Quantity = 25, MinQuantity = 10, Location = "Kệ L2", IsActive = true },
                    new SparePart { PartNumber = "PT46", PartName = "Mỡ dẫn điện", PartType = "Hóa chất", Quantity = 20, MinQuantity = 8, Location = "Kệ L3", IsActive = true },
                    new SparePart { PartNumber = "PT47", PartName = "Mỡ cách điện", PartType = "Hóa chất", Quantity = 20, MinQuantity = 8, Location = "Kệ L4", IsActive = true },
                    new SparePart { PartNumber = "PT48", PartName = "Băng dính điện", PartType = "Tiêu hao", Quantity = 60, MinQuantity = 25, Location = "Kệ M1", IsActive = true },
                    new SparePart { PartNumber = "PT49", PartName = "Bu-lông gá test", PartType = "Ốc vít", Quantity = 70, MinQuantity = 30, Location = "Kệ M2", IsActive = true },
                    new SparePart { PartNumber = "PT50", PartName = "Cầu đấu phụ", PartType = "Phụ kiện đấu dây", Quantity = 35, MinQuantity = 15, Location = "Kệ M3", IsActive = true }
                };

                await context.SpareParts.AddRangeAsync(spareParts);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedIncidentHistories(FitskipDbContext context)
        {
            if (!await context.IncidentHistories.AnyAsync())
            {
                // Get all equipment and create mappings
                var equipmentList = await context.Equipment
                    .Include(e => e.Stage)
                    .ThenInclude(s => s.Line)
                    .ToListAsync();

                var equipmentCodeToIdMap = equipmentList.ToDictionary(e => e.EquipmentCode, e => e.EquipmentId);
                var equipmentCodeToLineIdMap = equipmentList.ToDictionary(e => e.EquipmentCode, e => e.Stage.LineId);

                // Get stop types
                var stopTypes = await context.StopTypes.ToListAsync();
                var stopTypeMap = stopTypes.ToDictionary(st => st.TypeName, st => st.TypeId);

                // Get users for assignment
                var users = await context.Users.ToListAsync();
                var technicianUsers = users.Where(u => u.RoleId != null).ToList();

                var random = new Random(42); // Fixed seed for consistent data

                var incidents = new List<IncidentHistory>();

                // Sample equipment codes to use for incidents
                var sampleEquipmentCodes = new[]
                {
                    "1N-611N-03", "T6M16", "1K62", "C-620", // CK-C01
                    "BK25-AT", "KĐ2-G25", // CK-C01 khoan
                    "KC1-NR2", "KC2-RF20", "KC3-K325", // CK-C01 khoan can
                    "KB4-K12", "KB29-KITAGAWA", // CK-C01 khoan ban
                    "AKUMA-HoWa", "F2-676N", "F6-FWA41", // CK-C01 phay
                    "QLH5/2050", "12/2500", "CV1-D300", // CK-C02 cat ton
                    "CU2-NSB-606", "CĐ2-TIGER-750", "EU1-W-C67Y", // CK-C02 cat dot uon
                    "DTĐ1-YSM-26T", "DTĐ2-YSM-38T", // CK-C02 dap tu dong
                    "D1-J23-3,15", "KYOKUTO-12T", "D8-16T-Japan", // CK-C02 dap co khi
                    "QD1-TD", "LDD1", // CK-C03 tay dau tien xu ly
                    "MQ1", "MQ3", "BN1-300A", // CK-C03 ma dien
                    "BPSN1", // CK-C03 phun son
                    "HC1-SD-20A", "HC2-MTPN-75", "HC4-20-KVA", // CK-C04 han cham
                    "HCO22-CO2-315", "CO2-NBC-270", // CK-C04 han CO2
                    "HĐ1-BS-300TH", "HĐ2-AC-200", // CK-C04 han dien
                    "GS-4050A", "CD5-JSEDM", // CK-C05 cat day kim loai
                    "JSEDM-90A", "JSEDM-30A", "GOLD-SUN-75A", // CK-C05 gia cong xung dien
                    "MD1-U2", // CK-C06 mai dao dung cu
                    "MF4-NICCO", "MF3-PFG", "MF6-SPC20", // CK-C06 mai phang
                    "MT1", "MT2", // CK-C06 mai tron
                    "ĐB5", "LT1", // CK-C06 danh bong
                    "BV1", // LR-L01 lap khung vo
                    "KB3", // LR-L01 lap chi tiet co khi
                    "BUTT-WELDER", // LR-L02 gan mo dun dien
                    "FI-NI-10HP", // LR-L02 dau day tiep diem
                    "T1-ATOMAT-2P", "T2-ATOMAT-3P", // LR-L03 test aptomat
                    "TC1-ATM", "MTCA1", // LR-L03 test co cao ap
                    "DT-ATM1", // LR-L03 lap rap ATM tu dong
                    "M1-123", // LR-L04 lap motor canh quat
                    "KĐLT1", // LR-L04 lap den LED
                    "BALMA-3HP", // LR-L04 test chuc nang quat den
                    "MEQT2", // LR-L05 han nho
                    "TĐTĐ1", // LR-L05 gan phu kien
                    "CL1", "CR1", "DG1", "BPG", // LR-L06 chuan bi bao bi
                    "LC-TP1-100", "LC-TP2-100", "FUFA", // LR-L06 in nhan san pham
                    "ĐG02", "ĐG03", "BGMC1", "BGMC2", // LR-L06 dong goi san pham
                    "ĐQ1", // LR-L07 do kiem cuoi
                    "LD-20AH", // LR-L07 do cach dien
                    "KT01", "KN01", "KN02", "K8Đ1", // DY-D01 keo day dong
                    "BX01-630", "BX03-1000", "BX04-37Đ", "BX05-1+4", // DY-D01 ben xoan day
                    "PVC-80", "PVC/XLPE-80", "PVC/XLPE-100", "PVC-70+35", // DY-D02 boc vo PVC
                    "LUCK01", // DY-D02 xu ly nhiet
                    "TD1", "TD2", "TKC1-PC", // DY-D03 tuot dau day
                    "CDN1", "CDBĐ1", "CDNTĐ1", // DY-D03 cat day theo kich thuoc
                    "KCD1", "TVDĐ1", "TXDĐ1", // DY-D03 kep cuc xu ly dau
                    "ĐC01", "ĐC02", "ĐCL1-KG", // DY-D04 danh cuon day
                    "BG+ĐC01", "TB1-1200", "GX1-1200", // DY-D04 cuon day co lon
                    "7300-LINX", "6900-LINX", "VIDEOJET-1710", "LINX-5900", // DY-D05 in nhan day cap
                    "BG01", "BG02" // DY-D05 dong goi day cap
                };

                // Create incidents for various dates and equipment
                var incidentData = new[]
                {
                    // August 2025
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "1N-611N-03", StopType = "Dừng ngắn", Duration = 5.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "BK25-AT", StopType = "Dừng ngắn", Duration = 1.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 9.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "KB4-K12", StopType = "Dừng dài", Duration = 9.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng ngắn", Duration = 4.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "BK25-AT", StopType = "Dừng dài", Duration = 15.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "MF4-NICCO", StopType = "Dừng dài", Duration = 7.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "1N-611N-03", StopType = "Dừng ngắn", Duration = 1.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "BK25-AT", StopType = "Dừng dài", Duration = 47.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 38.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 8, 27), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 15.00m, IsTechSupport = true },

                    // September 2025
                    new { Date = new DateTime(2025, 9, 3), EquipmentCode = "T6M16", StopType = "Dừng dài", Duration = 9.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 9, 6), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng ngắn", Duration = 4.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 9, 7), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 15.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 9, 8), EquipmentCode = "MF4-NICCO", StopType = "Dừng dài", Duration = 7.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 9, 9), EquipmentCode = "1N-611N-03", StopType = "Dừng ngắn", Duration = 1.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 9, 12), EquipmentCode = "1N-611N-03", StopType = "Dừng dài", Duration = 8.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 9, 14), EquipmentCode = "T6M16", StopType = "Dừng ngắn", Duration = 1.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 9, 16), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 38.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 9, 24), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 15.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 9, 27), EquipmentCode = "BK25-AT", StopType = "Dừng ngắn", Duration = 1.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 9, 29), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 12.00m, IsTechSupport = true },

                    // October 2025
                    new { Date = new DateTime(2025, 10, 1), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 6.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 10, 7), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng ngắn", Duration = 2.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 10, 7), EquipmentCode = "BK25-AT", StopType = "Dừng dài", Duration = 6.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 10, 7), EquipmentCode = "MF4-NICCO", StopType = "Dừng dài", Duration = 7.00m, IsTechSupport = false },
                    new { Date = new DateTime(2025, 10, 10), EquipmentCode = "T6M16", StopType = "Dừng dài", Duration = 9.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 10, 10), EquipmentCode = "BK25-AT", StopType = "Dừng dài", Duration = 47.00m, IsTechSupport = true },
                    new { Date = new DateTime(2025, 10, 20), EquipmentCode = "AKUMA-HoWa", StopType = "Dừng dài", Duration = 7.00m, IsTechSupport = false }
                };

                foreach (var incidentInfo in incidentData)
                {
                    if (equipmentCodeToIdMap.TryGetValue(incidentInfo.EquipmentCode, out var equipmentId) &&
                        equipmentCodeToLineIdMap.TryGetValue(incidentInfo.EquipmentCode, out var lineId) &&
                        stopTypeMap.TryGetValue(incidentInfo.StopType, out var stopTypeId))
                    {
                        var startTime = incidentInfo.Date.AddHours(random.Next(7, 22));
                        var endTime = startTime.AddMinutes((double)incidentInfo.Duration);

                        var assignedUser = technicianUsers[random.Next(technicianUsers.Count)];

                        incidents.Add(new IncidentHistory
                        {
                            EquipmentId = equipmentId,
                            LineId = lineId,
                            StartTime = startTime,
                            EndTime = endTime,
                            Duration = incidentInfo.Duration,
                            TypeId = stopTypeId,
                            Reason = GetRandomReason(incidentInfo.StopType, random),
                            Solution = GetRandomSolution(incidentInfo.StopType, random),
                            Issue = GetRandomIssue(incidentInfo.StopType, random),
                            Status = "Hoàn thành",
                            CreatedDate = endTime.AddMinutes(random.Next(5, 30)),
                            ReportedByUserId = null,
                            AssignedTo = assignedUser.Id,
                            IsTechSupport = incidentInfo.IsTechSupport
                        });
                    }
                }

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
                        TargetAmount = 120,
                        ResultAmount = 110,
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
                        TargetAmount = 100,
                        ResultAmount = 95,
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
                        TargetAmount = 90,
                        ResultAmount = 85,
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
                        TargetAmount = 100,
                        ResultAmount = 98,
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
                        TargetAmount = 120,
                        ResultAmount = 110,
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
                        TargetAmount = 130,
                        ResultAmount = 125,
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
                        TargetAmount = 100,
                        ResultAmount = 95,
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
                        TargetAmount = 100,
                        ResultAmount = 90,
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
                        TargetAmount = 120,
                        ResultAmount = 110,
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
                        TargetAmount = 150,
                        ResultAmount = 145,
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
                        TargetAmount = 140,
                        ResultAmount = 130,
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
                        TargetAmount = 120,
                        ResultAmount = 115,
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
                        TargetAmount = 100,
                        ResultAmount = 95,
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
                        TargetAmount = 110,
                        ResultAmount = 100,
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
                        TargetAmount = 120,
                        ResultAmount = 115,
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
                        TargetAmount = 100,
                        ResultAmount = 92,
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
                        TargetAmount = 80,
                        ResultAmount = 75,
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
                        TargetAmount = 130,
                        ResultAmount = 120,
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
                        TargetAmount = 110,
                        ResultAmount = 105,
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
                        TargetAmount = 120,
                        ResultAmount = 115,
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
                        TargetAmount = 100,
                        ResultAmount = 95,
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
                        TargetAmount = 120,
                        ResultAmount = 118,
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
                        TargetAmount = 110,
                        ResultAmount = 105,
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
                        TargetAmount = 130,
                        ResultAmount = 125,
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
                        TargetAmount = 115,
                        ResultAmount = 108,
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
                        TargetAmount = 120,
                        ResultAmount = 110,
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
                        TargetAmount = 150,
                        ResultAmount = 140,
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
                        TargetAmount = 90,
                        ResultAmount = 85,
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
                        TargetAmount = 100,
                        ResultAmount = 97,
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
                        TargetAmount = 120,
                        ResultAmount = 118,
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
                        TargetAmount = 130,
                        ResultAmount = 120,
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
                        TargetAmount = 140,
                        ResultAmount = 135,
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
                        TargetAmount = 120,
                        ResultAmount = 115,
                        OEE = 95.8m,
                        CreatedAt = new DateTime(2025, 10, 28, 14, 0, 0)
                    }
                };

                await context.ProductionOutputs.AddRangeAsync(productionOutputs);
            }
        }
        public static async Task SeedMaintenanceTemplates(FitskipDbContext context)
        {
            if (!await context.MaintenanceTemplates.AnyAsync())
            {
                var stages = await context.Stages.ToListAsync();

                var templates = new List<MaintenanceTemplate>();

                foreach (var stage in stages)
                {
                    var stageTemplates = new List<MaintenanceTemplate>();

                    switch (stage.StageName)
                    {
                        case "Chuẩn bị nguyên liệu":
                            stageTemplates.Add(new MaintenanceTemplate
                            {
                                StageId = stage.StageId,
                                TemplateName = "Bảo trì máy cắt nguyên liệu",
                                Description = "Template bảo trì định kỳ cho máy cắt nguyên liệu",
                                IsActive = true,
                                CreatedDate = DateTime.Now.AddMonths(-3),
                                UpdatedDate = DateTime.Now.AddMonths(-3)
                            });
                            break;

                        case "Gia công":
                            stageTemplates.AddRange(new List<MaintenanceTemplate>
                            {
                                new MaintenanceTemplate
                                {
                                    StageId = stage.StageId,
                                    TemplateName = "Bảo trì máy phay CNC",
                                    Description = "Bảo trì định kỳ máy phay CNC - kiểm tra hệ thống cơ khí và điện",
                                    IsActive = true,
                                    CreatedDate = DateTime.Now.AddMonths(-4),
                                    UpdatedDate = DateTime.Now.AddMonths(-4)
                                },
                                new MaintenanceTemplate
                                {
                                    StageId = stage.StageId,
                                    TemplateName = "Bảo trì máy tiện",
                                    Description = "Template bảo trì cho máy tiện - kiểm tra trục chính và hệ thống dao",
                                    IsActive = true,
                                    CreatedDate = DateTime.Now.AddMonths(-2),
                                    UpdatedDate = DateTime.Now.AddMonths(-2)
                                }
                            });
                            break;

                        case "Lắp ráp":
                            stageTemplates.Add(new MaintenanceTemplate
                            {
                                StageId = stage.StageId,
                                TemplateName = "Bảo trì máy lắp ráp tự động",
                                Description = "Kiểm tra và bảo trì hệ thống lắp ráp tự động",
                                IsActive = true,
                                CreatedDate = DateTime.Now.AddMonths(-2),
                                UpdatedDate = DateTime.Now.AddMonths(-2)
                            });
                            break;

                        case "Kiểm tra":
                        case "Kiểm tra sản phẩm":
                            stageTemplates.Add(new MaintenanceTemplate
                            {
                                StageId = stage.StageId,
                                TemplateName = "Bảo trì thiết bị kiểm tra chất lượng",
                                Description = "Template bảo trì và hiệu chuẩn thiết bị kiểm tra chất lượng",
                                IsActive = true,
                                CreatedDate = DateTime.Now.AddMonths(-1),
                                UpdatedDate = DateTime.Now.AddMonths(-1)
                            });
                            break;

                        case "Đóng gói":
                            stageTemplates.Add(new MaintenanceTemplate
                            {
                                StageId = stage.StageId,
                                TemplateName = "Bảo trì máy đóng gói tự động",
                                Description = "Bảo trì định kỳ hệ thống đóng gói tự động",
                                IsActive = true,
                                CreatedDate = DateTime.Now.AddMonths(-1),
                                UpdatedDate = DateTime.Now.AddMonths(-1)
                            });
                            break;

                        case "Dán nhãn":
                            stageTemplates.Add(new MaintenanceTemplate
                            {
                                StageId = stage.StageId,
                                TemplateName = "Bảo trì máy dán nhãn",
                                Description = "Template bảo trì cho máy dán nhãn tự động",
                                IsActive = true,
                                CreatedDate = DateTime.Now.AddMonths(-1),
                                UpdatedDate = DateTime.Now.AddMonths(-1)
                            });
                            break;
                    }

                    templates.AddRange(stageTemplates);
                }

                await context.MaintenanceTemplates.AddRangeAsync(templates);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedMaintenanceTemplateItems(FitskipDbContext context)
        {
            if (!await context.MaintenanceTemplateItems.AnyAsync())
            {
                var templates = await context.MaintenanceTemplates
                    .Include(t => t.Stage)
                    .ToListAsync();

                var templateItems = new List<MaintenanceTemplateItem>();

                foreach (var template in templates)
                {
                    var items = new List<MaintenanceTemplateItem>();

                    // Items chung cho tất cả máy móc
                    var commonItems = new List<(string StepName, string Category, string RequiredRole)>
                    {
                        ("Kiểm tra vệ sinh tổng thể máy móc", "General", "Both"),
                        ("Kiểm tra các biển báo an toàn", "General", "Both"),
                        ("Ghi chép vào sổ bảo trì", "General", "Both")
                    };

                    if (template.TemplateName.Contains("máy cắt nguyên liệu"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra lưỡi cắt", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Bôi trơn hệ thống truyền động", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Kiểm tra hệ thống điện động cơ", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra cảm biến an toàn", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra độ chính xác cắt", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("máy phay CNC"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra hệ thống trục chính", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Bôi trơn ray trượt", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Kiểm tra độ căng dây đai", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra hệ thống servo motor", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra bộ điều khiển CNC", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 6, StepName = "Kiểm tra hệ thống làm mát", Category = "General", RequiredRole = "Both" },
                            new MaintenanceTemplateItem { OrderIndex = 7, StepName = "Hiệu chuẩn độ chính xác máy", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("máy tiện"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra trục chính", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Kiểm tra hệ thống dao", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Bôi trơn ổ trục", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra động cơ chính", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra hệ thống điều khiển", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 6, StepName = "Kiểm tra độ đồng tâm", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("lắp ráp tự động"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra hệ thống khí nén", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Kiểm tra các xy lanh pneumatic", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Kiểm tra bộ cấp linh kiện", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra PLC và hệ thống điều khiển", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra các cảm biến định vị", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 6, StepName = "Kiểm tra băng tải", Category = "General", RequiredRole = "Both" },
                            new MaintenanceTemplateItem { OrderIndex = 7, StepName = "Test độ chính xác lắp ráp", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("kiểm tra chất lượng"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Hiệu chuẩn thiết bị đo", Category = "General", RequiredRole = "Both" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Kiểm tra hệ thống camera", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Kiểm tra phần mềm xử lý ảnh", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra hệ thống chiếu sáng", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Vệ sinh ống kính và cảm biến", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("đóng gói tự động"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra hệ thống gấp carton", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Kiểm tra hệ thống dán băng keo", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Bôi trơn các khớp nối", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra động cơ băng tải", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra cảm biến đếm sản phẩm", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 6, StepName = "Test tốc độ đóng gói", Category = "General", RequiredRole = "Both" }
                        });
                    }
                    else if (template.TemplateName.Contains("dán nhãn"))
                    {
                        items.AddRange(new List<MaintenanceTemplateItem>
                        {
                            new MaintenanceTemplateItem { OrderIndex = 1, StepName = "Kiểm tra hệ thống cấp nhãn", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 2, StepName = "Kiểm tra con lăn dán", Category = "Mechanical", RequiredRole = "Mechanical" },
                            new MaintenanceTemplateItem { OrderIndex = 3, StepName = "Kiểm tra cảm biến vị trí nhãn", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 4, StepName = "Kiểm tra bộ điều khiển", Category = "Electrical", RequiredRole = "Electrical" },
                            new MaintenanceTemplateItem { OrderIndex = 5, StepName = "Kiểm tra độ chính xác dán nhãn", Category = "General", RequiredRole = "Both" }
                        });
                    }

                    // Thêm items chung
                    int currentIndex = items.Count + 1;
                    foreach (var commonItem in commonItems)
                    {
                        items.Add(new MaintenanceTemplateItem
                        {
                            OrderIndex = currentIndex++,
                            StepName = commonItem.StepName,
                            Category = commonItem.Category,
                            RequiredRole = commonItem.RequiredRole
                        });
                    }

                    // Gán TemplateId cho từng item
                    foreach (var item in items)
                    {
                        item.TemplateId = template.TemplateId;
                    }

                    templateItems.AddRange(items);
                }

                await context.MaintenanceTemplateItems.AddRangeAsync(templateItems);
                await context.SaveChangesAsync();
            }
        }

        public static async Task SeedUserLines(FitskipDbContext context)
        {
            if (!await context.UserLines.AnyAsync())
            {
                var users = await context.Users.ToListAsync();
                var lines = await context.Lines.ToListAsync();

                var userLines = new List<UserLine>();

                // Vũ Tuấn Hoàng - Dập / uốn / cắt tôn (CK-C02)
                var hoangUser = users.FirstOrDefault(u => u.UserName == "TT002");
                var ckC02 = lines.FirstOrDefault(l => l.LineCode == "CK-C02");
                if (hoangUser != null && ckC02 != null)
                {
                    userLines.Add(new UserLine
                    {
                        UserId = hoangUser.Id,
                        LineId = ckC02.LineId,
                        CreatedAt = DateTime.Now
                    });
                }

                // Phạm Văn Sản xuất - Gia công tiện / khoan / phay (CK-C01)
                var phamUser = users.FirstOrDefault(u => u.UserName == "totruong.sanxuat");
                var ckC01 = lines.FirstOrDefault(l => l.LineCode == "CK-C01");
                if (phamUser != null && ckC01 != null)
                {
                    userLines.Add(new UserLine
                    {
                        UserId = phamUser.Id,
                        LineId = ckC01.LineId,
                        CreatedAt = DateTime.Now
                    });
                }

                await context.UserLines.AddRangeAsync(userLines);
                await context.SaveChangesAsync();
            }
        }

        public static async Task UpdateUserRole(FitskipDbContext context, string userId, string roleName)
        {
            var user = await context.Users.FindAsync(userId);
            if (user != null)
            {
                var role = await context.Roles.FirstOrDefaultAsync(r => r.NormalizedName == roleName.ToUpperInvariant());
                if (role != null)
                {
                    user.RoleId = role.Id;
                    await context.SaveChangesAsync();
                    Console.WriteLine($"✅ Đã cập nhật quyền '{roleName}' cho user {user.UserName} (ID: {userId})");
                }
                else
                {
                    Console.WriteLine($"❌ Không tìm thấy role '{roleName}'");
                }
            }
            else
            {
                Console.WriteLine($"❌ Không tìm thấy user với ID: {userId}");
            }
        }

        public static async Task SeedAllData(FitskipDbContext context)
        {
            await SeedRoles(context);
            await SeedDepartments(context);
            await SeedUsers(context);
            await SeedUserRoles(context);

            // Cập nhật quyền cho user cụ thể nếu cần
            await UpdateUserRole(context, "83820559-72da-4a1f-80bd-66867dc3d33c", "Quản lý kỹ thuật");

            await SeedStopTypes(context);
            await SeedLines(context);
            await SeedUserLines(context);
            await SeedStages(context);
            await SeedEquipment(context);
            await SeedShifts(context);
            await SeedSpareParts(context);
            await SeedIncidentHistories(context);
            await SeedProductionOutputs(context);
            await SeedMaintenanceTemplates(context);
            await SeedMaintenanceTemplateItems(context);
        }
    }
}