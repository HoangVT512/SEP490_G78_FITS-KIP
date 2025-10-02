using FITSKIP.Application.Services;
using FITSKIP.Application.Tests.TestData;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.Services;

[TestFixture]
public class DepartmentServiceTests
{
    private Mock<IDepartmentRepository> _mockRepository;
    private DepartmentService _service;

    [SetUp]
    public void Setup()
    {
        _mockRepository = new Mock<IDepartmentRepository>();
        _service = new DepartmentService(_mockRepository.Object);
    }

    [Test]
    public async Task CreateAsync_WithValidRequest_ShouldReturnDepartmentDTO()
    {
        // Arrange
        var request = DepartmentTestData.Requests.ValidCreateRequest;
        var createdDepartment = DepartmentTestData.Entities.ProductionDepartment;

        _mockRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDepartment);

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(1));
        Assert.That(result.DepartmentName, Is.EqualTo(request.DepartmentName));
        Assert.That(result.ManagerId, Is.EqualTo(request.ManagerId));
        Assert.That(result.Description, Is.EqualTo(request.Description));
        Assert.That(result.IsActive, Is.True);
        Assert.That(result.ManagerName, Is.EqualTo("John Doe"));
    }

    [Test]
    public async Task CreateAsync_WithNullManagerId_ShouldCreateSuccessfully()
    {
        // Arrange
        var request = DepartmentTestData.Requests.CreateRequestWithoutManager;
        var createdDepartment = DepartmentTestData.Entities.DepartmentWithoutManager;

        _mockRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDepartment);

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(2));
        Assert.That(result.DepartmentName, Is.EqualTo(request.DepartmentName));
        Assert.That(result.ManagerId, Is.Null);
        Assert.That(result.ManagerName, Is.Null);
    }

    [Test]
    public async Task CreateAsync_WithNullDescription_ShouldCreateSuccessfully()
    {
        // Arrange
        var request = DepartmentTestData.Requests.CreateRequestWithoutDescription;
        var createdDepartment = DepartmentTestData.Entities.QualityAssuranceDepartment;

        _mockRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDepartment);

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(3));
        Assert.That(result.DepartmentName, Is.EqualTo(request.DepartmentName));
        Assert.That(result.Description, Is.Null);
    }

    [Test]
    public async Task CreateAsync_ShouldCallRepositoryCreateAsyncOnce()
    {
        // Arrange
        var request = DepartmentTestData.Requests.WarehouseCreateRequest;
        var createdDepartment = DepartmentTestData.Entities.WarehouseDepartment;

        _mockRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Department>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDepartment);

        // Act
        await _service.CreateAsync(request);

        // Assert
        _mockRepository.Verify(
            repo => repo.CreateAsync(
                It.Is<Department>(d => 
                    d.DepartmentName == request.DepartmentName &&
                    d.ManagerId == request.ManagerId &&
                    d.Description == request.Description
                ),
                It.IsAny<CancellationToken>()
            ),
            Times.Once
        );
    }

    [Test]
    public async Task CreateAsync_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var request = DepartmentTestData.Requests.MaintenanceCreateRequest;
        var createdDepartment = DepartmentTestData.Entities.MaintenanceDepartment;
        var cancellationToken = new CancellationToken();

        _mockRepository
            .Setup(repo => repo.CreateAsync(It.IsAny<Department>(), cancellationToken))
            .ReturnsAsync(createdDepartment);

        // Act
        await _service.CreateAsync(request, cancellationToken);

        // Assert
        _mockRepository.Verify(
            repo => repo.CreateAsync(It.IsAny<Department>(), cancellationToken),
            Times.Once
        );
    }
}

