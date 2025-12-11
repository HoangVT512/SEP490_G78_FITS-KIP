using NUnit.Framework;
using Moq;
using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using FITSKIP.Application.Tests.TestData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FITSKIP.Application.Tests.Services
{
    [TestFixture]
    public class PurchaseRequestServiceTests
    {
        private Mock<IPurchaseRequestRepository> _mockRepository;
        private Mock<IUserRepository> _mockUserRepository;
        private Mock<INotificationService> _mockNotificationService;
        private Mock<ISparePartRepository> _mockSparePartRepository;
        private PurchaseRequestService _service;

        private List<PurchaseRequest> _testRequests;
        private List<SparePart> _testSpareParts;
        private List<User> _testUsers;

        [SetUp]
        public void Setup()
        {
            // Initialize mocks
            _mockRepository = new Mock<IPurchaseRequestRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockNotificationService = new Mock<INotificationService>();
            _mockSparePartRepository = new Mock<ISparePartRepository>();

            // Load test data
            _testRequests = PurchaseRequestTestData.GetTestPurchaseRequests();
            _testSpareParts = ReplacementHistoryTestData.GetTestSpareParts();
            _testUsers = IncidentTestData.GetTestUsers();

            // Initialize service
            _service = new PurchaseRequestService(
                _mockRepository.Object,
                _mockUserRepository.Object,
                _mockNotificationService.Object,
                _mockSparePartRepository.Object
            );
        }

        #region CreatePurchaseRequestAsync Tests

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC01: Tạo yêu cầu mua hàng thành công với đầy đủ thông tin")]
        public async Task CreatePurchaseRequestAsync_ValidRequest_ShouldReturnCreatedRequest()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetValidCreateRequest();
            string userId = "TECH001";
            var part = _testSpareParts.First(p => p.PartId == request.PartId);
            var user = _testUsers.First(u => u.Id == userId);

            _mockSparePartRepository.Setup(x => x.ExistsAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<User> { _testUsers.First(u => u.Id == "ADMIN001") });

            _mockRepository.Setup(x => x.GetByPartIdAndStatusAsync(request.PartId, "Chờ duyệt", It.IsAny<CancellationToken>()))
                .ReturnsAsync(default(PurchaseRequest?));

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            _mockNotificationService.Setup(x => x.SendNotificationToGroupAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mockRepository.Setup(x => x.CreateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest pr, CancellationToken ct) =>
                {
                    pr.RequestId = 100;
                    pr.Status = "Chờ duyệt";
                    return pr;
                });

            // Act
            var result = await _service.CreatePurchaseRequestAsync(request, userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.RequestId, Is.EqualTo(100));
            Assert.That(result.PartId, Is.EqualTo(request.PartId));
            Assert.That(result.Quantity, Is.EqualTo(request.Quantity));
            Assert.That(result.Status, Is.EqualTo("Chờ duyệt"));

            _mockRepository.Verify(x => x.CreateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC02: Tạo yêu cầu với số lượng = 0 - Throw Exception")]
        public void CreatePurchaseRequestAsync_ZeroQuantity_ShouldThrowException()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetInvalidCreateRequest_ZeroQuantity();
            string userId = "TECH001";

            // Act & Assert
            var ex = Assert.ThrowsAsync<PurchaseRequestValidationException>(async () =>
                await _service.CreatePurchaseRequestAsync(request, userId));

            Assert.That(ex.ErrorCode, Is.EqualTo("PURCHASE_REQUEST_QUANTITY_INVALID"));
            Assert.That(ex.Message, Does.Contain("Số lượng phải lớn hơn 0"));
        }

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC03: Tạo yêu cầu với số lượng âm - Throw Exception")]
        public void CreatePurchaseRequestAsync_NegativeQuantity_ShouldThrowException()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetInvalidCreateRequest_NegativeQuantity();
            string userId = "TECH001";

            // Act & Assert
            var ex = Assert.ThrowsAsync<PurchaseRequestValidationException>(async () =>
                await _service.CreatePurchaseRequestAsync(request, userId));

            Assert.That(ex.ErrorCode, Is.EqualTo("PURCHASE_REQUEST_QUANTITY_INVALID"));
        }

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC04: Tạo yêu cầu với PartId không tồn tại - Throw Exception")]
        public void CreatePurchaseRequestAsync_PartNotFound_ShouldThrowException()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetInvalidCreateRequest_PartNotFound();
            string userId = "TECH001";

            _mockSparePartRepository.Setup(x => x.ExistsAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act & Assert
            var ex = Assert.ThrowsAsync<PurchaseRequestValidationException>(async () =>
                await _service.CreatePurchaseRequestAsync(request, userId));

            Assert.That(ex.ErrorCode, Is.EqualTo("SPARE_PART_NOT_FOUND"));
        }

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC05: Tạo yêu cầu trùng với yêu cầu đang chờ duyệt - Throw Exception")]
        public void CreatePurchaseRequestAsync_DuplicatePending_ShouldThrowException()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetInvalidCreateRequest_DuplicatePending();
            string userId = "TECH001";
            var part = _testSpareParts.First(p => p.PartId == request.PartId);
            var user = _testUsers.First(u => u.Id == userId);
            var existingPending = _testRequests.First(r => r.PartId == request.PartId && r.Status == "Chờ duyệt");

            _mockSparePartRepository.Setup(x => x.ExistsAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _mockRepository.Setup(x => x.GetByPartIdAndStatusAsync(request.PartId, "Chờ duyệt", It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingPending);

            // Act & Assert
            var ex = Assert.ThrowsAsync<PurchaseRequestValidationException>(async () =>
                await _service.CreatePurchaseRequestAsync(request, userId));

            Assert.That(ex.ErrorCode, Is.EqualTo("PURCHASE_REQUEST_DUPLICATE_PENDING"));
            Assert.That(ex.Message, Does.Contain("đã có yêu cầu đang chờ duyệt"));
        }

        [Test]
        [Category("CreatePurchaseRequest")]
        [Description("TC06: Tạo yêu cầu với Reason quá dài (>500 chars) - Throw Exception")]
        public void CreatePurchaseRequestAsync_LongReason_ShouldThrowException()
        {
            // Arrange
            var request = PurchaseRequestTestData.GetInvalidCreateRequest_LongReason();
            string userId = "TECH001";
            var part = _testSpareParts.First(p => p.PartId == request.PartId);
            var user = _testUsers.First(u => u.Id == userId);

            _mockSparePartRepository.Setup(x => x.ExistsAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _mockRepository.Setup(x => x.GetByPartIdAndStatusAsync(request.PartId, "Chờ duyệt", It.IsAny<CancellationToken>()))
                .ReturnsAsync(default(PurchaseRequest?));

            // Act & Assert
            var ex = Assert.ThrowsAsync<PurchaseRequestValidationException>(async () =>
                await _service.CreatePurchaseRequestAsync(request, userId));

            Assert.That(ex.ErrorCode, Is.EqualTo("PURCHASE_REQUEST_REASON_TOO_LONG"));
        }

        #endregion

        #region ApprovePurchaseRequestAsync Tests

        [Test]
        [Category("ApprovePurchaseRequest")]
        [Description("TC07: Duyệt yêu cầu thành công")]
        public async Task ApprovePurchaseRequestAsync_ValidRequest_ShouldReturnApprovedRequest()
        {
            // Arrange
            int requestId = 2;
            string managerId = "ADMIN001";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var manager = _testUsers.First(u => u.Id == managerId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest pr, CancellationToken ct) => pr);

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            // Act
            var result = await _service.ApprovePurchaseRequestAsync(requestId, managerId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Đã duyệt"));
            Assert.That(result.ApprovedBy, Is.EqualTo(managerId));

            _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()), Times.Once);
            _mockNotificationService.Verify(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Test]
        [Category("ApprovePurchaseRequest")]
        [Description("TC08: Duyệt yêu cầu không tồn tại - Return null")]
        public async Task ApprovePurchaseRequestAsync_NotFound_ShouldReturnNull()
        {
            // Arrange
            int requestId = 9999;
            string managerId = "ADMIN001";

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest?)null);

            // Act
            var result = await _service.ApprovePurchaseRequestAsync(requestId, managerId);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        [Category("ApprovePurchaseRequest")]
        [Description("TC09: Duyệt yêu cầu đã được duyệt trước đó - Throw Exception")]
        public void ApprovePurchaseRequestAsync_AlreadyApproved_ShouldThrowException()
        {
            // Arrange
            int requestId = 1; // Already approved
            string managerId = "ADMIN001";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var manager = _testUsers.First(u => u.Id == managerId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.ApprovePurchaseRequestAsync(requestId, managerId));

            Assert.That(ex.Message, Does.Contain("Không thể duyệt yêu cầu"));
        }

        #endregion

        #region RejectPurchaseRequestAsync Tests

        [Test]
        [Category("RejectPurchaseRequest")]
        [Description("TC10: Từ chối yêu cầu thành công")]
        public async Task RejectPurchaseRequestAsync_ValidRequest_ShouldReturnRejectedRequest()
        {
            // Arrange
            int requestId = 2;
            string managerId = "ADMIN002";
            string reason = "Không đủ ngân sách";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var manager = _testUsers.First(u => u.Id == managerId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest pr, CancellationToken ct) => pr);

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            // Act
            var result = await _service.RejectPurchaseRequestAsync(requestId, managerId, reason);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Từ chối"));
            Assert.That(result.RejectedBy, Is.EqualTo(managerId));
            Assert.That(result.Reason, Is.EqualTo(reason));

            _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("RejectPurchaseRequest")]
        [Description("TC11: Từ chối yêu cầu không tồn tại - Return null")]
        public async Task RejectPurchaseRequestAsync_NotFound_ShouldReturnNull()
        {
            // Arrange
            int requestId = 9999;
            string managerId = "ADMIN001";
            string reason = "Not found";

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest?)null);

            // Act
            var result = await _service.RejectPurchaseRequestAsync(requestId, managerId, reason);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        [Category("RejectPurchaseRequest")]
        [Description("TC12: Từ chối yêu cầu đã được duyệt - Throw Exception")]
        public void RejectPurchaseRequestAsync_AlreadyApproved_ShouldThrowException()
        {
            // Arrange
            int requestId = 1; // Already approved
            string managerId = "ADMIN001";
            string reason = "Cannot reject";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var manager = _testUsers.First(u => u.Id == managerId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(managerId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(manager);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.RejectPurchaseRequestAsync(requestId, managerId, reason));

            Assert.That(ex.Message, Does.Contain("Không thể từ chối yêu cầu"));
        }

        #endregion

        #region MarkAsReceivedAsync Tests

        [Test]
        [Category("MarkAsReceived")]
        [Description("TC13: Đánh dấu đã nhập kho thành công - Cập nhật số lượng spare part")]
        public async Task MarkAsReceivedAsync_ValidRequest_ShouldUpdateSparePartQuantity()
        {
            // Arrange
            int requestId = 1; // Approved request
            string userId = "WAREHOUSE001";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var user = _testUsers.First(u => u.Id == userId);
            var sparePart = _testSpareParts.First(p => p.PartId == existing.PartId);
            int originalQuantity = sparePart.Quantity;

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _mockSparePartRepository.Setup(x => x.GetByIdAsync(existing.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(sparePart);

            _mockSparePartRepository.Setup(x => x.UpdateAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest pr, CancellationToken ct) => pr);

            // Act
            var result = await _service.MarkAsReceivedAsync(requestId, userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Đã nhập"));

            // Verify spare part was updated
            _mockSparePartRepository.Verify(x => x.UpdateAsync(
                It.IsAny<SparePart>(), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("MarkAsReceived")]
        [Description("TC14: Đánh dấu đã nhập kho cho yêu cầu chưa duyệt - Throw Exception")]
        public void MarkAsReceivedAsync_NotApproved_ShouldThrowException()
        {
            // Arrange
            int requestId = 2; // Pending request
            string userId = "WAREHOUSE001";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var user = _testUsers.First(u => u.Id == userId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.MarkAsReceivedAsync(requestId, userId));

            Assert.That(ex.Message, Does.Contain("Chỉ có thể đánh dấu đã nhập kho cho yêu cầu đã được duyệt"));
        }

        [Test]
        [Category("MarkAsReceived")]
        [Description("TC15: Đánh dấu đã nhập kho - Cập nhật status spare part dựa trên số lượng")]
        public async Task MarkAsReceivedAsync_ShouldUpdateSparePartStatus()
        {
            // Arrange
            int requestId = 1;
            string userId = "WAREHOUSE001";
            var existing = _testRequests.First(r => r.RequestId == requestId);
            var user = _testUsers.First(u => u.Id == userId);
            var sparePart = _testSpareParts.First(p => p.PartId == existing.PartId);
            sparePart.Quantity = 5; // Low quantity
            sparePart.MinQuantity = 10;

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _mockSparePartRepository.Setup(x => x.GetByIdAsync(existing.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(sparePart);

            _mockSparePartRepository.Setup(x => x.UpdateAsync(It.IsAny<SparePart>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<PurchaseRequest>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PurchaseRequest pr, CancellationToken ct) => pr);

            // Act
            var result = await _service.MarkAsReceivedAsync(requestId, userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            
            // Verify spare part was updated
            _mockSparePartRepository.Verify(x => x.UpdateAsync(
                It.IsAny<SparePart>(), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        #endregion

        #region Query Methods Tests

        [Test]
        [Category("GetPurchaseRequest")]
        [Description("TC16: Lấy tất cả yêu cầu mua hàng")]
        public async Task GetAllPurchaseRequestsAsync_ShouldReturnAllRequests()
        {
            // Arrange
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testRequests);

            // Act
            var result = await _service.GetAllPurchaseRequestsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(_testRequests.Count));
        }

        [Test]
        [Category("GetPurchaseRequest")]
        [Description("TC17: Lấy yêu cầu theo Status")]
        public async Task GetPurchaseRequestsByStatusAsync_ValidStatus_ShouldReturnFilteredRequests()
        {
            // Arrange
            string status = "Chờ duyệt";
            var expected = _testRequests.Where(r => r.Status == status).ToList();

            _mockRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetPurchaseRequestsByStatusAsync(status);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(expected.Count));
            Assert.That(result.All(r => r.Status == status), Is.True);
        }

        [Test]
        [Category("GetPurchaseRequest")]
        [Description("TC18: Lấy yêu cầu của user")]
        public async Task GetMyPurchaseRequestsAsync_ValidUserId_ShouldReturnUserRequests()
        {
            // Arrange
            string userId = "TECH001";
            var expected = _testRequests.Where(r => r.RequestedBy == userId).ToList();

            _mockRepository.Setup(x => x.GetByRequestedByAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetMyPurchaseRequestsAsync(userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(expected.Count));
            Assert.That(result.All(r => r.RequestedBy == userId), Is.True);
        }

        #endregion

        #region DeletePurchaseRequestAsync Tests

        [Test]
        [Category("DeletePurchaseRequest")]
        [Description("TC19: Xóa yêu cầu thành công")]
        public async Task DeletePurchaseRequestAsync_ValidId_ShouldReturnTrue()
        {
            // Arrange
            int requestId = 2;
            string userId = "TECH002";
            var existing = _testRequests.First(r => r.RequestId == requestId);

            _mockRepository.Setup(x => x.GetByIdAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockRepository.Setup(x => x.DeleteAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeletePurchaseRequestAsync(requestId, userId);

            // Assert
            Assert.That(result, Is.True);
            _mockRepository.Verify(x => x.DeleteAsync(requestId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("DeletePurchaseRequest")]
        [Description("TC20: Xóa yêu cầu không tồn tại - Return false")]
        public async Task DeletePurchaseRequestAsync_NotFound_ShouldReturnFalse()
        {
            // Arrange
            int requestId = 9999;
            string userId = "TECH001";

            _mockRepository.Setup(x => x.DeleteAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _service.DeletePurchaseRequestAsync(requestId, userId);

            // Assert
            Assert.That(result, Is.False);
        }

        #endregion
    }
}
