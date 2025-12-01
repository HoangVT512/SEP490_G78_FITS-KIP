using NUnit.Framework;
using Moq;
using FITSKIP.Application.Services;
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
    public class ReplacementHistoryServiceTests
    {
        private Mock<IReplacementHistoryRepository> _mockRepository;
        private Mock<IEquipmentRepository> _mockEquipmentRepository;
        private Mock<IIncidentRepository> _mockIncidentRepository;
        private Mock<IMaintenanceWorkOrderRepository> _mockWorkOrderRepository;
        private Mock<ISparePartRepository> _mockSparePartRepository;
        private Mock<IUserRepository> _mockUserRepository;
        private ReplacementHistoryService _service;

        private List<ReplacementHistory> _testReplacements;
        private List<SparePart> _testSpareParts;
        private List<Equipment> _testEquipments;

        [SetUp]
        public void Setup()
        {
            // Initialize mocks
            _mockRepository = new Mock<IReplacementHistoryRepository>();
            _mockEquipmentRepository = new Mock<IEquipmentRepository>();
            _mockIncidentRepository = new Mock<IIncidentRepository>();
            _mockWorkOrderRepository = new Mock<IMaintenanceWorkOrderRepository>();
            _mockSparePartRepository = new Mock<ISparePartRepository>();
            _mockUserRepository = new Mock<IUserRepository>();

            // Load test data
            _testReplacements = ReplacementHistoryTestData.GetTestReplacementHistories();
            _testSpareParts = ReplacementHistoryTestData.GetTestSpareParts();
            _testEquipments = IncidentTestData.GetTestEquipments();

            // Initialize service
            _service = new ReplacementHistoryService(
                _mockRepository.Object,
                _mockEquipmentRepository.Object,
                _mockIncidentRepository.Object,
                _mockWorkOrderRepository.Object,
                _mockSparePartRepository.Object,
                _mockUserRepository.Object
            );
        }

        #region CreateAsync Tests

        [Test]
        [Category("CreateReplacement")]
        [Description("TC01: Tạo lịch sử thay thế thành công với đầy đủ thông tin hợp lệ")]
        public async Task CreateAsync_ValidRequest_ShouldReturnCreatedReplacement()
        {
            // Arrange
            var request = ReplacementHistoryTestData.GetValidCreateRequest();
            var part = _testSpareParts.First(p => p.PartId == request.PartId);

            _mockSparePartRepository.Setup(x => x.GetByIdAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(part);

            _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) =>
                {
                    rh.ReplacementId = 100;
                    return rh;
                });

            // Act
            var result = await _service.CreateAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ReplacementId, Is.EqualTo(100));
            Assert.That(result.PartId, Is.EqualTo(request.PartId));
            Assert.That(result.Quantity, Is.EqualTo(request.Quantity));
            Assert.That(result.Status, Is.EqualTo("Đã xuất"));

            _mockRepository.Verify(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("CreateReplacement")]
        [Description("TC02: Tạo lịch sử thay thế với WorkOrder thay vì Incident")]
        public async Task CreateAsync_WithWorkOrder_ShouldReturnCreatedReplacement()
        {
            // Arrange
            var request = ReplacementHistoryTestData.GetValidCreateRequest_WithWorkOrder();
            var part = _testSpareParts.First(p => p.PartId == request.PartId);

            _mockSparePartRepository.Setup(x => x.GetByIdAsync(request.PartId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(part);

            _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) =>
                {
                    rh.ReplacementId = 101;
                    return rh;
                });

            // Act
            var result = await _service.CreateAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.WorkOrderId, Is.EqualTo(request.WorkOrderId));
            Assert.That(result.IncidentId, Is.Null);
            Assert.That(result.Status, Is.EqualTo("Đã xuất"));
        }

        [Test]
        [Category("CreateReplacement")]
        [Description("TC03: Tạo lịch sử với số lượng âm - Throw Exception")]
        public void CreateAsync_NegativeQuantity_ShouldThrowException()
        {
            // Arrange
            var request = ReplacementHistoryTestData.GetInvalidCreateRequest_NegativeQuantity();

            // Act & Assert
            var ex = Assert.ThrowsAsync<ReplacementHistoryValidationException>(async () =>
                await _service.CreateAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("REPLACEMENT_HISTORY_QUANTITY_INVALID"));
            Assert.That(ex.Message, Does.Contain("Số lượng phải lớn hơn 0"));
        }

        [Test]
        [Category("CreateReplacement")]
        [Description("TC04: Tạo lịch sử với số lượng bằng 0 - Throw Exception")]
        public void CreateAsync_ZeroQuantity_ShouldThrowException()
        {
            // Arrange
            var request = ReplacementHistoryTestData.GetInvalidCreateRequest_ZeroQuantity();

            // Act & Assert
            var ex = Assert.ThrowsAsync<ReplacementHistoryValidationException>(async () =>
                await _service.CreateAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("REPLACEMENT_HISTORY_QUANTITY_INVALID"));
        }

        #endregion

        #region UpdateAsync Tests

        [Test]
        [Category("UpdateReplacement")]
        [Description("TC05: Cập nhật lịch sử thay thế thành công")]
        public async Task UpdateAsync_ValidRequest_ShouldReturnUpdatedReplacement()
        {
            // Arrange
            int replacementId = 2;
            var request = ReplacementHistoryTestData.GetValidUpdateRequest();
            var existing = _testReplacements.First(r => r.ReplacementId == replacementId);

            _mockRepository.Setup(x => x.ExistsAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) => rh);

            // Act
            var result = await _service.UpdateAsync(replacementId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ReplacementId, Is.EqualTo(replacementId));
            Assert.That(result.Quantity, Is.EqualTo(request.Quantity));

            _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("UpdateReplacement")]
        [Description("TC06: Cập nhật lịch sử không tồn tại - Throw Exception")]
        public void UpdateAsync_NotFound_ShouldThrowException()
        {
            // Arrange
            int replacementId = 9999;
            var request = ReplacementHistoryTestData.GetValidUpdateRequest();

            _mockRepository.Setup(x => x.ExistsAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ReplacementHistoryValidationException>(async () =>
                await _service.UpdateAsync(replacementId, request));

            Assert.That(ex.ErrorCode, Is.EqualTo("REPLACEMENT_HISTORY_NOT_FOUND"));
        }

        [Test]
        [Category("UpdateReplacement")]
        [Description("TC07: Cập nhật với số lượng âm - Throw Exception")]
        public void UpdateAsync_NegativeQuantity_ShouldThrowException()
        {
            // Arrange
            int replacementId = 2;
            var request = ReplacementHistoryTestData.GetInvalidCreateRequest_NegativeQuantity();
            request.ReplacementId = replacementId;

            _mockRepository.Setup(x => x.ExistsAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ReplacementHistoryValidationException>(async () =>
                await _service.UpdateAsync(replacementId, request));

            Assert.That(ex.ErrorCode, Is.EqualTo("REPLACEMENT_HISTORY_QUANTITY_INVALID"));
        }

        [Test]
        [Category("UpdateReplacement")]
        [Description("TC08: Cập nhật trả đủ số lượng - Status = Hoàn tất")]
        public async Task UpdateAsync_FullReturn_ShouldSetStatusToCompleted()
        {
            // Arrange
            int replacementId = 3;
            var request = ReplacementHistoryTestData.GetValidUpdateRequest_FullReturn();

            _mockRepository.Setup(x => x.ExistsAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) => rh);

            // Act
            var result = await _service.UpdateAsync(replacementId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.QuantityToReturn, Is.EqualTo(request.Quantity)); // All returned
            Assert.That(result.Status, Is.EqualTo("Hoàn tất"));
        }

        #endregion

        #region ConfirmReturnAsync Tests

        [Test]
        [Category("ConfirmReturn")]
        [Description("TC09: Xác nhận trả lại linh kiện thừa thành công")]
        public async Task ConfirmReturnAsync_ValidRequest_ShouldReturnConfirmedReplacement()
        {
            // Arrange
            int replacementId = 3;
            var existing = _testReplacements.First(r => r.ReplacementId == replacementId);
            var confirmDto = ReplacementHistoryTestData.GetValidReturnConfirmation();

            _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) => rh);

            // Act
            var result = await _service.ConfirmReturnAsync(replacementId, confirmDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ActualQuantityUsed, Is.EqualTo(confirmDto.ActualQuantityUsed));
            Assert.That(result.ReturnConfirmedBy, Is.EqualTo(confirmDto.ReturnConfirmedBy));
            Assert.That(result.QuantityToReturn, Is.GreaterThan(0)); // Should have quantity to return

            _mockRepository.Verify(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("ConfirmReturn")]
        [Description("TC10: Xác nhận trả lại với số lượng sử dụng đúng bằng số lượng xuất - Không trả lại")]
        public async Task ConfirmReturnAsync_FullUsage_ShouldHaveZeroReturn()
        {
            // Arrange
            int replacementId = 2;
            var existing = _testReplacements.First(r => r.ReplacementId == replacementId);
            var confirmDto = ReplacementHistoryTestData.GetValidReturnConfirmation_FullUsage();

            _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) => rh);

            // Act
            var result = await _service.ConfirmReturnAsync(replacementId, confirmDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ActualQuantityUsed, Is.EqualTo(existing.Quantity));
            Assert.That(result.QuantityToReturn, Is.EqualTo(null));
            Assert.That(result.Status, Is.EqualTo("Đã xuất")); // No return needed
        }

        [Test]
        [Category("ConfirmReturn")]
        [Description("TC11: Xác nhận trả lại cho replacement không tồn tại - Throw Exception")]
        public void ConfirmReturnAsync_NotFound_ShouldThrowException()
        {
            // Arrange
            int replacementId = 9999;
            var confirmDto = ReplacementHistoryTestData.GetValidReturnConfirmation();

            _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ReplacementHistoryValidationException>(async () =>
                await _service.ConfirmReturnAsync(replacementId, confirmDto));

            Assert.That(ex.ErrorCode, Is.EqualTo("REPLACEMENT_HISTORY_NOT_FOUND"));
        }

        [Test]
        [Category("ConfirmReturn")]
        [Description("TC12: Xác nhận trả lại một phần - Status = Đã trả một phần")]
        public async Task ConfirmReturnAsync_PartialReturn_ShouldSetStatusToPartialReturn()
        {
            // Arrange
            int replacementId = 3;
            var existing = _testReplacements.First(r => r.ReplacementId == replacementId);
            var confirmDto = ReplacementHistoryTestData.GetValidReturnConfirmation_PartialReturn();

            _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ReplacementHistory rh, CancellationToken ct) => rh);

            // Act
            var result = await _service.ConfirmReturnAsync(replacementId, confirmDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.QuantityToReturn, Is.GreaterThan(0));
            Assert.That(result.QuantityToReturn, Is.LessThan(existing.Quantity));
            Assert.That(result.Status, Is.EqualTo("Đã trả một phần"));
        }

        #endregion

        #region GetByIdAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC13: Lấy lịch sử thay thế theo ID thành công")]
        public async Task GetByIdAsync_ValidId_ShouldReturnReplacement()
        {
            // Arrange
            int replacementId = 1;
            var expected = _testReplacements.First(r => r.ReplacementId == replacementId);

            _mockRepository.Setup(x => x.GetByIdAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetByIdAsync(replacementId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ReplacementId, Is.EqualTo(replacementId));
            Assert.That(result.Status, Is.Not.Null); // Status should be recalculated
        }

        #endregion

        #region GetByEquipmentIdAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC14: Lấy danh sách lịch sử thay thế theo Equipment ID")]
        public async Task GetByEquipmentIdAsync_ValidId_ShouldReturnReplacements()
        {
            // Arrange
            int equipmentId = 1;
            var expected = _testReplacements.Where(r => r.EquipmentId == equipmentId).ToList();

            _mockRepository.Setup(x => x.GetByEquipmentIdAsync(equipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetByEquipmentIdAsync(equipmentId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(expected.Count));
            Assert.That(result.All(r => r.EquipmentId == equipmentId), Is.True);
        }

        #endregion

        #region GetByIncidentIdAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC15: Lấy danh sách lịch sử thay thế theo Incident ID")]
        public async Task GetByIncidentIdAsync_ValidId_ShouldReturnReplacements()
        {
            // Arrange
            int incidentId = 1;
            var expected = _testReplacements.Where(r => r.IncidentId == incidentId).ToList();

            _mockRepository.Setup(x => x.GetByIncidentIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetByIncidentIdAsync(incidentId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(expected.Count));
            Assert.That(result.All(r => r.IncidentId == incidentId), Is.True);
        }

        #endregion

        #region GetByStatusAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC16: Lấy danh sách lịch sử thay thế theo Status")]
        public async Task GetByStatusAsync_ValidStatus_ShouldReturnReplacements()
        {
            // Arrange
            string status = "Đã xuất";
            var expected = _testReplacements.Where(r => r.Status == status).ToList();

            _mockRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            // Act
            var result = await _service.GetByStatusAsync(status);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.All(r => r.Status == status), Is.True);
        }

        #endregion

        #region GetPendingReturnAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC17: Lấy danh sách lịch sử cần trả lại linh kiện")]
        public async Task GetPendingReturnAsync_ShouldReturnReplacementsWithReturnQuantity()
        {
            // Arrange
            var allReplacements = _testReplacements;
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(allReplacements);

            // Act
            var result = await _service.GetPendingReturnAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            // Should only return items with QuantityToReturn > 0 and not yet confirmed
            Assert.That(result.All(r => 
                r.ActualQuantityUsed.HasValue && 
                r.QuantityToReturn.HasValue && 
                r.QuantityToReturn > 0 &&
                string.IsNullOrEmpty(r.ReturnConfirmedBy)), Is.True);
        }

        #endregion

        #region DeleteAsync Tests

        [Test]
        [Category("DeleteReplacement")]
        [Description("TC18: Xóa lịch sử thay thế thành công")]
        public async Task DeleteAsync_ValidId_ShouldReturnTrue()
        {
            // Arrange
            int replacementId = 3;

            _mockRepository.Setup(x => x.DeleteAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _service.DeleteAsync(replacementId);

            // Assert
            Assert.That(result, Is.True);
            _mockRepository.Verify(x => x.DeleteAsync(replacementId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("DeleteReplacement")]
        [Description("TC19: Xóa lịch sử không tồn tại - Return false")]
        public async Task DeleteAsync_NotFound_ShouldReturnFalse()
        {
            // Arrange
            int replacementId = 9999;

            _mockRepository.Setup(x => x.DeleteAsync(replacementId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _service.DeleteAsync(replacementId);

            // Assert
            Assert.That(result, Is.False);
        }

        #endregion

        #region GetAllAsync Tests

        [Test]
        [Category("GetReplacement")]
        [Description("TC20: Lấy tất cả lịch sử thay thế - Recalculate status")]
        public async Task GetAllAsync_ShouldReturnAllWithRecalculatedStatus()
        {
            // Arrange
            _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testReplacements);

            // Act
            var result = await _service.GetAllAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(_testReplacements.Count));
            // All items should have recalculated status
            Assert.That(result.All(r => !string.IsNullOrEmpty(r.Status)), Is.True);
        }

        #endregion
    }
}
