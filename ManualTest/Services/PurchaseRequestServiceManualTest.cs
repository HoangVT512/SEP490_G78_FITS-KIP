using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class PurchaseRequestServiceManualTest
{
    private readonly Mock<IPurchaseRequestRepository> _mockPurchaseRequestRepository;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<INotificationService> _mockNotificationService;
    private readonly Mock<ISparePartRepository> _mockSparePartRepository;
    private readonly PurchaseRequestService _service;
    private readonly List<PurchaseRequest> _testData;
    private readonly List<User> _userTestData;
    private readonly List<SparePart> _sparePartTestData;

    public PurchaseRequestServiceManualTest()
    {
        _mockPurchaseRequestRepository = new Mock<IPurchaseRequestRepository>();
        _mockUserRepository = new Mock<IUserRepository>();
        _mockNotificationService = new Mock<INotificationService>();
        _mockSparePartRepository = new Mock<ISparePartRepository>();
        _service = new PurchaseRequestService(
            _mockPurchaseRequestRepository.Object,
            _mockUserRepository.Object,
            _mockNotificationService.Object,
            _mockSparePartRepository.Object
        );
        _testData = InitializeTestData();
        _userTestData = InitializeUserTestData();
        _sparePartTestData = InitializeSparePartTestData();
    }

    public async Task RunTests()
    {
        while (true)
        {
            ShowMenu();
            var choice = Console.ReadLine();

            try
            {
                switch (choice)
                {
                    case "1":
                        var result1 = await TestGetAllPurchaseRequestsAsync();
                        Console.WriteLine($"Found {result1.Count} purchase requests");
                        foreach (var request in result1)
                        {
                            Console.WriteLine(FormatPurchaseRequest(request));
                        }
                        break;
                    case "2":
                        Console.Write("[INPUT] Enter Purchase Request ID: ");
                        int.TryParse(Console.ReadLine(), out int id2);
                        var result2 = await TestGetPurchaseRequestByIdAsync(id2);
                        if (result2 != null)
                            Console.WriteLine(FormatPurchaseRequest(result2));
                        else
                            Console.WriteLine("Purchase request not found");
                        break;
                    case "3":
                        Console.Write("[INPUT] Enter Status (Chờ duyệt, Đã duyệt, Từ chối): ");
                        var status3 = Console.ReadLine();
                        var result3 = await TestGetPurchaseRequestsByStatusAsync(status3 ?? "");
                        Console.WriteLine($"Found {result3.Count} purchase requests");
                        foreach (var request in result3)
                        {
                            Console.WriteLine(FormatPurchaseRequest(request));
                        }
                        break;
                    case "4":
                        Console.Write("[INPUT] Enter User ID: ");
                        var userId4 = Console.ReadLine();
                        var result4 = await TestGetMyPurchaseRequestsAsync(userId4 ?? "");
                        Console.WriteLine($"Found {result4.Count} purchase requests");
                        foreach (var request in result4)
                        {
                            Console.WriteLine(FormatPurchaseRequest(request));
                        }
                        break;
                    case "5":
                        var request5 = new CreatePurchaseRequestRequest
                        {
                            PartId = GetIntInput("Part ID"),
                            Quantity = GetIntInput("Quantity"),
                            Reason = GetStringInput("Reason")
                        };
                        Console.Write("[INPUT] Enter User ID (Requester): ");
                        var userId5 = Console.ReadLine();
                        var result5 = await TestCreatePurchaseRequestAsync(request5, userId5 ?? "");
                        if (result5 != null)
                            Console.WriteLine(FormatPurchaseRequest(result5));
                        break;
                    case "6":
                        var id6 = GetIntInput("Purchase Request ID to update");
                        var request6 = new UpdatePurchaseRequestRequest
                        {
                            PartId = GetIntInput("Part ID"),
                            Quantity = GetIntInput("Quantity"),
                            Reason = GetStringInput("Reason")
                        };
                        Console.Write("[INPUT] Enter User ID (Requester): ");
                        var userId6 = Console.ReadLine();
                        var result6 = await TestUpdatePurchaseRequestAsync(id6, request6, userId6 ?? "");
                        if (result6 != null)
                            Console.WriteLine(FormatPurchaseRequest(result6));
                        break;
                    case "7":
                        var id7 = GetIntInput("Purchase Request ID to delete");
                        Console.Write("[INPUT] Enter User ID (Requester): ");
                        var userId7 = Console.ReadLine();
                        var result7 = await TestDeletePurchaseRequestAsync(id7, userId7 ?? "");
                        Console.WriteLine($"Delete result: {result7}");
                        break;
                    case "8":
                        var id8 = GetIntInput("Purchase Request ID to approve");
                        Console.Write("[INPUT] Enter Manager ID: ");
                        var managerId8 = Console.ReadLine();
                        var result8 = await TestApprovePurchaseRequestAsync(id8, managerId8 ?? "");
                        if (result8 != null)
                            Console.WriteLine(FormatPurchaseRequest(result8));
                        break;
                    case "9":
                        var id9 = GetIntInput("Purchase Request ID to reject");
                        Console.Write("[INPUT] Enter Manager ID: ");
                        var managerId9 = Console.ReadLine();
                        Console.Write("[INPUT] Enter Rejection Reason: ");
                        var reason9 = Console.ReadLine();
                        var result9 = await TestRejectPurchaseRequestAsync(id9, managerId9 ?? "", reason9 ?? "");
                        if (result9 != null)
                        {
                            Console.WriteLine(FormatPurchaseRequest(result9));
                            Console.WriteLine($"Rejection reason: {reason9}");
                        }
                        break;
                    case "0":
                        Console.WriteLine("Goodbye!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice. Please try again.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("PURCHASE REQUEST SERVICE TEST MENU");
        Console.WriteLine("===================================");
        Console.WriteLine("1. Test GetAllPurchaseRequestsAsync");
        Console.WriteLine("2. Test GetPurchaseRequestByIdAsync ()");
        Console.WriteLine("3. Test GetPurchaseRequestsByStatusAsync ()");
        Console.WriteLine("4. Test GetMyPurchaseRequestsAsync ()");
        Console.WriteLine("5. Test CreatePurchaseRequestAsync ()");
        Console.WriteLine("6. Test UpdatePurchaseRequestAsync ()");
        Console.WriteLine("7. Test DeletePurchaseRequestAsync ()");
        Console.WriteLine("8. Test ApprovePurchaseRequestAsync ()");
        Console.WriteLine("9. Test RejectPurchaseRequestAsync ()");
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task<IReadOnlyList<PurchaseRequestDTO>> TestGetAllPurchaseRequestsAsync()
    {
        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        var result = await _service.GetAllPurchaseRequestsAsync();

        // Verify repository call
        _mockPurchaseRequestRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

        return result;
    }

    private async Task<PurchaseRequestDTO?> TestGetPurchaseRequestByIdAsync(int id)
    {
        var request = _testData.FirstOrDefault(r => r.RequestId == id);

        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _service.GetPurchaseRequestByIdAsync(id);
        return result;
    }

    private async Task<IReadOnlyList<PurchaseRequestDTO>> TestGetPurchaseRequestsByStatusAsync(string status)
    {
        var requestsByStatus = _testData.Where(r => r.Status == status).ToList();

        _mockPurchaseRequestRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requestsByStatus);

        var result = await _service.GetPurchaseRequestsByStatusAsync(status);
        return result;
    }

    private async Task<IReadOnlyList<PurchaseRequestDTO>> TestGetMyPurchaseRequestsAsync(string userId)
    {
        var myRequests = _testData.Where(r => r.RequestedBy == userId).ToList();

        _mockPurchaseRequestRepository.Setup(x => x.GetByRequestedByAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(myRequests);

        var result = await _service.GetMyPurchaseRequestsAsync(userId);
        return result;
    }

    private async Task<PurchaseRequestDTO?> TestCreatePurchaseRequestAsync(CreatePurchaseRequestRequest request, string userId)
    {
        // Setup mock for user validation
        var user = _userTestData.FirstOrDefault(u => u.Id == userId);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Setup mock for duplicate check
        _mockPurchaseRequestRepository.Setup(x => x.GetByPartIdAndStatusAsync(request.PartId, "Chờ duyệt", It.IsAny<CancellationToken>()))
            .ReturnsAsync((PurchaseRequest?)null);

        // Setup mock for managers
        var managers = _userTestData.Where(u => u.Role?.Name == "Quản lý").ToList();
        _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý", It.IsAny<CancellationToken>()))
            .ReturnsAsync(managers);

        var newRequest = new PurchaseRequest
        {
            RequestId = _testData.Max(r => r.RequestId) + 1,
            PartId = request.PartId,
            RequestedBy = userId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = "Chờ duyệt",
            Part = _sparePartTestData.FirstOrDefault(p => p.PartId == request.PartId),
            RequestedByNavigation = user
        };

        _mockPurchaseRequestRepository.Setup(x => x.CreateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newRequest);

        var result = await _service.CreatePurchaseRequestAsync(request, userId);
        return result;
    }

    private async Task<PurchaseRequestDTO?> TestUpdatePurchaseRequestAsync(int id, UpdatePurchaseRequestRequest request, string userId)
    {
        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        if (existingRequest == null) return null;

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);

        var updatedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = request.PartId,
            RequestedBy = userId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = existingRequest.Status,
            Part = _sparePartTestData.FirstOrDefault(p => p.PartId == request.PartId),
            RequestedByNavigation = _userTestData.FirstOrDefault(u => u.Id == userId)
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedRequest);

        var result = await _service.UpdatePurchaseRequestAsync(id, request, userId);
        return result;
    }

    private async Task<bool> TestDeletePurchaseRequestAsync(int id, string userId)
    {
        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        if (existingRequest == null) return false;

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockPurchaseRequestRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _service.DeletePurchaseRequestAsync(id, userId);
        return result;
    }

    private async Task<PurchaseRequestDTO?> TestApprovePurchaseRequestAsync(int id, string managerId)
    {
        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        var manager = _userTestData.FirstOrDefault(u => u.Id == managerId);
        if (existingRequest == null || manager == null) return null;

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(manager);

        var approvedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = existingRequest.PartId,
            RequestedBy = existingRequest.RequestedBy,
            Quantity = existingRequest.Quantity,
            Reason = existingRequest.Reason,
            Status = "Đã duyệt",
            ApprovedBy = managerId,
            ApprovedAt = DateTime.UtcNow,
            RejectedBy = null,
            RejectedAt = null,
            Part = existingRequest.Part,
            RequestedByNavigation = existingRequest.RequestedByNavigation,
            ApprovedByNavigation = manager
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(approvedRequest);

        var result = await _service.ApprovePurchaseRequestAsync(id, managerId);
        return result;
    }

    private async Task<PurchaseRequestDTO?> TestRejectPurchaseRequestAsync(int id, string managerId, string rejectionReason)
    {
        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        var manager = _userTestData.FirstOrDefault(u => u.Id == managerId);
        if (existingRequest == null || manager == null) return null;

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(manager);

        var rejectedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = existingRequest.PartId,
            RequestedBy = existingRequest.RequestedBy,
            Quantity = existingRequest.Quantity,
            Reason = rejectionReason,
            Status = "Từ chối",
            RejectedBy = managerId,
            RejectedAt = DateTime.UtcNow,
            ApprovedBy = null,
            ApprovedAt = null,
            Part = existingRequest.Part,
            RequestedByNavigation = existingRequest.RequestedByNavigation,
            RejectedByNavigation = manager
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(rejectedRequest);

        var result = await _service.RejectPurchaseRequestAsync(id, managerId, rejectionReason);
        return result;
    }

    private List<PurchaseRequest> InitializeTestData()
    {
        return new List<PurchaseRequest>
        {
            new PurchaseRequest
            {
                RequestId = 1,
                PartId = 1,
                RequestedBy = "USER001",
                Quantity = 10,
                Reason = "Cần thay thế linh kiện hỏng",
                Status = "Chờ duyệt",
                Part = new SparePart { PartId = 1, PartNumber = "SP001", PartName = "Motor Bearing", Quantity = 5, MinQuantity = 10 },
                RequestedByNavigation = new User { Id = "USER001", FullName = "Nguyễn Văn A", EmployeeCode = "EMP001" }
            },
            new PurchaseRequest
            {
                RequestId = 2,
                PartId = 2,
                RequestedBy = "USER002",
                Quantity = 5,
                Reason = "Dự trữ cho kế hoạch bảo trì",
                Status = "Đã duyệt",
                ApprovedBy = "MGR001",
                ApprovedAt = DateTime.UtcNow.AddDays(-1),
                Part = new SparePart { PartId = 2, PartNumber = "SP002", PartName = "Hydraulic Seal", Quantity = 2, MinQuantity = 5 },
                RequestedByNavigation = new User { Id = "USER002", FullName = "Trần Thị B", EmployeeCode = "EMP002" },
                ApprovedByNavigation = new User { Id = "MGR001", FullName = "Lê Văn C", EmployeeCode = "MGR001" }
            },
            new PurchaseRequest
            {
                RequestId = 3,
                PartId = 3,
                RequestedBy = "USER001",
                Quantity = 15,
                Reason = "Cần gấp cho sản xuất",
                Status = "Từ chối",
                RejectedBy = "MGR001",
                RejectedAt = DateTime.UtcNow.AddDays(-2),
                Part = new SparePart { PartId = 3, PartNumber = "SP003", PartName = "Conveyor Belt", Quantity = 1, MinQuantity = 3 },
                RequestedByNavigation = new User { Id = "USER001", FullName = "Nguyễn Văn A", EmployeeCode = "EMP001" },
                RejectedByNavigation = new User { Id = "MGR001", FullName = "Lê Văn C", EmployeeCode = "MGR001" }
            },
            new PurchaseRequest
            {
                RequestId = 4,
                PartId = 4,
                RequestedBy = "USER003",
                Quantity = 8,
                Reason = "Thay thế định kỳ",
                Status = "Chờ duyệt",
                Part = new SparePart { PartId = 4, PartNumber = "SP004", PartName = "Filter Element", Quantity = 3, MinQuantity = 8 },
                RequestedByNavigation = new User { Id = "USER003", FullName = "Phạm Văn D", EmployeeCode = "EMP003" }
            },
            new PurchaseRequest
            {
                RequestId = 5,
                PartId = 5,
                RequestedBy = "USER002",
                Quantity = 20,
                Reason = "Nâng cấp thiết bị",
                Status = "Đã duyệt",
                ApprovedBy = "MGR002",
                ApprovedAt = DateTime.UtcNow.AddHours(-5),
                Part = new SparePart { PartId = 5, PartNumber = "SP005", PartName = "Control Valve", Quantity = 0, MinQuantity = 5 },
                RequestedByNavigation = new User { Id = "USER002", FullName = "Trần Thị B", EmployeeCode = "EMP002" },
                ApprovedByNavigation = new User { Id = "MGR002", FullName = "Hoàng Thị E", EmployeeCode = "MGR002" }
            }
        };
    }

    private List<User> InitializeUserTestData()
    {
        return new List<User>
        {
            new User
            {
                Id = "USER001",
                FullName = "Nguyễn Văn A",
                EmployeeCode = "EMP001",
                IsActive = true,
                Role = new Microsoft.AspNetCore.Identity.IdentityRole { Name = "Nhân viên" }
            },
            new User
            {
                Id = "USER002",
                FullName = "Trần Thị B",
                EmployeeCode = "EMP002",
                IsActive = true,
                Role = new Microsoft.AspNetCore.Identity.IdentityRole { Name = "Nhân viên" }
            },
            new User
            {
                Id = "USER003",
                FullName = "Phạm Văn D",
                EmployeeCode = "EMP003",
                IsActive = true,
                Role = new Microsoft.AspNetCore.Identity.IdentityRole { Name = "Nhân viên" }
            },
            new User
            {
                Id = "MGR001",
                FullName = "Lê Văn C",
                EmployeeCode = "MGR001",
                IsActive = true,
                Role = new Microsoft.AspNetCore.Identity.IdentityRole { Name = "Quản lý" }
            },
            new User
            {
                Id = "MGR002",
                FullName = "Hoàng Thị E",
                EmployeeCode = "MGR002",
                IsActive = true,
                Role = new Microsoft.AspNetCore.Identity.IdentityRole { Name = "Quản lý" }
            }
        };
    }

    private List<SparePart> InitializeSparePartTestData()
    {
        return new List<SparePart>
        {
            new SparePart
            {
                PartId = 1,
                PartNumber = "SP001",
                PartName = "Motor Bearing",
                Quantity = 5,
                MinQuantity = 10,
                Location = "Kho A",
                Status = "Active",
                IsActive = true
            },
            new SparePart
            {
                PartId = 2,
                PartNumber = "SP002",
                PartName = "Hydraulic Seal",
                Quantity = 2,
                MinQuantity = 5,
                Location = "Kho B",
                Status = "Active",
                IsActive = true
            },
            new SparePart
            {
                PartId = 3,
                PartNumber = "SP003",
                PartName = "Conveyor Belt",
                Quantity = 1,
                MinQuantity = 3,
                Location = "Kho A",
                Status = "Active",
                IsActive = true
            },
            new SparePart
            {
                PartId = 4,
                PartNumber = "SP004",
                PartName = "Filter Element",
                Quantity = 3,
                MinQuantity = 8,
                Location = "Kho C",
                Status = "Active",
                IsActive = true
            },
            new SparePart
            {
                PartId = 5,
                PartNumber = "SP005",
                PartName = "Control Valve",
                Quantity = 0,
                MinQuantity = 5,
                Location = "Kho B",
                Status = "Active",
                IsActive = true
            }
        };
    }

    private string FormatPurchaseRequest(PurchaseRequestDTO request)
    {
        if (request == null) return "[NULL]";
        
        return $"{{{request.RequestId},{request.PartId},\"{request.PartNumber}\",\"{request.PartName}\",\"{request.RequestedBy}\",\"{request.RequestedByName}\",{request.Quantity},\"{(request.Reason ?? "null")}\",\"{(request.Status ?? "null")}\",\"{(request.ApprovedBy ?? "null")}\",\"{(request.ApprovedByName ?? "null")}\",\"{(request.RejectedBy ?? "null")}\",\"{(request.RejectedByName ?? "null")}\",{(request.ApprovedAt.HasValue ? $"new DateTime({request.ApprovedAt.Value.Year},{request.ApprovedAt.Value.Month},{request.ApprovedAt.Value.Day},{request.ApprovedAt.Value.Hour},{request.ApprovedAt.Value.Minute},{request.ApprovedAt.Value.Second})" : "null")},{(request.RejectedAt.HasValue ? $"new DateTime({request.RejectedAt.Value.Year},{request.RejectedAt.Value.Month},{request.RejectedAt.Value.Day},{request.RejectedAt.Value.Hour},{request.RejectedAt.Value.Minute},{request.RejectedAt.Value.Second})" : "null")}}}";
    }

    private string FormatPurchaseRequestEntity(PurchaseRequest request)
    {
        if (request == null) return "[NULL]";

        return $"{{{request.RequestId},{request.PartId},\"{(request.Part?.PartNumber ?? "null")}\",\"{(request.Part?.PartName ?? "null")}\",\"{request.RequestedBy}\",\"{(request.RequestedByNavigation?.FullName ?? "null")}\",{request.Quantity},\"{(request.Reason ?? "null")}\",\"{(request.Status ?? "null")}\",\"{(request.ApprovedBy ?? "null")}\",\"{(request.ApprovedByNavigation?.FullName ?? "null")}\",\"{(request.RejectedBy ?? "null")}\",\"{(request.RejectedByNavigation?.FullName ?? "null")}\",{(request.ApprovedAt.HasValue ? $"new DateTime({request.ApprovedAt.Value.Year},{request.ApprovedAt.Value.Month},{request.ApprovedAt.Value.Day},{request.ApprovedAt.Value.Hour},{request.ApprovedAt.Value.Minute},{request.ApprovedAt.Value.Second})" : "null")},{(request.RejectedAt.HasValue ? $"new DateTime({request.RejectedAt.Value.Year},{request.RejectedAt.Value.Month},{request.RejectedAt.Value.Day},{request.RejectedAt.Value.Hour},{request.RejectedAt.Value.Minute},{request.RejectedAt.Value.Second})" : "null")}}}";
    }

    private int GetIntInput(string prompt, int defaultValue = 0)
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return int.TryParse(input, out int result) ? result : defaultValue;
    }

    private string GetStringInput(string prompt, string defaultValue = "")
    {
        Console.Write($"[INPUT] {prompt}: ");
        var input = Console.ReadLine();
        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
    }
}
