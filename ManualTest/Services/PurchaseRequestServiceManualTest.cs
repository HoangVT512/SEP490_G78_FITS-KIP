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

            switch (choice)
            {
                case "1":
                    await TestGetAllPurchaseRequestsAsync();
                    break;
                case "2":
                    await TestGetPurchaseRequestByIdAsync();
                    break;
                case "3":
                    await TestGetPurchaseRequestsByStatusAsync();
                    break;
                case "4":
                    await TestGetMyPurchaseRequestsAsync();
                    break;
                case "5":
                    await TestCreatePurchaseRequestAsync();
                    break;
                case "6":
                    await TestUpdatePurchaseRequestAsync();
                    break;
                case "7":
                    await TestDeletePurchaseRequestAsync();
                    break;
                case "8":
                    await TestApprovePurchaseRequestAsync();
                    break;
                case "9":
                    await TestRejectPurchaseRequestAsync();
                    break;
                case "0":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice. Please try again.");
                    break;
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

    private async Task TestGetAllPurchaseRequestsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetAllPurchaseRequestsAsync");
        Console.WriteLine("=========================================");

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_testData);

        // Execute
        Console.WriteLine("[STATUS] Executing GetAllPurchaseRequestsAsync...");
        var result = await _service.GetAllPurchaseRequestsAsync();

        // Verify
        Console.WriteLine($"[SUCCESS] Result: Found {result.Count} purchase requests");
        Console.WriteLine("\n[DATA] Purchase Request List:");
        Console.WriteLine("----------------------------------------");
        foreach (var request in result)
        {
            Console.WriteLine(FormatPurchaseRequest(request));
        }

        // Verify repository call
        _mockPurchaseRequestRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        Console.WriteLine("[VERIFY] Repository method called exactly once");
    }

    private async Task TestGetPurchaseRequestByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetPurchaseRequestByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Purchase Request ID to test: ");
        int.TryParse(Console.ReadLine(), out int id);
        
        var request = _testData.FirstOrDefault(r => r.RequestId == id);
        
        if (request == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }
        
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        Console.WriteLine($"[STATUS] Executing GetPurchaseRequestByIdAsync with ID: {id}...");
        
        try
        {
            var result = await _service.GetPurchaseRequestByIdAsync(id);
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Purchase Request found:");
                Console.WriteLine(FormatPurchaseRequest(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No purchase request found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetPurchaseRequestsByStatusAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetPurchaseRequestsByStatusAsync");
        Console.WriteLine("=========================================");

        Console.WriteLine("[INFO] Available statuses: Chờ duyệt, Đã duyệt, Từ chối");
        Console.Write("[INPUT] Enter Status to filter: ");
        var status = Console.ReadLine();

        var requestsByStatus = _testData.Where(r => r.Status == status).ToList();
        
        _mockPurchaseRequestRepository.Setup(x => x.GetByStatusAsync(status ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(requestsByStatus);

        try
        {
            Console.WriteLine($"[STATUS] Executing GetPurchaseRequestsByStatusAsync with Status: {status}...");
            var result = await _service.GetPurchaseRequestsByStatusAsync(status ?? "");
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} purchase requests with status '{status}':");
            Console.WriteLine("\n[DATA] Purchase Request List:");
            Console.WriteLine("----------------------------------------");
            foreach (var request in result)
            {
                Console.WriteLine(FormatPurchaseRequest(request));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetMyPurchaseRequestsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetMyPurchaseRequestsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID to get their requests: ");
        var userId = Console.ReadLine();

        var myRequests = _testData.Where(r => r.RequestedBy == userId).ToList();
        
        _mockPurchaseRequestRepository.Setup(x => x.GetByRequestedByAsync(userId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(myRequests);

        try
        {
            Console.WriteLine($"[STATUS] Executing GetMyPurchaseRequestsAsync with User ID: {userId}...");
            var result = await _service.GetMyPurchaseRequestsAsync(userId ?? "");
            
            Console.WriteLine($"[SUCCESS] Found {result.Count} purchase requests for user {userId}:");
            Console.WriteLine("\n[DATA] Purchase Request List:");
            Console.WriteLine("----------------------------------------");
            foreach (var request in result)
            {
                Console.WriteLine(FormatPurchaseRequest(request));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestCreatePurchaseRequestAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreatePurchaseRequestAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Part ID: ");
        int.TryParse(Console.ReadLine(), out int partId);
        
        Console.Write("[INPUT] Enter Quantity: ");
        int.TryParse(Console.ReadLine(), out int quantity);
        
        Console.Write("[INPUT] Enter Reason: ");
        var reason = Console.ReadLine();
        
        Console.Write("[INPUT] Enter User ID (Requester): ");
        var userId = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating request object...");
        var request = new CreatePurchaseRequestRequest
        {
            PartId = partId,
            Quantity = quantity,
            Reason = reason
        };
        Console.WriteLine($"[INPUT DATA] PartId: {request.PartId}, Quantity: {request.Quantity}, Reason: {request.Reason ?? "null"}");

        // Setup mock for user validation
        var user = _userTestData.FirstOrDefault(u => u.Id == userId);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Setup mock for duplicate check
        _mockPurchaseRequestRepository.Setup(x => x.GetByPartIdAndStatusAsync(partId, "Chờ duyệt", It.IsAny<CancellationToken>()))
            .ReturnsAsync((PurchaseRequest?)null);

        // Setup mock for managers
        var managers = _userTestData.Where(u => u.Role?.Name == "Quản lý").ToList();
        _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý", It.IsAny<CancellationToken>()))
            .ReturnsAsync(managers);

        var newRequest = new PurchaseRequest
        {
            RequestId = _testData.Max(r => r.RequestId) + 1,
            PartId = request.PartId,
            RequestedBy = userId ?? "",
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = "Chờ duyệt",
            Part = _sparePartTestData.FirstOrDefault(p => p.PartId == partId),
            RequestedByNavigation = user
        };

        _mockPurchaseRequestRepository.Setup(x => x.CreateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newRequest);

        try
        {
            Console.WriteLine("[STATUS] Executing CreatePurchaseRequestAsync...");
            var result = await _service.CreatePurchaseRequestAsync(request, userId ?? "");
            
            Console.WriteLine("[SUCCESS] Purchase Request created successfully:");
            Console.WriteLine(FormatPurchaseRequest(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestUpdatePurchaseRequestAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: UpdatePurchaseRequestAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Purchase Request ID to update: ");
        int.TryParse(Console.ReadLine(), out int id);

        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        
        if (existingRequest == null)
        {
            Console.WriteLine($"[NOT FOUND] Purchase request with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing purchase request:");
            Console.WriteLine(FormatPurchaseRequestEntity(existingRequest));
        }
        
        Console.Write("\n[INPUT] Enter new Part ID: ");
        int.TryParse(Console.ReadLine(), out int newPartId);
        
        Console.Write("[INPUT] Enter new Quantity: ");
        int.TryParse(Console.ReadLine(), out int newQuantity);
        
        Console.Write("[INPUT] Enter new Reason: ");
        var newReason = Console.ReadLine();
        
        Console.Write("[INPUT] Enter User ID (Requester): ");
        var userId = Console.ReadLine();

        Console.WriteLine("\n[INPUT] Creating update request...");
        var request = new UpdatePurchaseRequestRequest
        {
            PartId = newPartId,
            Quantity = newQuantity,
            Reason = newReason
        };
        Console.WriteLine($"[INPUT DATA] PartId: {request.PartId}, Quantity: {request.Quantity}, Reason: {request.Reason ?? "null"}");

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);

        var updatedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = request.PartId,
            RequestedBy = userId ?? "",
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = existingRequest?.Status ?? "Chờ duyệt",
            Part = _sparePartTestData.FirstOrDefault(p => p.PartId == newPartId),
            RequestedByNavigation = _userTestData.FirstOrDefault(u => u.Id == userId)
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedRequest);

        try
        {
            Console.WriteLine("[STATUS] Executing UpdatePurchaseRequestAsync...");
            var result = await _service.UpdatePurchaseRequestAsync(id, request, userId ?? "");
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Purchase Request updated successfully:");
                Console.WriteLine(FormatPurchaseRequest(result));
            }
            else
            {
                Console.WriteLine("[WARNING] Update returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeletePurchaseRequestAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeletePurchaseRequestAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Purchase Request ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        Console.Write("[INPUT] Enter User ID (Requester): ");
        var userId = Console.ReadLine();

        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        if (existingRequest != null)
        {
            Console.WriteLine($"[WARNING] Will delete: Part {existingRequest.Part?.PartName} (ID: {id})");
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Purchase request with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete purchase request with ID {id}? (y/n): ");
        var confirm = Console.ReadLine();
        
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockPurchaseRequestRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeletePurchaseRequestAsync...");
            var result = await _service.DeletePurchaseRequestAsync(id, userId ?? "");
            
            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Purchase request deleted successfully" : "Failed to delete purchase request")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestApprovePurchaseRequestAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: ApprovePurchaseRequestAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Purchase Request ID to approve: ");
        int.TryParse(Console.ReadLine(), out int id);

        Console.Write("[INPUT] Enter Manager ID: ");
        var managerId = Console.ReadLine();

        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        var manager = _userTestData.FirstOrDefault(u => u.Id == managerId);
        
        if (existingRequest == null)
        {
            Console.WriteLine($"[NOT FOUND] Purchase request with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing purchase request:");
            Console.WriteLine(FormatPurchaseRequestEntity(existingRequest));
            Console.WriteLine($"[CURRENT STATUS] Status: {existingRequest.Status}");
            Console.WriteLine($"[EXPECTED STATUS] Will change to: Đã duyệt");
        }

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(manager);

        var approvedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = existingRequest?.PartId ?? 0,
            RequestedBy = existingRequest?.RequestedBy ?? "",
            Quantity = existingRequest?.Quantity ?? 0,
            Reason = existingRequest?.Reason,
            Status = "Đã duyệt",
            ApprovedBy = managerId,
            ApprovedAt = DateTime.UtcNow,
            RejectedBy = null,
            RejectedAt = null,
            Part = existingRequest?.Part,
            RequestedByNavigation = existingRequest?.RequestedByNavigation,
            ApprovedByNavigation = manager
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(approvedRequest);

        try
        {
            Console.WriteLine("[STATUS] Executing ApprovePurchaseRequestAsync...");
            var result = await _service.ApprovePurchaseRequestAsync(id, managerId ?? "");
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Purchase Request approved successfully:");
                Console.WriteLine(FormatPurchaseRequest(result));
            }
            else
            {
                Console.WriteLine("[WARNING] Approval returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestRejectPurchaseRequestAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: RejectPurchaseRequestAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Purchase Request ID to reject: ");
        int.TryParse(Console.ReadLine(), out int id);

        Console.Write("[INPUT] Enter Manager ID: ");
        var managerId = Console.ReadLine();
        
        Console.Write("[INPUT] Enter Rejection Reason: ");
        var rejectionReason = Console.ReadLine();

        var existingRequest = _testData.FirstOrDefault(r => r.RequestId == id);
        var manager = _userTestData.FirstOrDefault(u => u.Id == managerId);
        
        if (existingRequest == null)
        {
            Console.WriteLine($"[NOT FOUND] Purchase request with ID {id} not found in test data");
        }
        else
        {
            Console.WriteLine($"[CURRENT DATA] Existing purchase request:");
            Console.WriteLine(FormatPurchaseRequestEntity(existingRequest));
            Console.WriteLine($"[CURRENT STATUS] Status: {existingRequest.Status}");
            Console.WriteLine($"[EXPECTED STATUS] Will change to: Từ chối");
        }

        // Setup mock
        _mockPurchaseRequestRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingRequest);
        _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId ?? "", It.IsAny<CancellationToken>()))
            .ReturnsAsync(manager);

        var rejectedRequest = new PurchaseRequest
        {
            RequestId = id,
            PartId = existingRequest?.PartId ?? 0,
            RequestedBy = existingRequest?.RequestedBy ?? "",
            Quantity = existingRequest?.Quantity ?? 0,
            Reason = rejectionReason,
            Status = "Từ chối",
            RejectedBy = managerId,
            RejectedAt = DateTime.UtcNow,
            ApprovedBy = null,
            ApprovedAt = null,
            Part = existingRequest?.Part,
            RequestedByNavigation = existingRequest?.RequestedByNavigation,
            RejectedByNavigation = manager
        };

        _mockPurchaseRequestRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(rejectedRequest);

        try
        {
            Console.WriteLine("[STATUS] Executing RejectPurchaseRequestAsync...");
            var result = await _service.RejectPurchaseRequestAsync(id, managerId ?? "", rejectionReason ?? "");
            
            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Purchase Request rejected successfully:");
                Console.WriteLine(FormatPurchaseRequest(result));
                Console.WriteLine($"[REJECTION REASON] {rejectionReason}");
            }
            else
            {
                Console.WriteLine("[WARNING] Rejection returned null");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
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
}
