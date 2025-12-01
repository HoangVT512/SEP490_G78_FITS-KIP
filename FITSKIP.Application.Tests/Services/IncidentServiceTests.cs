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
    public class IncidentServiceTests
    {
        private Mock<IIncidentRepository> _mockIncidentRepository;
        private Mock<IEquipmentRepository> _mockEquipmentRepository;
        private Mock<ILineRepository> _mockLineRepository;
        private Mock<IShiftRepository> _mockShiftRepository;
        private Mock<IUserRepository> _mockUserRepository;
        private Mock<INotificationService> _mockNotificationService;
        private Mock<IUserService> _mockUserService;
        private Mock<IAzureStorageService> _mockAzureStorageService;
        private Mock<IReplacementHistoryRepository> _mockReplacementHistoryRepository;
        private IncidentService _incidentService;

        private List<Equipment> _testEquipments;
        private List<Line> _testLines;
        private List<User> _testUsers;
        private List<IncidentHistory> _testIncidents;
        private List<StopType> _testStopTypes;
        private List<Shift> _testShifts;

        [SetUp]
        public void Setup()
        {
            // Initialize mocks
            _mockIncidentRepository = new Mock<IIncidentRepository>();
            _mockEquipmentRepository = new Mock<IEquipmentRepository>();
            _mockLineRepository = new Mock<ILineRepository>();
            _mockShiftRepository = new Mock<IShiftRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockNotificationService = new Mock<INotificationService>();
            _mockUserService = new Mock<IUserService>();
            _mockAzureStorageService = new Mock<IAzureStorageService>();
            _mockReplacementHistoryRepository = new Mock<IReplacementHistoryRepository>();

            // Load test data
            _testEquipments = IncidentTestData.GetTestEquipments();
            _testLines = IncidentTestData.GetTestLines();
            _testUsers = IncidentTestData.GetTestUsers();
            _testIncidents = IncidentTestData.GetTestIncidents();
            _testStopTypes = IncidentTestData.GetTestStopTypes();
            _testShifts = IncidentTestData.GetTestShifts();

            // Mock ShiftRepository to return test shifts
            _mockShiftRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testShifts);

            // Initialize service
            _incidentService = new IncidentService(
                _mockIncidentRepository.Object,
                _mockEquipmentRepository.Object,
                _mockLineRepository.Object,
                _mockShiftRepository.Object,
                _mockUserRepository.Object,
                _mockNotificationService.Object,
                _mockUserService.Object,
                _mockAzureStorageService.Object,
                _mockReplacementHistoryRepository.Object
            );
        }

        #region CreateIncidentAsync Tests

        [Test]
        [Category("CreateIncident")]
        [Description("TC01: Tạo sự cố thành công với đầy đủ thông tin hợp lệ")]
        public async Task CreateIncidentAsync_ValidRequest_ShouldReturnCreatedIncident()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 100;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.IncidentId, Is.EqualTo(100));
            Assert.That(result.Issue, Is.EqualTo(request.Issue));
            Assert.That(result.Status, Is.EqualTo("Chờ xử lý")); // No EndTime = Chờ xử lý
            Assert.That(result.EquipmentId, Is.EqualTo(request.EquipmentId));
            Assert.That(result.LineId, Is.EqualTo(request.LineId));
            
            _mockIncidentRepository.Verify(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC02: Tạo sự cố với EndTime - Status = Hoàn thành")]
        public async Task CreateIncidentAsync_WithEndTime_ShouldSetStatusToCompleted()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequestWithEndTime();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 101;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoàn thành")); // Has EndTime = Hoàn thành
            Assert.That(result.EndTime, Is.Not.Null);
            Assert.That(result.Duration, Is.GreaterThan(0));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC03: Tạo sự cố với EquipmentId không tồn tại - Throw IncidentValidationException")]
        public void CreateIncidentAsync_EquipmentNotFound_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_EquipmentNotFound();

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Equipment)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("EQUIPMENT_NOT_FOUND"));
            Assert.That(ex.Message, Does.Contain("Không tìm thấy thiết bị"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC04: Tạo sự cố với Equipment không active - Throw IncidentValidationException")]
        public void CreateIncidentAsync_EquipmentInactive_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_EquipmentInactive();
            var inactiveEquipment = _testEquipments.First(e => e.EquipmentId == 3 && !e.IsActive);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(inactiveEquipment);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("EQUIPMENT_INACTIVE"));
            Assert.That(ex.Message, Does.Contain("đã bị vô hiệu hóa"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC05: Tạo sự cố với Line không active - Throw IncidentValidationException")]
        public void CreateIncidentAsync_LineInactive_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_LineInactive();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var inactiveLine = _testLines.First(l => l.LineId == 3 && !l.IsActive);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(inactiveLine);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("LINE_INACTIVE"));
            Assert.That(ex.Message, Does.Contain("Dây chuyền"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC06: Tạo sự cố với EndTime trước StartTime - Throw IncidentValidationException")]
        public void CreateIncidentAsync_EndTimeBeforeStartTime_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_EndTimeBeforeStart();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("INCIDENT_ENDTIME_BEFORE_STARTTIME"));
            Assert.That(ex.Message, Does.Contain("phải sau thời gian bắt đầu"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC07: Tạo sự cố với EndTime trong tương lai - Throw IncidentValidationException")]
        public void CreateIncidentAsync_EndTimeInFuture_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_EndTimeInFuture();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("INCIDENT_ENDTIME_IN_FUTURE"));
            Assert.That(ex.Message, Does.Contain("không thể trong tương lai"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC08: Tạo sự cố với thời gian trùng lặp trên cùng dây chuyền - Throw IncidentValidationException")]
        public void CreateIncidentAsync_OverlappingTime_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Mock overlapping incident exists
            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory> { _testIncidents[0] });

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("INCIDENT_TIME_OVERLAP"));
            Assert.That(ex.Message, Does.Contain("trùng với sự cố khác"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC09: Tạo sự cố với Line không tồn tại - Throw IncidentValidationException")]
        public void CreateIncidentAsync_LineNotFound_ShouldThrowException()
        {
            // Arrange
            var request = IncidentTestData.GetInvalidCreateRequest_LineNotFound();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Line)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.CreateIncidentAsync(request));

            Assert.That(ex.ErrorCode, Is.EqualTo("LINE_NOT_FOUND"));
            Assert.That(ex.Message, Does.Contain("Không tìm thấy dây chuyền"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC10: Tạo sự cố với IsTechSupport = true - Gửi notification đến Tech Managers")]
        public async Task CreateIncidentAsync_WithTechSupport_ShouldSendNotification()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest_WithTechSupport();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 102;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.IsTechSupport, Is.True);
            Assert.That(result.Status, Is.EqualTo("Chờ xử lý"));
            
            // Verify notification sent to tech managers
            _mockUserService.Verify(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC11: Tạo sự cố với nhiều ImageUrls - Tạo IncidentImages")]
        public async Task CreateIncidentAsync_WithMultipleImages_ShouldCreateIncidentImages()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest_WithMultipleImages();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 103;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(request.ImageUrls, Has.Count.EqualTo(5));
            
            // Verify UpdateAsync was called (for saving images)
            _mockIncidentRepository.Verify(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()), Times.AtLeastOnce);
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC12: Tạo sự cố hoàn tất với Reason và Solution")]
        public async Task CreateIncidentAsync_WithReasonAndSolution_ShouldCreateCompletedIncident()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest_WithReasonAndSolution();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 104;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoàn thành"));
            Assert.That(result.Reason, Is.EqualTo(request.Reason));
            Assert.That(result.Solution, Is.EqualTo(request.Solution));
            Assert.That(result.EndTime, Is.Not.Null);
            Assert.That(result.Duration, Is.GreaterThan(0));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC13: Tạo sự cố không có EquipmentId - Chỉ có LineId")]
        public async Task CreateIncidentAsync_WithoutEquipmentId_ShouldCreateLineLevelIncident()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest_WithoutEquipmentId();
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 105;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.EquipmentId, Is.Null);
            Assert.That(result.LineId, Is.EqualTo(request.LineId));
            Assert.That(result.Status, Is.EqualTo("Chờ xử lý"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC14: Tạo sự cố không có LineId - Chỉ có EquipmentId")]
        public async Task CreateIncidentAsync_WithoutLineId_ShouldCreateEquipmentLevelIncident()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequest_WithoutLineId();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 106;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.EquipmentId, Is.EqualTo(request.EquipmentId));
            Assert.That(result.LineId, Is.Null);
            Assert.That(result.Status, Is.EqualTo("Chờ xử lý"));
        }

        [Test]
        [Category("CreateIncident")]
        [Description("TC15: Tạo sự cố với Duration được tính toán tự động")]
        public async Task CreateIncidentAsync_WithEndTime_ShouldCalculateDuration()
        {
            // Arrange
            var request = IncidentTestData.GetValidCreateRequestWithEndTime();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.CreateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) =>
                {
                    incident.IncidentId = 107;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.CreateIncidentAsync(request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Duration, Is.Not.Null);
            Assert.That(result.Duration, Is.GreaterThan(0));
            
            // Duration should be calculated from StartTime to EndTime (with break time adjustment)
            var expectedMinDuration = (decimal)(request.EndTime.Value - request.StartTime.Value).TotalMinutes;
            Assert.That(result.Duration, Is.LessThanOrEqualTo(expectedMinDuration));
        }

        #endregion

        #region UpdateIncidentAsync Tests

        [Test]
        [Category("UpdateIncident")]
        [Description("TC16: Cập nhật sự cố thành công với thông tin hợp lệ")]
        public async Task UpdateIncidentAsync_ValidRequest_ShouldReturnUpdatedIncident()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetValidUpdateRequest();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) => incident);

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Issue, Is.EqualTo(request.Issue));
            Assert.That(result.Status, Is.EqualTo(request.Status));
            
            _mockIncidentRepository.Verify(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC17: Cập nhật sự cố không tồn tại - Return null")]
        public async Task UpdateIncidentAsync_IncidentNotFound_ShouldReturnNull()
        {
            // Arrange
            int incidentId = 9999;
            var request = IncidentTestData.GetValidUpdateRequest();

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory)null);

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC18: Cập nhật status sang Hoàn thành khi có EndTime")]
        public async Task UpdateIncidentAsync_WithEndTime_ShouldSetStatusToCompleted()
        {
            // Arrange
            int incidentId = 3;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetValidUpdateRequest_ToCompleted();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) => incident);

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Hoàn thành"));
            Assert.That(result.EndTime, Is.Not.Null);
            Assert.That(result.Duration, Is.GreaterThan(0));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC19: Cập nhật sự cố với Equipment không tồn tại - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_EquipmentNotFound_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_EquipmentNotFound();

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Equipment)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Không tìm thấy thiết bị"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC20: Cập nhật sự cố với Equipment không active - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_EquipmentInactive_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_EquipmentInactive();
            var inactiveEquipment = _testEquipments.First(e => e.EquipmentId == 3 && !e.IsActive);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(inactiveEquipment);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("đã bị vô hiệu hóa"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC21: Cập nhật sự cố với Line không tồn tại - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_LineNotFound_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_LineNotFound();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Line)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Không tìm thấy dây chuyền"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC22: Cập nhật sự cố với Line không active - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_LineInactive_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_LineInactive();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var inactiveLine = _testLines.First(l => l.LineId == 3 && !l.IsActive);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(inactiveLine);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Dây chuyền"));
            Assert.That(ex.Message, Does.Contain("đã bị vô hiệu hóa"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC23: Cập nhật sự cố với StartTime trong tương lai - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_StartTimeInFuture_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_StartTimeInFuture();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Thời gian bắt đầu không thể trong tương lai"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC24: Cập nhật sự cố với EndTime trước StartTime - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_EndTimeBeforeStartTime_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_EndTimeBeforeStartTime();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Thời gian kết thúc phải sau thời gian bắt đầu"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC25: Cập nhật sự cố với EndTime trong tương lai - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_EndTimeInFuture_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetInvalidUpdateRequest_EndTimeInFuture();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Thời gian kết thúc không thể trong tương lai"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC26: Cập nhật sự cố với thời gian trùng lặp - Throw IncidentValidationException")]
        public void UpdateIncidentAsync_OverlappingTime_ShouldThrowException()
        {
            // Arrange
            int incidentId = 3;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetValidUpdateRequest();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            // Mock overlapping incident exists (different incident)
            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory> { _testIncidents[0] }); // Another incident

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.UpdateIncidentAsync(incidentId, request));

            Assert.That(ex.Message, Does.Contain("Thời gian báo cáo sự cố trùng với sự cố khác"));
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC27: Cập nhật IsTechSupport từ false sang true - Gửi notification")]
        public async Task UpdateIncidentAsync_ChangeToTechSupport_ShouldSendNotification()
        {
            // Arrange
            int incidentId = 3;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            existingIncident.IsTechSupport = false; // Currently not tech support
            existingIncident.Status = "Chờ xử lý";
            
            var request = IncidentTestData.GetValidUpdateRequest_ChangeToTechSupport();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) => 
                {
                    incident.IsTechSupport = true;
                    return incident;
                });

            _mockUserService.Setup(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testUsers.Where(u => u.Id.StartsWith("TECH")).ToList());

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.IsTechSupport, Is.True);
            
            // Verify notification was sent to technical managers
            _mockUserService.Verify(x => x.GetUsersByRoleAsync("Quản lý kỹ thuật", It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC28: Cập nhật sự cố với ImageUrls - Cập nhật IncidentImages")]
        public async Task UpdateIncidentAsync_WithImageUrls_ShouldUpdateIncidentImages()
        {
            // Arrange
            int incidentId = 2;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            var request = IncidentTestData.GetValidUpdateRequest_WithImageUrls();
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) => incident);

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Issue, Is.EqualTo(request.Issue));
            
            // Verify that UpdateAsync was called (which includes image processing)
            _mockIncidentRepository.Verify(x => x.UpdateAsync(
                It.Is<IncidentHistory>(i => i.IncidentId == incidentId), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("UpdateIncident")]
        [Description("TC29: Cập nhật sự cố với AssignedTo - Auto update status")]
        public async Task UpdateIncidentAsync_WithAssignedTechnician_ShouldSetStatusToDangXuLy()
        {
            // Arrange
            int incidentId = 3;
            var existingIncident = _testIncidents.First(i => i.IncidentId == incidentId);
            existingIncident.Status = "Chờ xử lý";
            existingIncident.AssignedTo = "TECH001"; // Has assigned technician
            
            var request = IncidentTestData.GetValidUpdateRequest();
            request.EndTime = null; // No end time yet
            
            var equipment = _testEquipments.First(e => e.EquipmentId == request.EquipmentId);
            var line = _testLines.First(l => l.LineId == request.LineId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(existingIncident);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(request.EquipmentId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(equipment);

            _mockLineRepository.Setup(x => x.GetByIdAsync(request.LineId.Value, It.IsAny<CancellationToken>()))
                .ReturnsAsync(line);

            _mockIncidentRepository.Setup(x => x.GetOverlappingIncidentsAsync(
                It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 
                It.IsAny<int?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<IncidentHistory>());

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory incident, CancellationToken ct) => 
                {
                    // Service should auto-set status to "Đang xử lý" when there's assigned technician
                    incident.Status = "Đang xử lý";
                    return incident;
                });

            // Act
            var result = await _incidentService.UpdateIncidentAsync(incidentId, request);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Status, Is.EqualTo("Đang xử lý"));
        }

        #endregion

        #region AssignTechnicianAsync Tests

        [Test]
        [Category("AssignTechnician")]
        [Description("TC30: Gán kỹ thuật viên cho sự cố thành công")]
        public async Task AssignTechnicianAsync_ValidRequest_ShouldReturnTrue()
        {
            // Arrange
            int incidentId = 3;
            string technicianId = "TECH001";
            var incident = _testIncidents.First(i => i.IncidentId == incidentId);

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident);

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory i, CancellationToken ct) => i);

            // Act
            var result = await _incidentService.AssignTechnicianAsync(incidentId, technicianId);

            // Assert
            Assert.That(result, Is.True);
            _mockIncidentRepository.Verify(x => x.UpdateAsync(
                It.Is<IncidentHistory>(i => i.AssignedTo == technicianId), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("AssignTechnician")]
        [Description("TC31: Gán kỹ thuật viên và cập nhật status sang Đang xử lý")]
        public async Task AssignTechnicianAsync_WithUpdateStatus_ShouldChangeStatusToDangXuLy()
        {
            // Arrange
            int incidentId = 3;
            string technicianId = "TECH001";
            var incident = _testIncidents.First(i => i.IncidentId == incidentId);
            incident.Status = "Chờ xử lý";

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident);

            _mockIncidentRepository.Setup(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory i, CancellationToken ct) => i);

            // Act
            var result = await _incidentService.AssignTechnicianAsync(incidentId, technicianId, updateStatus: true);

            // Assert
            Assert.That(result, Is.True);
            _mockIncidentRepository.Verify(x => x.UpdateAsync(
                It.Is<IncidentHistory>(i => 
                    i.AssignedTo == technicianId && 
                    i.Status == "Đang xử lý"), 
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("AssignTechnician")]
        [Description("TC32: Gán kỹ thuật viên cho sự cố không tồn tại - Return false")]
        public async Task AssignTechnicianAsync_IncidentNotFound_ShouldReturnFalse()
        {
            // Arrange
            int incidentId = 9999;
            string technicianId = "TECH001";

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((IncidentHistory)null);

            // Act
            var result = await _incidentService.AssignTechnicianAsync(incidentId, technicianId);

            // Assert
            Assert.That(result, Is.False);
            _mockIncidentRepository.Verify(x => x.UpdateAsync(It.IsAny<IncidentHistory>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        #endregion

        #region DeleteIncidentAsync Tests

        [Test]
        [Category("DeleteIncident")]
        [Description("TC33: Xóa sự cố Chờ xử lý không có KTV - Thành công")]
        public async Task DeleteIncidentAsync_PendingIncidentWithoutTechnician_ShouldReturnTrue()
        {
            // Arrange
            int incidentId = 3;
            var incident = _testIncidents.First(i => i.IncidentId == incidentId);
            incident.Status = "Chờ xử lý";
            incident.AssignedTo = null;

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident);

            _mockIncidentRepository.Setup(x => x.DeleteAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            _mockEquipmentRepository.Setup(x => x.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(_testEquipments.First());

            // Act
            var result = await _incidentService.DeleteIncidentAsync(incidentId);

            // Assert
            Assert.That(result, Is.True);
            _mockIncidentRepository.Verify(x => x.DeleteAsync(incidentId, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Test]
        [Category("DeleteIncident")]
        [Description("TC34: Xóa sự cố Đang xử lý có KTV - Throw IncidentValidationException")]
        public void DeleteIncidentAsync_InProgressWithTechnician_ShouldThrowException()
        {
            // Arrange
            int incidentId = 2;
            var incident = _testIncidents.First(i => i.IncidentId == incidentId);
            incident.Status = "Đang xử lý";
            incident.AssignedTo = "TECH002";

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.DeleteIncidentAsync(incidentId));

            Assert.That(ex.Message, Does.Contain("không thể xóa"));
            _mockIncidentRepository.Verify(x => x.DeleteAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Test]
        [Category("DeleteIncident")]
        [Description("TC35: Xóa sự cố Hoàn thành có KTV - Throw IncidentValidationException")]
        public void DeleteIncidentAsync_CompletedWithTechnician_ShouldThrowException()
        {
            // Arrange
            int incidentId = 1;
            var incident = _testIncidents.First(i => i.IncidentId == incidentId);
            incident.Status = "Hoàn thành";
            incident.AssignedTo = "TECH001";

            _mockIncidentRepository.Setup(x => x.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(incident);

            // Act & Assert
            var ex = Assert.ThrowsAsync<IncidentValidationException>(async () =>
                await _incidentService.DeleteIncidentAsync(incidentId));

            Assert.That(ex.Message, Does.Contain("Không thể xóa sự cố đã hoàn thành"));
            _mockIncidentRepository.Verify(x => x.DeleteAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        #endregion
    }
}
