//using FITSKIP.Application.Services;
//using FITSKIP.Application.Interfaces;
//using FITSKIP.Domain.DTO;
//using FITSKIP.Domain.Entities;
//using FITSKIP.Domain.Interfaces;
//using Moq;

//namespace FITSKIP.Application.Tests.ManualTests;

//public class ReplacementHistoryServiceManualTest
//{
//    private readonly Mock<IReplacementHistoryRepository> _mockRepository;
//    private readonly ReplacementHistoryService _service;
//    private readonly List<ReplacementHistory> _testReplacements;

//    public ReplacementHistoryServiceManualTest()
//    {
//        _mockRepository = new Mock<IReplacementHistoryRepository>();
//        _service = new ReplacementHistoryService(_mockRepository.Object);
//        _testReplacements = InitializeReplacementTestData();
//    }

//    public async Task RunTests()
//    {
//        while (true)
//        {
//            ShowMenu();
//            var choice = Console.ReadLine();

//            try
//            {
//                switch (choice)
//                {
//                    case "1":
//                        var result1 = await TestGetAllAsync();
//                        Console.WriteLine($"Found {result1.Count()} replacement histories");
//                        foreach (var replacement in result1)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "2":
//                        Console.Write("[INPUT] Enter Replacement ID: ");
//                        int.TryParse(Console.ReadLine(), out int id2);
//                        var result2 = await TestGetByIdAsync(id2);
//                        if (result2 != null)
//                            Console.WriteLine(FormatReplacement(result2));
//                        else
//                            Console.WriteLine("Replacement history not found");
//                        break;
//                    case "3":
//                        var replacement3 = new ReplacementHistory
//                        {
//                            EquipmentId = GetNullableIntInput("Equipment ID"),
//                            IncidentId = GetNullableIntInput("Incident ID"),
//                            PartId = GetIntInput("Part ID"),
//                            Quantity = GetIntInput("Quantity"),
//                            ReplacedBy = GetStringInput("Replaced By (User ID)"),
//                            Remarks = GetStringInput("Remarks")
//                        };
//                        var result3 = await TestCreateAsync(replacement3);
//                        Console.WriteLine(FormatReplacement(result3));
//                        break;
//                    case "4":
//                        var id4 = GetIntInput("Replacement ID to update");
//                        var replacement4 = new ReplacementHistory
//                        {
//                            Quantity = GetIntInput("Quantity"),
//                            Status = GetStringInput("Status"),
//                            Remarks = GetStringInput("Remarks")
//                        };
//                        var result4 = await TestUpdateAsync(id4, replacement4);
//                        if (result4 != null)
//                            Console.WriteLine(FormatReplacement(result4));
//                        break;
//                    case "5":
//                        var id5 = GetIntInput("Replacement ID to delete");
//                        var result5 = await TestDeleteAsync(id5);
//                        Console.WriteLine($"Delete result: {result5}");
//                        break;
//                    case "6":
//                        var equipmentId6 = GetIntInput("Equipment ID");
//                        var result6 = await TestGetByEquipmentIdAsync(equipmentId6);
//                        Console.WriteLine($"Found {result6.Count()} replacement histories");
//                        foreach (var replacement in result6)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "7":
//                        var incidentId7 = GetIntInput("Incident ID");
//                        var result7 = await TestGetByIncidentIdAsync(incidentId7);
//                        Console.WriteLine($"Found {result7.Count()} replacement histories");
//                        foreach (var replacement in result7)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "8":
//                        var partId8 = GetIntInput("Part ID");
//                        var result8 = await TestGetByPartIdAsync(partId8);
//                        Console.WriteLine($"Found {result8.Count()} replacement histories");
//                        foreach (var replacement in result8)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "9":
//                        Console.Write("[INPUT] Enter User ID: ");
//                        var userId9 = Console.ReadLine();
//                        var result9 = await TestGetByUserIdAsync(userId9 ?? "");
//                        Console.WriteLine($"Found {result9.Count()} replacement histories");
//                        foreach (var replacement in result9)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "10":
//                        var startDate10 = GetDateInput("Start Date");
//                        var endDate10 = GetDateInput("End Date");
//                        var result10 = await TestGetByDateRangeAsync(startDate10, endDate10);
//                        Console.WriteLine($"Found {result10.Count()} replacement histories");
//                        foreach (var replacement in result10)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "11":
//                        Console.Write("[INPUT] Enter Status: ");
//                        var status11 = Console.ReadLine();
//                        var result11 = await TestGetByStatusAsync(status11 ?? "");
//                        Console.WriteLine($"Found {result11.Count()} replacement histories");
//                        foreach (var replacement in result11)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                        }
//                        break;
//                    case "12":
//                        var id12 = GetIntInput("Replacement ID to confirm return");
//                        var confirmationDto12 = new ReturnConfirmationDto
//                        {
//                            ActualQuantityUsed = GetIntInput("Actual Quantity Used"),
//                            ReturnConfirmedBy = GetStringInput("Return Confirmed By"),
//                            ReturnRemarks = GetStringInput("Return Remarks")
//                        };
//                        var result12 = await TestConfirmReturnAsync(id12, confirmationDto12);
//                        if (result12 != null)
//                        {
//                            Console.WriteLine(FormatReplacement(result12));
//                            if (result12.QuantityToReturn.HasValue && result12.QuantityToReturn.Value > 0)
//                            {
//                                Console.WriteLine($"Quantity to return: {result12.QuantityToReturn.Value}");
//                            }
//                        }
//                        break;
//                    case "13":
//                        var result13 = await TestGetPendingReturnAsync();
//                        Console.WriteLine($"Found {result13.Count()} pending returns");
//                        foreach (var replacement in result13)
//                        {
//                            Console.WriteLine(FormatReplacement(replacement));
//                            Console.WriteLine($"  → Need to return: {replacement.QuantityToReturn} units");
//                        }
//                        break;
//                    case "0":
//                        Console.WriteLine("Goodbye!");
//                        return;
//                    default:
//                        Console.WriteLine("Invalid choice. Please try again.");
//                        break;
//                }
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"Error: {ex.Message}");
//            }

//            Console.WriteLine("\nPress any key to continue...");
//            Console.ReadKey();
//            Console.Clear();
//        }
//    }

//    private void ShowMenu()
//    {
//        Console.WriteLine("REPLACEMENT HISTORY SERVICE TEST MENU");
//        Console.WriteLine("=====================================");
//        Console.WriteLine("1. Test GetAllAsync");
//        Console.WriteLine("2. Test GetByIdAsync");
//        Console.WriteLine("3. Test CreateAsync");
//        Console.WriteLine("4. Test UpdateAsync");
//        Console.WriteLine("5. Test DeleteAsync");
//        Console.WriteLine("6. Test GetByEquipmentIdAsync");
//        Console.WriteLine("7. Test GetByIncidentIdAsync");
//        Console.WriteLine("8. Test GetByPartIdAsync");
//        Console.WriteLine("9. Test GetByUserIdAsync");
//        Console.WriteLine("10. Test GetByDateRangeAsync");
//        Console.WriteLine("11. Test GetByStatusAsync");
//        Console.WriteLine("12. Test ConfirmReturnAsync");
//        Console.WriteLine("13. Test GetPendingReturnAsync");
//        Console.WriteLine("0. Exit");
//        Console.WriteLine();
//        Console.Write("Enter your choice: ");
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetAllAsync()
//    {
//        // Setup mock
//        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
//            .ReturnsAsync(_testReplacements);

//        var result = await _service.GetAllAsync();

//        // Verify repository call
//        _mockRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);

//        return result;
//    }

//    private async Task<ReplacementHistory?> TestGetByIdAsync(int id)
//    {
//        var replacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);

//        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacement);

//        var result = await _service.GetByIdAsync(id);
//        return result;
//    }

//    private async Task<ReplacementHistory> TestCreateAsync(ReplacementHistory replacement)
//    {
//        // Setup mock
//        var newReplacement = new ReplacementHistory
//        {
//            ReplacementId = _testReplacements.Max(r => r.ReplacementId) + 1,
//            EquipmentId = replacement.EquipmentId,
//            IncidentId = replacement.IncidentId,
//            PartId = replacement.PartId,
//            Quantity = replacement.Quantity,
//            ReplacedDate = replacement.ReplacedDate,
//            ReplacedBy = replacement.ReplacedBy,
//            Status = replacement.Status,
//            Remarks = replacement.Remarks
//        };

//        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(newReplacement);

//        var result = await _service.CreateAsync(replacement);
//        return result;
//    }

//    private async Task<ReplacementHistory?> TestUpdateAsync(int id, ReplacementHistory replacement)
//    {
//        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);
//        if (existingReplacement == null) return null;

//        // Setup mock
//        _mockRepository.Setup(x => x.ExistsAsync(id, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(true);

//        var updatedReplacement = new ReplacementHistory
//        {
//            ReplacementId = id,
//            EquipmentId = replacement.EquipmentId,
//            IncidentId = replacement.IncidentId,
//            PartId = replacement.PartId,
//            Quantity = replacement.Quantity,
//            ReplacedDate = replacement.ReplacedDate,
//            ReplacedBy = replacement.ReplacedBy,
//            Status = replacement.Status,
//            Remarks = replacement.Remarks
//        };

//        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(updatedReplacement);

//        var result = await _service.UpdateAsync(id, replacement);
//        return result;
//    }

//    private async Task<bool> TestDeleteAsync(int id)
//    {
//        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);
//        if (existingReplacement == null) return false;

//        // Setup mock
//        _mockRepository.Setup(x => x.DeleteAsync(id, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(true);

//        var result = await _service.DeleteAsync(id);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByEquipmentIdAsync(int equipmentId)
//    {
//        var replacements = _testReplacements.Where(r => r.EquipmentId == equipmentId).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByEquipmentIdAsync(equipmentId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByEquipmentIdAsync(equipmentId);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByIncidentIdAsync(int incidentId)
//    {
//        var replacements = _testReplacements.Where(r => r.IncidentId == incidentId).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByIncidentIdAsync(incidentId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByIncidentIdAsync(incidentId);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByPartIdAsync(int partId)
//    {
//        var replacements = _testReplacements.Where(r => r.PartId == partId).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByPartIdAsync(partId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByPartIdAsync(partId);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByUserIdAsync(string userId)
//    {
//        var replacements = _testReplacements.Where(r => r.ReplacedBy == userId).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByUserIdAsync(userId);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByDateRangeAsync(DateTime startDate, DateTime endDate)
//    {
//        var replacements = _testReplacements.Where(r =>
//            r.ReplacedDate >= startDate && r.ReplacedDate <= endDate).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByDateRangeAsync(startDate, endDate, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByDateRangeAsync(startDate, endDate);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetByStatusAsync(string status)
//    {
//        var replacements = _testReplacements.Where(r => r.Status == status).ToList();

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByStatusAsync(status, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(replacements);

//        var result = await _service.GetByStatusAsync(status);
//        return result;
//    }

//    private async Task<ReplacementHistory?> TestConfirmReturnAsync(int id, ReturnConfirmationDto confirmationDto)
//    {
//        var existingReplacement = _testReplacements.FirstOrDefault(r => r.ReplacementId == id);
//        if (existingReplacement == null) return null;

//        // Setup mock
//        _mockRepository.Setup(x => x.GetByIdAsync(id, It.IsAny<CancellationToken>()))
//            .ReturnsAsync(existingReplacement);

//        var updatedReplacement = new ReplacementHistory
//        {
//            ReplacementId = existingReplacement.ReplacementId,
//            EquipmentId = existingReplacement.EquipmentId,
//            IncidentId = existingReplacement.IncidentId,
//            PartId = existingReplacement.PartId,
//            Quantity = existingReplacement.Quantity,
//            ReplacedDate = existingReplacement.ReplacedDate,
//            ReplacedBy = existingReplacement.ReplacedBy,
//            Status = "Hoàn thành",
//            Remarks = existingReplacement.Remarks,
//            ActualQuantityUsed = confirmationDto.ActualQuantityUsed,
//            QuantityToReturn = existingReplacement.Quantity - confirmationDto.ActualQuantityUsed > 0 ? existingReplacement.Quantity - confirmationDto.ActualQuantityUsed : null,
//            ReturnedDate = confirmationDto.ReturnedDate,
//            ReturnConfirmedBy = confirmationDto.ReturnConfirmedBy,
//            ReturnRemarks = confirmationDto.ReturnRemarks
//        };

//        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<ReplacementHistory>(), It.IsAny<CancellationToken>()))
//            .ReturnsAsync(updatedReplacement);

//        var result = await _service.ConfirmReturnAsync(id, confirmationDto);
//        return result;
//    }

//    private async Task<IEnumerable<ReplacementHistory>> TestGetPendingReturnAsync()
//    {
//        // Setup mock
//        _mockRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
//            .ReturnsAsync(_testReplacements);

//        var result = await _service.GetPendingReturnAsync();
//        return result;
//    }

//    private List<ReplacementHistory> InitializeReplacementTestData()
//    {
//        return new List<ReplacementHistory>
//        {
//            new ReplacementHistory
//            {
//                ReplacementId = 1,
//                EquipmentId = 1,
//                IncidentId = 1,
//                PartId = 1,
//                Quantity = 5,
//                ReplacedDate = DateTime.Now.AddDays(-10),
//                ReplacedBy = "user001",
//                Status = "Đã cấp phát",
//                Remarks = "Replacement for broken bearing",
//                ActualQuantityUsed = 3,
//                QuantityToReturn = 2
//            },
//            new ReplacementHistory
//            {
//                ReplacementId = 2,
//                EquipmentId = 2,
//                IncidentId = 2,
//                PartId = 2,
//                Quantity = 10,
//                ReplacedDate = DateTime.Now.AddDays(-5),
//                ReplacedBy = "user002",
//                Status = "Hoàn thành",
//                Remarks = "Belt replacement completed",
//                ActualQuantityUsed = 10,
//                QuantityToReturn = null,
//                ReturnedDate = DateTime.Now.AddDays(-4),
//                ReturnConfirmedBy = "warehouse001"
//            },
//            new ReplacementHistory
//            {
//                ReplacementId = 3,
//                EquipmentId = 1,
//                IncidentId = null,
//                PartId = 3,
//                Quantity = 2,
//                ReplacedDate = DateTime.Now.AddDays(-3),
//                ReplacedBy = "user001",
//                Status = "Chờ duyệt cấp phát",
//                Remarks = "Preventive maintenance"
//            },
//            new ReplacementHistory
//            {
//                ReplacementId = 4,
//                EquipmentId = 3,
//                IncidentId = 3,
//                PartId = 4,
//                Quantity = 15,
//                ReplacedDate = DateTime.Now.AddDays(-2),
//                ReplacedBy = "user003",
//                Status = "Đã cấp phát",
//                Remarks = "Oil filter replacement",
//                ActualQuantityUsed = 12,
//                QuantityToReturn = 3
//            },
//            new ReplacementHistory
//            {
//                ReplacementId = 5,
//                EquipmentId = 2,
//                IncidentId = 4,
//                PartId = 5,
//                Quantity = 1,
//                ReplacedDate = DateTime.Now.AddDays(-1),
//                ReplacedBy = "user002",
//                Status = "Hoàn thành",
//                Remarks = "Hydraulic cylinder replaced",
//                ActualQuantityUsed = 1,
//                QuantityToReturn = null,
//                ReturnedDate = DateTime.Now,
//                ReturnConfirmedBy = "warehouse001"
//            }
//        };
//    }

//    private string FormatReplacement(ReplacementHistory replacement)
//    {
//        if (replacement == null) return "[NULL]";

//        return $"{{ID:{replacement.ReplacementId}, EqID:{replacement.EquipmentId}, IncID:{replacement.IncidentId}, PartID:{replacement.PartId}, Qty:{replacement.Quantity}, Used:{replacement.ActualQuantityUsed}, ToReturn:{replacement.QuantityToReturn}, Status:\"{replacement.Status}\", By:\"{replacement.ReplacedBy}\", Date:{replacement.ReplacedDate:yyyy-MM-dd}}}";
//    }

//    private int GetIntInput(string prompt, int defaultValue = 0)
//    {
//        Console.Write($"[INPUT] {prompt}: ");
//        var input = Console.ReadLine();
//        return int.TryParse(input, out int result) ? result : defaultValue;
//    }

//    private DateTime GetDateInput(string prompt)
//    {
//        Console.Write($"[INPUT] {prompt} (yyyy-MM-dd): ");
//        var input = Console.ReadLine();
//        return DateTime.TryParse(input, out DateTime result) ? result : DateTime.Now;
//    }

//    private string GetStringInput(string prompt, string defaultValue = "")
//    {
//        Console.Write($"[INPUT] {prompt}: ");
//        var input = Console.ReadLine();
//        return string.IsNullOrWhiteSpace(input) ? defaultValue : input;
//    }

//    private int? GetNullableIntInput(string prompt)
//    {
//        Console.Write($"[INPUT] {prompt} (or press Enter for null): ");
//        var input = Console.ReadLine();
//        if (string.IsNullOrWhiteSpace(input)) return null;
//        return int.TryParse(input, out int result) ? result : null;
//    }
//}

