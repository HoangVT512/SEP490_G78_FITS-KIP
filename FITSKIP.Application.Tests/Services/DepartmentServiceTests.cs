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

    #region GetByIdAsync Tests

    [Test]
    public async Task GetByIdAsync_WithValidId_ShouldReturnDepartmentDTO()
    {
        // Arrange
        var departmentId = 1;
        var department = DepartmentTestData.Entities.ProductionDepartment;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        // Act
        var result = await _service.GetByIdAsync(departmentId);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(department.DepartmentId));
        Assert.That(result.DepartmentName, Is.EqualTo(department.DepartmentName));
        Assert.That(result.ManagerId, Is.EqualTo(department.ManagerId));
        Assert.That(result.ManagerName, Is.EqualTo(department.Manager?.FullName));
        Assert.That(result.Description, Is.EqualTo(department.Description));
        Assert.That(result.IsActive, Is.EqualTo(department.IsActive));
    }

    [Test]
    public async Task GetByIdAsync_WithValidIdAndManager_ShouldReturnDepartmentWithManagerName()
    {
        // Arrange
        var departmentId = 1;
        var department = DepartmentTestData.Entities.ProductionDepartment;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        // Act
        var result = await _service.GetByIdAsync(departmentId);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.ManagerId, Is.EqualTo("MGR001"));
        Assert.That(result.ManagerName, Is.EqualTo("John Doe"));
    }

    [Test]
    public async Task GetByIdAsync_WithValidIdButNoManager_ShouldReturnDepartmentWithNullManagerName()
    {
        // Arrange
        var departmentId = 2;
        var department = DepartmentTestData.Entities.DepartmentWithoutManager;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        // Act
        var result = await _service.GetByIdAsync(departmentId);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(2));
        Assert.That(result.ManagerId, Is.Null);
        Assert.That(result.ManagerName, Is.Null);
    }

    [Test]
    public async Task GetByIdAsync_WithValidIdButNullDescription_ShouldReturnDepartmentWithNullDescription()
    {
        // Arrange
        var departmentId = 3;
        var department = DepartmentTestData.Entities.QualityAssuranceDepartment;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        // Act
        var result = await _service.GetByIdAsync(departmentId);

        // Assert
        Assert.IsNotNull(result);
        Assert.That(result.DepartmentId, Is.EqualTo(3));
        Assert.That(result.Description, Is.Null);
        Assert.That(result.DepartmentName, Is.EqualTo("Quality Assurance"));
    }

    [Test]
    public async Task GetByIdAsync_WithNonExistentId_ShouldReturnNull()
    {
        // Arrange
        var nonExistentId = 999;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        // Act
        var result = await _service.GetByIdAsync(nonExistentId);

        // Assert
        Assert.IsNull(result);
    }

    [Test]
    public async Task GetByIdAsync_WithZeroId_ShouldReturnNull()
    {
        // Arrange
        var invalidId = 0;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(invalidId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        // Act
        var result = await _service.GetByIdAsync(invalidId);

        // Assert
        Assert.IsNull(result);
    }

    [Test]
    public async Task GetByIdAsync_WithNegativeId_ShouldReturnNull()
    {
        // Arrange
        var negativeId = -1;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(negativeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Department?)null);

        // Act
        var result = await _service.GetByIdAsync(negativeId);

        // Assert
        Assert.IsNull(result);
    }

    [Test]
    public async Task GetByIdAsync_ShouldCallRepositoryOnce()
    {
        // Arrange
        var departmentId = 1;
        var department = DepartmentTestData.Entities.ProductionDepartment;

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        // Act
        await _service.GetByIdAsync(departmentId);

        // Assert
        _mockRepository.Verify(
            repo => repo.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Test]
    public async Task GetByIdAsync_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var departmentId = 1;
        var department = DepartmentTestData.Entities.ProductionDepartment;
        var cancellationToken = new CancellationToken();

        _mockRepository
            .Setup(repo => repo.GetByIdAsync(departmentId, cancellationToken))
            .ReturnsAsync(department);

        // Act
        await _service.GetByIdAsync(departmentId, cancellationToken);

        // Assert
        _mockRepository.Verify(
            repo => repo.GetByIdAsync(departmentId, cancellationToken),
            Times.Once);
    }

    #endregion

}

