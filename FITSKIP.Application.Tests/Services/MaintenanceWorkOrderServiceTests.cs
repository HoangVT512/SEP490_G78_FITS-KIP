using NUnit.Framework;
using Moq;
using FITSKIP.Application.Services;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Tests.TestData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FITSKIP.Application.Tests.Services
{
    [TestFixture]
    public class MaintenanceWorkOrderServiceTests
    {
        private Mock<IMaintenancePlanRepository> _mockPlanRepository;
        private Mock<IMaintenanceTemplateRepository> _mockTemplateRepository;
        private Mock<IMaintenanceWorkOrderRepository> _mockWorkOrderRepository;
        private Mock<IMaintenanceChecklistItemRepository> _mockChecklistRepository;
        private Mock<IEquipmentRepository> _mockEquipmentRepository;
        private Mock<IUserRepository> _mockUserRepository;
        private Mock<INotificationService> _mockNotificationService;
        private MaintenanceWorkOrderService _service;

        private List<MaintenanceWorkOrder> _testWorkOrders;
        private List<MaintenancePlan> _testPlans;
        private List<Equipment> _testEquipment;
        private List<User> _testUsers;
        private List<MaintenanceChecklistItem> _testChecklistItems;

        [SetUp]
        public void Setup()
        {
            // Initialize mocks
            _mockPlanRepository = new Mock<IMaintenancePlanRepository>();
            _mockTemplateRepository = new Mock<IMaintenanceTemplateRepository>();
            _mockWorkOrderRepository = new Mock<IMaintenanceWorkOrderRepository>();
            _mockChecklistRepository = new Mock<IMaintenanceChecklistItemRepository>();
            _mockEquipmentRepository = new Mock<IEquipmentRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockNotificationService = new Mock<INotificationService>();

            // Load test data
            _testWorkOrders = MaintenanceWorkOrderTestData.GetTestWorkOrders();
            _testPlans = new List<MaintenancePlan>
            {
                new MaintenancePlan
                {
                    PlanId = 1,
                    EquipmentId = 1,
                    IntervalType = "months",
                    IntervalValue = 1,
                    StartDate = DateTime.Now.AddMonths(-1),
                    NextDueDate = DateTime.Now.AddDays(5),
                    IsActive = true
                },
                new MaintenancePlan
                {
                    PlanId = 2,
                    EquipmentId = 2,
                    IntervalType = "months",
                    IntervalValue = 3,
                    StartDate = DateTime.Now.AddMonths(-3),
                    NextDueDate = DateTime.Now.AddDays(10),
                    IsActive = true
                }
            };
            _testEquipment = IncidentTestData.GetTestEquipments();
            _testUsers = IncidentTestData.GetTestUsers();
            _testChecklistItems = MaintenanceWorkOrderTestData.GetTestChecklistItems();

            // Initialize service
            _service = new MaintenanceWorkOrderService(
                _mockPlanRepository.Object,
                _mockTemplateRepository.Object,
                _mockWorkOrderRepository.Object,
                _mockChecklistRepository.Object,
                _mockEquipmentRepository.Object,
                _mockUserRepository.Object,
                _mockNotificationService.Object
            );
        }

        #region CreateWorkOrderAsync Tests

        [Test]
        [Category("CreateWorkOrder")]
        [Description("TC01: Tạo phiếu bảo trì thành công với đủ thông tin")]
        public async Task CreateWorkOrderAsync_ValidRequest_ShouldReturnCreatedWorkOrder()
        {
            // Arrange
            var request = MaintenanceWorkOrderTestData.GetValidCreateWorkOrderRequest();
            string userId = "ADMIN001";
            var plan = _testPlans.First(p => p.PlanId == request.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == plan.EquipmentId);
            var technician = _testUsers.First(u => u.Id == request.AssignedToElectrical);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(request.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(equipment.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(It.IsAny<string>(), default))
                .ReturnsAsync(technician);

            _mockWorkOrderRepository.Setup(x => x.GetByPlanIdAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<MaintenanceWorkOrder>());

            var createdWorkOrder = new MaintenanceWorkOrder
            {
                WorkOrderId = 100,
                WorkOrderCode = "WO100",
                PlanId = request.PlanId,
                Status = "Chờ xử lý",
                ScheduledDate = request.ScheduledDate,
                DueDate = request.ScheduledDate,
                AssignedToElectrical = request.AssignedToElectrical,
                AssignedToMechanical = request.AssignedToMechanical,
                CreatedDate = DateTime.Now
            };

            _mockWorkOrderRepository.Setup(x => x.CreateAsync(It.IsAny<MaintenanceWorkOrder>()))
                .ReturnsAsync(createdWorkOrder);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(100))
                .ReturnsAsync(createdWorkOrder);

            // Act
            var result = await _service.CreateWorkOrderAsync(request, userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.WorkOrderId, Is.EqualTo(100));
            Assert.That(result.Status, Is.EqualTo("Chờ xử lý"));
            Assert.That(result.AssignedToElectrical, Is.EqualTo(request.AssignedToElectrical));

            _mockWorkOrderRepository.Verify(x => x.CreateAsync(It.IsAny<MaintenanceWorkOrder>()), Times.Once);
        }

        [Test]
        [Category("CreateWorkOrder")]
        [Description("TC02: Tạo phiếu với ngày trong quá khứ - Throw Exception")]
        public void CreateWorkOrderAsync_PastScheduledDate_ShouldThrowException()
        {
            // Arrange
            var request = MaintenanceWorkOrderTestData.GetInvalidCreateWorkOrderRequest_PastDate();
            string userId = "ADMIN001";
            var plan = _testPlans.First(p => p.PlanId == request.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == plan.EquipmentId);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(request.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(equipment.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CreateWorkOrderAsync(request, userId));

            Assert.That(ex.Message, Does.Contain("Ngày bảo trì không được là ngày trong quá khứ"));
        }

        [Test]
        [Category("CreateWorkOrder")]
        [Description("TC03: Tạo phiếu không có kỹ thuật viên - Throw Exception")]
        public void CreateWorkOrderAsync_NoTechnicianAssigned_ShouldThrowException()
        {
            // Arrange
            var request = MaintenanceWorkOrderTestData.GetInvalidCreateWorkOrderRequest_NoTechnician();
            string userId = "ADMIN001";
            var plan = _testPlans.First(p => p.PlanId == request.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == plan.EquipmentId);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(request.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(equipment.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockWorkOrderRepository.Setup(x => x.GetByPlanIdAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<MaintenanceWorkOrder>());

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CreateWorkOrderAsync(request, userId));

            Assert.That(ex.Message, Does.Contain("Phải chọn ít nhất 1 kỹ thuật viên"));
        }

        [Test]
        [Category("CreateWorkOrder")]
        [Description("TC04: Tạo phiếu với PlanId không tồn tại - Throw Exception")]
        public void CreateWorkOrderAsync_PlanNotFound_ShouldThrowException()
        {
            // Arrange
            var request = MaintenanceWorkOrderTestData.GetValidCreateWorkOrderRequest();
            request.PlanId = 9999;
            string userId = "ADMIN001";

            _mockPlanRepository.Setup(x => x.GetByIdAsync(request.PlanId))
                .ReturnsAsync((MaintenancePlan?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CreateWorkOrderAsync(request, userId));

            Assert.That(ex.Message, Does.Contain("Không tìm thấy kế hoạch bảo trì"));
        }

        #endregion

        #region CompleteWorkOrderAsync Tests

        [Test]
        [Category("CompleteWorkOrder")]
        [Description("TC05: Hoàn thành phiếu bảo trì thành công")]
        public async Task CompleteWorkOrderAsync_ValidRequest_ShouldReturnCompletedWorkOrder()
        {
            // Arrange
            int workOrderId = 2;
            string technicianId = "TECH001";
            var request = MaintenanceWorkOrderTestData.GetValidCompleteWorkOrderRequest();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var checklistItems = _testChecklistItems.Where(ci => ci.WorkOrderId == workOrderId).ToList();

            // Set all checklist items as checked for completion
            foreach (var item in checklistItems)
            {
                item.IsChecked = true;
            }

            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == existingWorkOrder.EquipmentId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockChecklistRepository.Setup(x => x.GetByWorkOrderIdAsync(workOrderId))
                .ReturnsAsync(checklistItems);

            _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
    .ReturnsAsync(new List<User> { new User { Id = "QLKT001", UserName = "qlkt001" } });

            _mockWorkOrderRepository.Setup(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()))
                .Returns(Task.CompletedTask);

            var completedWorkOrder = new MaintenanceWorkOrder
            {
                WorkOrderId = workOrderId,
                WorkOrderCode = existingWorkOrder.WorkOrderCode,
                PlanId = existingWorkOrder.PlanId,
                Status = "Hoàn thành",
                CompletedDate = DateTime.Now,
                AssignedToElectrical = existingWorkOrder.AssignedToElectrical,
                AssignedToMechanical = existingWorkOrder.AssignedToMechanical,
                ScheduledDate = existingWorkOrder.ScheduledDate,
                DueDate = existingWorkOrder.DueDate,
                CreatedDate = existingWorkOrder.CreatedDate
            };

            _mockWorkOrderRepository.SetupSequence(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder)
                .ReturnsAsync(completedWorkOrder);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CompleteWorkOrderAsync(workOrderId, request, technicianId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoàn thành"));

            _mockWorkOrderRepository.Verify(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()), Times.AtLeastOnce);
        }

        [Test]
        [Category("CompleteWorkOrder")]
        [Description("TC06: Hoàn thành phiếu không được gán - Throw Exception")]
        public void CompleteWorkOrderAsync_NotAssignedTechnician_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 2;
            string technicianId = "TECH003"; // Not assigned to this work order
            var request = MaintenanceWorkOrderTestData.GetValidCompleteWorkOrderRequest();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CompleteWorkOrderAsync(workOrderId, request, technicianId));

            Assert.That(ex.Message, Does.Contain("You are not assigned to this work order"));
        }

        [Test]
        [Category("CompleteWorkOrder")]
        [Description("TC07: Hoàn thành phiếu khi còn checklist chưa làm - Không có validation, cho phép hoàn thành")]
        public async Task CompleteWorkOrderAsync_UncheckedItems_ShouldComplete()
        {
            // Arrange
            int workOrderId = 2;
            string technicianId = "TECH001";
            var request = MaintenanceWorkOrderTestData.GetValidCompleteWorkOrderRequest();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == existingWorkOrder.EquipmentId);
            var checklistItems = _testChecklistItems.Where(ci => ci.WorkOrderId == workOrderId).ToList();

            // Set all checklist items as checked for completion
            foreach (var item in checklistItems)
            {
                item.IsChecked = true;
            }

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockChecklistRepository.Setup(x => x.GetByWorkOrderIdAsync(workOrderId))
                .ReturnsAsync(checklistItems);

            _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<User> { new User { Id = "QLKT001", UserName = "qlkt001" } });

            _mockWorkOrderRepository.Setup(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()))
                .Returns(Task.CompletedTask);

            var completedWorkOrder = new MaintenanceWorkOrder
            {
                WorkOrderId = workOrderId,
                Status = "Hoàn thành",
                CompletedDate = DateTime.Now
            };

            _mockWorkOrderRepository.SetupSequence(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder)
                .ReturnsAsync(completedWorkOrder);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CompleteWorkOrderAsync(workOrderId, request, technicianId);

            // Assert - Should complete even with unchecked items
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoàn thành"));
        }

        #endregion

        #region PostponeWorkOrderAsync Tests

        [Test]
        [Category("PostponeWorkOrder")]
        [Description("TC08: Hoãn phiếu bảo trì thành công")]
        public async Task PostponeWorkOrderAsync_ValidRequest_ShouldReturnPostponedWorkOrder()
        {
            // Arrange
            int workOrderId = 3; // Overdue work order
            string userId = "ADMIN001";
            var request = new PostponeWorkOrderRequest
            {
                NewScheduledDate = DateTime.Now.AddDays(3), // Ngày trong khoảng hợp lệ
                Reason = "Equipment not available"
            };
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);
            var equipment = _testEquipment.First(e => e.EquipmentId == existingWorkOrder.EquipmentId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.EquipmentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockWorkOrderRepository.Setup(x => x.GetByPlanIdAsync(It.IsAny<int>()))
                .ReturnsAsync(_testWorkOrders.Where(wo => wo.PlanId == existingWorkOrder.PlanId).ToList());

            _mockChecklistRepository.Setup(x => x.GetByWorkOrderIdAsync(workOrderId))
                .ReturnsAsync(_testChecklistItems.Where(ci => ci.WorkOrderId == workOrderId).ToList());

            _mockUserRepository.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<User> { new User { Id = "QLKT001", UserName = "qlkt001" } });

            _mockWorkOrderRepository.Setup(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()))
                .Returns(Task.CompletedTask);

            var postponedWorkOrder = new MaintenanceWorkOrder
            {
                WorkOrderId = workOrderId,
                WorkOrderCode = existingWorkOrder.WorkOrderCode,
                PlanId = existingWorkOrder.PlanId,
                Status = "Hoãn",
                PostponedDate = DateTime.Now,
                PostponedDueDate = request.NewScheduledDate,
                ScheduledDate = request.NewScheduledDate,
                AssignedToElectrical = existingWorkOrder.AssignedToElectrical,
                AssignedToMechanical = existingWorkOrder.AssignedToMechanical,
                DueDate = existingWorkOrder.DueDate,
                CreatedDate = existingWorkOrder.CreatedDate,
                PostponedReason = request.Reason
            };

            _mockWorkOrderRepository.SetupSequence(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder)
                .ReturnsAsync(postponedWorkOrder);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.PostponeWorkOrderAsync(workOrderId, request, userId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoãn"));
            Assert.That(result.PostponedDueDate, Is.EqualTo(request.NewScheduledDate));

            _mockWorkOrderRepository.Verify(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()), Times.Once);
        }

        [Test]
        [Category("PostponeWorkOrder")]
        [Description("TC09: Hoãn phiếu với ngày trong quá khứ - Throw Exception")]
        public void PostponeWorkOrderAsync_PastDate_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 3;
            string userId = "ADMIN001";
            var request = MaintenanceWorkOrderTestData.GetInvalidPostponeWorkOrderRequest_PastDate();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.PostponeWorkOrderAsync(workOrderId, request, userId));

            Assert.That(ex.Message, Does.Contain("Ngày hoãn phải là ngày trong tương lai"));
        }

        [Test]
        [Category("PostponeWorkOrder")]
        [Description("TC10: Hoãn phiếu không có lý do - Throw Exception")]
        public void PostponeWorkOrderAsync_NoReason_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 3;
            string userId = "ADMIN001";
            var request = MaintenanceWorkOrderTestData.GetInvalidPostponeWorkOrderRequest_NoReason();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.PostponeWorkOrderAsync(workOrderId, request, userId));

            Assert.That(ex.Message, Does.Contain("Phải nhập lý do hoãn phiếu bảo trì"));
        }

        [Test]
        [Category("PostponeWorkOrder")]
        [Description("TC11: Hoãn phiếu đã hoàn thành - Throw Exception")]
        public void PostponeWorkOrderAsync_CompletedWorkOrder_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 4; // Completed work order
            string userId = "ADMIN001";
            var request = MaintenanceWorkOrderTestData.GetValidPostponeWorkOrderRequest();
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.PostponeWorkOrderAsync(workOrderId, request, userId));

            Assert.That(ex.Message, Does.Contain("Không thể hoãn phiếu bảo trì đã"));
        }

        #endregion

        #region CancelWorkOrderAsync Tests

        [Test]
        [Category("CancelWorkOrder")]
        [Description("TC12: Hủy phiếu bảo trì thành công")]
        public async Task CancelWorkOrderAsync_ValidRequest_ShouldReturnCancelledWorkOrder()
        {
            // Arrange
            int workOrderId = 1;
            string reason = "Equipment replaced";
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);
            var plan = _testPlans.First(p => p.PlanId == existingWorkOrder.PlanId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            _mockPlanRepository.Setup(x => x.GetByIdAsync(existingWorkOrder.PlanId))
                .ReturnsAsync(plan);

            _mockWorkOrderRepository.Setup(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()))
                .Returns(Task.CompletedTask);

            var cancelledWorkOrder = new MaintenanceWorkOrder
            {
                WorkOrderId = workOrderId,
                WorkOrderCode = existingWorkOrder.WorkOrderCode,
                PlanId = existingWorkOrder.PlanId,
                Status = "Đã hủy",
                Notes = reason,
                AssignedToElectrical = existingWorkOrder.AssignedToElectrical,
                AssignedToMechanical = existingWorkOrder.AssignedToMechanical,
                ScheduledDate = existingWorkOrder.ScheduledDate,
                DueDate = existingWorkOrder.DueDate,
                CreatedDate = existingWorkOrder.CreatedDate
            };

            _mockWorkOrderRepository.SetupSequence(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder)
                .ReturnsAsync(cancelledWorkOrder);

            _mockNotificationService.Setup(x => x.CreateNotificationAsync(It.IsAny<CreateNotificationRequest>()))
                .ReturnsAsync(new NotificationDTO());

            _mockNotificationService.Setup(x => x.SendNotificationToUserAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CancelWorkOrderAsync(workOrderId, reason);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Đã hủy"));

            _mockWorkOrderRepository.Verify(x => x.UpdateAsync(It.IsAny<MaintenanceWorkOrder>()), Times.AtLeastOnce);
        }

        [Test]
        [Category("CancelWorkOrder")]
        [Description("TC13: Hủy phiếu không có lý do - Throw Exception")]
        public void CancelWorkOrderAsync_NoReason_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 1;
            string reason = "";
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CancelWorkOrderAsync(workOrderId, reason));

            Assert.That(ex.Message, Does.Contain("Phải nhập lý do hủy phiếu bảo trì"));
        }

        [Test]
        [Category("CancelWorkOrder")]
        [Description("TC14: Hủy phiếu đã hoàn thành - Throw Exception")]
        public void CancelWorkOrderAsync_CompletedWorkOrder_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 4; // Completed work order
            string reason = "Test cancel";
            var existingWorkOrder = _testWorkOrders.First(wo => wo.WorkOrderId == workOrderId);

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync(existingWorkOrder);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CancelWorkOrderAsync(workOrderId, reason));

            Assert.That(ex.Message, Does.Contain("Không thể hủy phiếu bảo trì đã hoàn tất"));
        }

        [Test]
        [Category("CancelWorkOrder")]
        [Description("TC15: Hủy phiếu không tồn tại - Throw Exception")]
        public void CancelWorkOrderAsync_WorkOrderNotFound_ShouldThrowException()
        {
            // Arrange
            int workOrderId = 9999;
            string reason = "Test cancel";

            _mockWorkOrderRepository.Setup(x => x.GetByIdAsync(workOrderId))
                .ReturnsAsync((MaintenanceWorkOrder?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _service.CancelWorkOrderAsync(workOrderId, reason));

            Assert.That(ex.Message, Does.Contain("Work order not found"));
        }

        #endregion
    }
}
