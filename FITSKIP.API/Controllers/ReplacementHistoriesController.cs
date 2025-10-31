using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FITSKIP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReplacementHistoriesController : ControllerBase
    {
        private readonly IReplacementHistoryService _service;
        private readonly FitskipDbContext _context;

        public ReplacementHistoriesController(
            IReplacementHistoryService service,
            FitskipDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetAll(CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetAllAsync(cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    EquipmentID = s.EquipmentId,
                    IncidentId = s.IncidentId,
                    PartID = s.PartId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedBy = s.ReplacedBy,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ReplacedDate = s.ReplacedDate,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReplacementHistoryDTO>> GetById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByIdAsync(id, cancellationToken);
                if (result == null)
                    return NotFound(new { message = $"Replacement History với ID {id} không tồn tại" });
                var response = new ReplacementHistoryDTO
                {
                    EquipmentID = result.EquipmentId,
                    IncidentId = result.IncidentId,
                    PartID = result.PartId,
                    PartName = result.Part != null ? result.Part.PartName : null,
                    PartNumber = result.Part != null ? result.Part.PartNumber : null,
                    EquipmentName = result.Equipment != null ? result.Equipment.EquipmentName : null,
                    EquipmentCode = result.Equipment != null ? result.Equipment.EquipmentCode : null,
                    ReplacedBy = result.ReplacedBy,
                    ReplacedByUserName = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.Email : null,
                    ReplacementID = result.ReplacementId,
                    Quantity = result.Quantity,
                    ActualQuantityUsed = result.ActualQuantityUsed,
                    QuantityToReturn = result.QuantityToReturn,
                    ReplacedDate = result.ReplacedDate,
                    ReturnedDate = result.ReturnedDate,
                    ReturnRemarks = result.ReturnRemarks,
                    Status = result.Status,
                    Remarks = result.Remarks
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ReplacementHistoryDTO>> Create([FromBody] CreateReplacementHistoryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Mapping DTO to Entity
                var replacementHistory = new ReplacementHistory
                {
                    PartId = request.PartId,
                    EquipmentId = request.EquipmentId,
                    IncidentId = request.IncidentId, // Add IncidentId mapping
                    Quantity = request.Quantity,
                    ReplacedDate = request.ReplacedDate,
                    ReplacedBy = request.ReplacedBy,
                    Status = request.Status,
                    Remarks = request.Remarks,

                };
                if (request.Quantity <= 0)
                {
                    return BadRequest(new { message = "Số lượng phụ tùng phải lớn hơn 0" });
                }

                var created = await _service.CreateAsync(replacementHistory, cancellationToken);

                // Mapping Entity to DTO
                var response = new ReplacementHistoryDTO
                {
                    EquipmentID = created.EquipmentId,
                    IncidentId = created.IncidentId, // Add IncidentId mapping
                    PartID = created.PartId,
                    PartName = created.Part != null ? created.Part.PartName : null,
                    PartNumber = created.Part != null ? created.Part.PartNumber : null,
                    EquipmentName = created.Equipment != null ? created.Equipment.EquipmentName : null,
                    EquipmentCode = created.Equipment != null ? created.Equipment.EquipmentCode : null,
                    ReplacedBy = created.ReplacedBy,
                    ReplacedByUserName = created.ReplacedByNavigation != null ? created.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = created.ReplacedByNavigation != null ? created.ReplacedByNavigation.Email : null,
                    ReplacementID = created.ReplacementId,
                    Quantity = created.Quantity,
                    ReplacedDate = created.ReplacedDate,
                    Status = created.Status,
                    Remarks = created.Remarks
                };

                return Created();
            }
            catch (KeyNotFoundException ex)
            {
                // Return BadRequest so client sees a readable validation error
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReplacementHistoryDTO>> Update(int id, [FromBody] UpdateReplacementHistoryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Mapping DTO to Entity
                var replacementHistory = new ReplacementHistory
                {
                    PartId = request.PartId,
                    EquipmentId = request.EquipmentId,
                    IncidentId = request.IncidentId, // Add IncidentId mapping
                    Quantity = request.Quantity,
                    ReplacedDate = request.ReplacedDate,
                    ReplacedBy = request.ReplacedBy,
                    Status = request.Status,
                    Remarks = request.Remarks,
                    ActualQuantityUsed = request.ActualQuantityUsed,
                    QuantityToReturn = request.QuantityToReturn,
                };
                if (request.Quantity <= 0)
                {
                    return BadRequest(new { message = "Số lượng phụ tùng phải lớn hơn 0" });
                }

                var result = await _service.UpdateAsync(id, replacementHistory, cancellationToken);


                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Ghi nhận số lượng thực tế sử dụng và cập nhật trạng thái
        /// Nếu actualQuantityUsed == Quantity (dùng đủ): tự động chuyển "Hoàn thành" và trừ kho luôn
        /// Nếu actualQuantityUsed < Quantity (dư): chuyển "Chờ trả lại", chờ QLKT xác nhận
        /// </summary>
        [HttpPut("{id:int}/record-usage")]
        public async Task<ActionResult<ReplacementHistoryDTO>> RecordActualUsage(
            int id,
            [FromBody] RecordUsageRequest request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (request.ActualQuantityUsed < 0)
                    return BadRequest(new { message = "Số lượng sử dụng không được âm" });

                // Get existing replacement
                var existing = await _service.GetByIdAsync(id, cancellationToken);
                if (existing == null)
                    return NotFound(new { message = $"Replacement history với ID {id} không tồn tại" });

                // Update only ActualQuantityUsed, QuantityToReturn, and Status
                existing.ActualQuantityUsed = request.ActualQuantityUsed;

                var toReturn = existing.Quantity - request.ActualQuantityUsed;
                existing.QuantityToReturn = toReturn > 0 ? toReturn : 0;
                existing.Status = request.Status; // "Chờ trả lại" or "Hoàn thành"

                if (!string.IsNullOrEmpty(request.Remarks))
                    existing.Remarks = request.Remarks;

                var result = await _service.UpdateAsync(id, existing, cancellationToken);

                // Nếu status = "Hoàn thành" (dùng đủ), tự động trừ kho luôn
                if (result.Status == "Hoàn thành" && result.PartId > 0 && result.ActualQuantityUsed.HasValue && result.ActualQuantityUsed.Value > 0)
                {
                    var sparePart = await _context.SpareParts.FindAsync(new object[] { result.PartId }, cancellationToken: cancellationToken);
                    if (sparePart != null)
                    {
                        // Trừ số lượng = ActualQuantityUsed
                        sparePart.Quantity -= result.ActualQuantityUsed.Value;

                        // Đảm bảo quantity không âm
                        if (sparePart.Quantity < 0)
                            sparePart.Quantity = 0;

                        _context.SpareParts.Update(sparePart);
                        await _context.SaveChangesAsync(cancellationToken);

                        Console.WriteLine($"✓ Auto-reduced SparePart {result.PartId}: Quantity -= {result.ActualQuantityUsed.Value}, New Quantity = {sparePart.Quantity}");
                    }
                }

                var response = new ReplacementHistoryDTO
                {
                    EquipmentID = result.EquipmentId,
                    IncidentId = result.IncidentId,
                    PartID = result.PartId,
                    PartName = result.Part != null ? result.Part.PartName : null,
                    PartNumber = result.Part != null ? result.Part.PartNumber : null,
                    EquipmentName = result.Equipment != null ? result.Equipment.EquipmentName : null,
                    EquipmentCode = result.Equipment != null ? result.Equipment.EquipmentCode : null,
                    ReplacedBy = result.ReplacedBy,
                    ReplacedByUserName = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.Email : null,
                    ReplacementID = result.ReplacementId,
                    Quantity = result.Quantity,
                    ActualQuantityUsed = result.ActualQuantityUsed,
                    QuantityToReturn = result.QuantityToReturn,
                    ReplacedDate = result.ReplacedDate,
                    Status = result.Status,
                    Remarks = result.Remarks
                };
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("equipment/{equipmentId:int}")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByEquipmentId(int equipmentId, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByEquipmentIdAsync(equipmentId, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    EquipmentID = s.EquipmentId,
                    IncidentId = s.IncidentId,
                    PartID = s.PartId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedBy = s.ReplacedBy,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ActualQuantityUsed = s.ActualQuantityUsed,
                    QuantityToReturn = s.QuantityToReturn,
                    ReplacedDate = s.ReplacedDate,
                    ReturnedDate = s.ReturnedDate,
                    ReturnRemarks = s.ReturnRemarks,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("incident/{incidentId:int}")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByIncidentId(int incidentId, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByIncidentIdAsync(incidentId, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    EquipmentID = s.EquipmentId,
                    IncidentId = s.IncidentId,
                    PartID = s.PartId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedBy = s.ReplacedBy,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ActualQuantityUsed = s.ActualQuantityUsed,
                    QuantityToReturn = s.QuantityToReturn,
                    ReplacedDate = s.ReplacedDate,
                    ReturnedDate = s.ReturnedDate,
                    ReturnRemarks = s.ReturnRemarks,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("part/{partId:int}")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByPartId(int partId, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByPartIdAsync(partId, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    EquipmentID = s.EquipmentId,
                    IncidentId = s.IncidentId,
                    PartID = s.PartId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedBy = s.ReplacedBy,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ReplacedDate = s.ReplacedDate,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByUserId(string userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByUserIdAsync(userId, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ReplacedDate = s.ReplacedDate,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (startDate > endDate)
                    return BadRequest("Ngày bắt đầu phải trước ngày kết thúc.");
                var result = await _service.GetByDateRangeAsync(startDate, endDate, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ReplacedDate = s.ReplacedDate,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetByStatus(string status, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetByStatusAsync(status, cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    EquipmentID = s.EquipmentId,
                    IncidentId = s.IncidentId,
                    PartID = s.PartId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedBy = s.ReplacedBy,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ActualQuantityUsed = s.ActualQuantityUsed,
                    QuantityToReturn = s.QuantityToReturn,
                    ReplacedDate = s.ReplacedDate,
                    ReturnedDate = s.ReturnedDate,
                    ReturnRemarks = s.ReturnRemarks,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Cập nhật thông tin trả lại linh kiện thừa vào kho và trừ số lượng trong SpareParts
        /// </summary>
        [HttpPut("{id}/confirm-return")]
        public async Task<ActionResult<ReplacementHistoryDTO>> ConfirmReturn(
            int id,
            [FromBody] ReturnConfirmationDto confirmationDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.ConfirmReturnAsync(id, confirmationDto, cancellationToken);
                if (result == null)
                    return NotFound("Replacement history not found");

                // NEW: Trừ số lượng trong bảng SpareParts theo ActualQuantityUsed
                if (result.PartId > 0 && result.ActualQuantityUsed.HasValue && result.ActualQuantityUsed.Value > 0)
                {
                    var sparePart = await _context.SpareParts.FindAsync(new object[] { result.PartId }, cancellationToken: cancellationToken);
                    if (sparePart != null)
                    {
                        // Trừ số lượng = ActualQuantityUsed
                        sparePart.Quantity -= result.ActualQuantityUsed.Value;

                        // Đảm bảo quantity không âm
                        if (sparePart.Quantity < 0)
                            sparePart.Quantity = 0;

                        _context.SpareParts.Update(sparePart);
                        await _context.SaveChangesAsync(cancellationToken);

                        Console.WriteLine($"✓ Updated SparePart {result.PartId}: Quantity -= {result.ActualQuantityUsed.Value}, New Quantity = {sparePart.Quantity}");
                    }
                }

                var response = new ReplacementHistoryDTO
                {
                    IncidentId = result.IncidentId,
                    PartName = result.Part != null ? result.Part.PartName : null,
                    PartNumber = result.Part != null ? result.Part.PartNumber : null,
                    EquipmentName = result.Equipment != null ? result.Equipment.EquipmentName : null,
                    EquipmentCode = result.Equipment != null ? result.Equipment.EquipmentCode : null,
                    ReplacedByUserName = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = result.ReplacedByNavigation != null ? result.ReplacedByNavigation.Email : null,
                    ReplacementID = result.ReplacementId,
                    Quantity = result.Quantity,
                    ActualQuantityUsed = result.ActualQuantityUsed,
                    QuantityToReturn = result.QuantityToReturn,
                    ReplacedDate = result.ReplacedDate,
                    ReturnedDate = result.ReturnedDate,
                    ReturnConfirmedBy = result.ReturnConfirmedBy,
                    ReturnRemarks = result.ReturnRemarks,
                    Status = result.Status,
                    Remarks = result.Remarks
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        /// <summary>
        /// Lấy danh sách lịch sử thay thế cần trả lại linh kiện
        /// </summary>
        [HttpGet("pending-return")]
        public async Task<ActionResult<IEnumerable<ReplacementHistoryDTO>>> GetPendingReturn(CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.GetPendingReturnAsync(cancellationToken);
                var responses = result.Select(s => new ReplacementHistoryDTO
                {
                    IncidentId = s.IncidentId,
                    PartName = s.Part != null ? s.Part.PartName : null,
                    PartNumber = s.Part != null ? s.Part.PartNumber : null,
                    EquipmentName = s.Equipment != null ? s.Equipment.EquipmentName : null,
                    EquipmentCode = s.Equipment != null ? s.Equipment.EquipmentCode : null,
                    ReplacedByUserName = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.UserName : null,
                    ReplacedByEmail = s.ReplacedByNavigation != null ? s.ReplacedByNavigation.Email : null,
                    ReplacementID = s.ReplacementId,
                    Quantity = s.Quantity,
                    ActualQuantityUsed = s.ActualQuantityUsed,
                    QuantityToReturn = s.QuantityToReturn,
                    ReplacedDate = s.ReplacedDate,
                    ReturnedDate = s.ReturnedDate,
                    ReturnConfirmedBy = s.ReturnConfirmedBy,
                    ReturnRemarks = s.ReturnRemarks,
                    Status = s.Status,
                    Remarks = s.Remarks
                });
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }
    }
}