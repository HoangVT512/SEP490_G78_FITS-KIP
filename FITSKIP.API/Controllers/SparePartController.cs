using Microsoft.AspNetCore.Mvc;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SparePartController : ControllerBase
    {
        private readonly ISparePartService _service;

        public SparePartController(ISparePartService service)
        {
            _service = service;
        }

        // GET: api/SparePart
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SparePartDTO>>> GetAllSpareParts(CancellationToken cancellationToken = default)
        {
            try
            {
                var spareParts = await _service.GetAllSparePartsAsync(cancellationToken);

                // Mapping Entity to DTO
                var sparePartDTOs = spareParts.Select(sp => new SparePartDTO
                {
                    PartId = sp.PartId,
                    PartNumber = sp.PartNumber,
                    PartName = sp.PartName,
                    Quantity = sp.Quantity,
                    Location = sp.Location,
                    Status = sp.Status,
                    TotalPurchaseRequest = sp.PurchaseRequests?.Count ?? 0,
                    TotalReplacementHistory = sp.ReplacementHistories?.Count ?? 0
                });

                return Ok(sparePartDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // GET: api/SparePart/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SparePartDTO>> GetSparePartById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var sparePart = await _service.GetSparePartByIdAsync(id, cancellationToken);

                if (sparePart == null)
                    return NotFound(new { message = $"Spare part with ID {id} not found" });

                // Mapping Entity to DTO
                var sparePartDTO = new SparePartDTO
                {
                    PartId = sparePart.PartId,
                    PartNumber = sparePart.PartNumber,
                    PartName = sparePart.PartName,
                    Quantity = sparePart.Quantity,
                    Location = sparePart.Location,
                    Status = sparePart.Status,
                    TotalPurchaseRequest = sparePart.PurchaseRequests?.Count ?? 0,
                    TotalReplacementHistory = sparePart.ReplacementHistories?.Count ?? 0
                };

                return Ok(sparePartDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // POST: api/SparePart
        [HttpPost]
        public async Task<ActionResult<SparePartDTO>> CreateSparePart([FromBody] CreateSparePartRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Mapping DTO to Entity
                var sparePart = new SparePart
                {
                    PartNumber = request.PartNumber,
                    PartName = request.PartName,
                    Quantity = request.Quantity,
                    Location = request.Location
                };

                var created = await _service.CreateSparePartAsync(sparePart, cancellationToken);

                // Mapping Entity to DTO
                var sparePartDTO = new SparePartDTO
                {
                    PartId = created.PartId,
                    PartNumber = created.PartNumber,
                    PartName = created.PartName,
                    Quantity = created.Quantity,
                    Location = created.Location,
                    Status = created.Status,
                    TotalPurchaseRequest = 0,
                    TotalReplacementHistory = 0
                };

                return CreatedAtAction(nameof(GetSparePartById), new { id = sparePartDTO.PartId }, sparePartDTO);
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

        // PUT: api/SparePart/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSparePart(int id, [FromBody] UpdateSparePartRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Mapping DTO to Entity
                var sparePart = new SparePart
                {
                    PartNumber = request.PartNumber,
                    PartName = request.PartName,
                    Quantity = request.Quantity,
                    Location = request.Location,
                    Status = request.Status
                };

                var result = await _service.UpdateSparePartAsync(id, sparePart, cancellationToken);

                if (!result)
                    return NotFound(new { message = $"Spare part with ID {id} not found" });

                return NoContent();
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

        // DELETE: api/SparePart/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSparePart(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _service.DeleteSparePartAsync(id, cancellationToken);

                if (!result)
                    return NotFound(new { message = $"Không tìm thấy phụ tùng với ID {id}" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // GET: api/SparePart/top5-most-used
        [HttpGet("top5-most-used")]
        public async Task<ActionResult<IEnumerable<SparePartDTO>>> GetTop5MostUsed(CancellationToken cancellationToken = default)
        {
            try
            {
                var spareParts = await _service.GetTop5MostUsedSparePartsAsync(cancellationToken);

                // Mapping Entity to DTO and sort by replacement count
                var sparePartDTOs = spareParts.Select(sp => new SparePartDTO
                {
                    PartId = sp.PartId,
                    PartNumber = sp.PartNumber,
                    PartName = sp.PartName,
                    Quantity = sp.Quantity,
                    Location = sp.Location,
                    Status = sp.Status,
                    TotalPurchaseRequest = sp.PurchaseRequests?.Count ?? 0,
                    TotalReplacementHistory = sp.ReplacementHistories?.Count ?? 0
                })
                .OrderByDescending(sp => sp.TotalReplacementHistory)
                .Take(5);

                return Ok(sparePartDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // GET: api/SparePart/usage/weekly?week=5&year=2024
        [HttpGet("usage/weekly")]
        public async Task<ActionResult<UsageByWeekResponseDTO>> GetTotalUsageByWeek([FromQuery] int week, [FromQuery] int year, CancellationToken cancellationToken = default)
        {
            try
            {
                if (week < 1 || week > 53)
                    return BadRequest(new { message = "Week must be between 1 and 53" });

                var usageData = await _service.GetUsageByWeekAsync(week, year, cancellationToken);

                // Get part details
                var partIds = usageData.Keys.ToList();
                var allParts = await _service.GetAllSparePartsAsync(cancellationToken);
                var parts = allParts.Where(p => partIds.Contains(p.PartId)).ToList();

                // Mapping to DTO
                var response = new UsageByWeekResponseDTO
                {
                    Week = week,
                    Year = year,
                    TotalQuantity = usageData.Values.Sum(),
                    Parts = usageData.Select(kvp => new PartUsageDetailDTO
                    {
                        PartId = kvp.Key,
                        PartNumber = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartNumber ?? "N/A",
                        PartName = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartName ?? "N/A",
                        Quantity = kvp.Value
                    })
                    .OrderByDescending(p => p.Quantity)
                    .ToList()
                };

                return Ok(response);
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

        // GET: api/SparePart/usage/monthly?month=12&year=2024
        [HttpGet("usage/monthly")]
        public async Task<ActionResult<UsageByMonthResponseDTO>> GetTotalUsageByMonth([FromQuery] int month, [FromQuery] int year, CancellationToken cancellationToken = default)
        {
            try
            {
                if (month < 1 || month > 12)
                    return BadRequest(new { message = "Month must be between 1 and 12" });

                var usageData = await _service.GetUsageByMonthAsync(month, year, cancellationToken);

                // Get part details
                var partIds = usageData.Keys.ToList();
                var allParts = await _service.GetAllSparePartsAsync(cancellationToken);
                var parts = allParts.Where(p => partIds.Contains(p.PartId)).ToList();

                // Mapping to DTO
                var response = new UsageByMonthResponseDTO
                {
                    Month = month,
                    Year = year,
                    TotalQuantity = usageData.Values.Sum(),
                    Parts = usageData.Select(kvp => new PartUsageDetailDTO
                    {
                        PartId = kvp.Key,
                        PartNumber = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartNumber ?? "N/A",
                        PartName = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartName ?? "N/A",
                        Quantity = kvp.Value
                    })
                    .OrderByDescending(p => p.Quantity)
                    .ToList()
                };

                return Ok(response);
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

        // GET: api/SparePart/usage/current-week
        [HttpGet("usage/current-week")]
        public async Task<ActionResult<UsageByWeekResponseDTO>> GetUsageByCurrentWeek(CancellationToken cancellationToken = default)
        {
            try
            {
                var today = DateTime.Now;
                var culture = System.Globalization.CultureInfo.CurrentCulture;
                var calendar = culture.Calendar;
                var dateTimeFormat = culture.DateTimeFormat;
                var currentWeek = calendar.GetWeekOfYear(today, dateTimeFormat.CalendarWeekRule, dateTimeFormat.FirstDayOfWeek);
                var currentYear = today.Year;

                var usageData = await _service.GetUsageByCurrentWeekAsync(cancellationToken);

                // Get part details
                var partIds = usageData.Keys.ToList();
                var allParts = await _service.GetAllSparePartsAsync(cancellationToken);
                var parts = allParts.Where(p => partIds.Contains(p.PartId)).ToList();

                // Mapping to DTO
                var response = new UsageByWeekResponseDTO
                {
                    Week = currentWeek,
                    Year = currentYear,
                    TotalQuantity = usageData.Values.Sum(),
                    Parts = usageData.Select(kvp => new PartUsageDetailDTO
                    {
                        PartId = kvp.Key,
                        PartNumber = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartNumber ?? "N/A",
                        PartName = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartName ?? "N/A",
                        Quantity = kvp.Value
                    })
                    .OrderByDescending(p => p.Quantity)
                    .ToList()
                };

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // GET: api/SparePart/usage/current-month
        [HttpGet("usage/current-month")]
        public async Task<ActionResult<UsageByMonthResponseDTO>> GetUsageByCurrentMonth(CancellationToken cancellationToken = default)
        {
            try
            {
                var today = DateTime.Now;
                var currentMonth = today.Month;
                var currentYear = today.Year;

                var usageData = await _service.GetUsageByCurrentMonthAsync(cancellationToken);

                // Get part details
                var partIds = usageData.Keys.ToList();
                var allParts = await _service.GetAllSparePartsAsync(cancellationToken);
                var parts = allParts.Where(p => partIds.Contains(p.PartId)).ToList();

                // Mapping to DTO
                var response = new UsageByMonthResponseDTO
                {
                    Month = currentMonth,
                    Year = currentYear,
                    TotalQuantity = usageData.Values.Sum(),
                    Parts = usageData.Select(kvp => new PartUsageDetailDTO
                    {
                        PartId = kvp.Key,
                        PartNumber = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartNumber ?? "N/A",
                        PartName = parts.FirstOrDefault(p => p.PartId == kvp.Key)?.PartName ?? "N/A",
                        Quantity = kvp.Value
                    })
                    .OrderByDescending(p => p.Quantity)
                    .ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}