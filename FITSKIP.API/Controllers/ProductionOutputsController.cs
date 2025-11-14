using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ProductionOutputsController : ControllerBase
{
    private readonly IProductionOutputService _productionOutputService;

    public ProductionOutputsController(IProductionOutputService productionOutputService)
    {
        _productionOutputService = productionOutputService;
    }

    /// <summary>
    /// Lấy danh sách tất cả sản lượng sản xuất
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProductionOutputs(CancellationToken cancellationToken)
    {
        try
        {
            var outputs = await _productionOutputService.GetProductionOutputsAsync(cancellationToken);
            return Ok(new { success = true, data = outputs, message = "Lấy danh sách sản lượng sản xuất thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách sản lượng sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin sản lượng sản xuất theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductionOutput(int id, CancellationToken cancellationToken)
    {
        try
        {
            var output = await _productionOutputService.GetProductionOutputByIdAsync(id, cancellationToken);
            if (output == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản lượng sản xuất với ID: " + id });

            return Ok(new { success = true, data = output, message = "Lấy thông tin sản lượng sản xuất thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy thông tin sản lượng sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo mới sản lượng sản xuất
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProductionOutput([FromBody] CreateProductionOutputRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var output = await _productionOutputService.CreateProductionOutputAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetProductionOutput), new { id = output.OutputId },
                new { success = true, data = output, message = "Tạo sản lượng sản xuất thành công" });
        }
        catch (ProductionOutputValidationException ex)
        {
            return BadRequest(new {
                success = false,
                message = ex.Message,
                errorCode = ex.ErrorCode,
                errorData = ex.ErrorData
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tạo sản lượng sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật sản lượng sản xuất
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProductionOutput(int id, [FromBody] UpdateProductionOutputRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var output = await _productionOutputService.UpdateProductionOutputAsync(id, request, cancellationToken);
            if (output == null)
                return NotFound(new { success = false, message = "Không tìm thấy sản lượng sản xuất với ID: " + id });

            return Ok(new { success = true, data = output, message = "Cập nhật sản lượng sản xuất thành công" });
        }
        catch (ProductionOutputValidationException ex)
        {
            return BadRequest(new {
                success = false,
                message = ex.Message,
                errorCode = ex.ErrorCode,
                errorData = ex.ErrorData
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi cập nhật sản lượng sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Xóa sản lượng sản xuất
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductionOutput(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _productionOutputService.DeleteProductionOutputAsync(id, cancellationToken);
            if (!result)
                return NotFound(new { success = false, message = "Không tìm thấy sản lượng sản xuất với ID: " + id });

            return Ok(new { success = true, message = "Xóa sản lượng sản xuất thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi xóa sản lượng sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sản lượng sản xuất theo chuyền
    /// </summary>
    [HttpGet("line/{lineId}")]
    public async Task<IActionResult> GetProductionOutputsByLine(int lineId, CancellationToken cancellationToken)
    {
        try
        {
            var outputs = await _productionOutputService.GetProductionOutputsByLineAsync(lineId, cancellationToken);
            return Ok(new { success = true, data = outputs, message = "Lấy danh sách sản lượng sản xuất theo chuyền thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách sản lượng sản xuất theo chuyền", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sản lượng sản xuất theo khoảng thời gian
    /// </summary>
    [HttpGet("date-range")]
    public async Task<IActionResult> GetProductionOutputsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken cancellationToken)
    {
        try
        {
            var outputs = await _productionOutputService.GetProductionOutputsByDateRangeAsync(startDate, endDate, cancellationToken);
            return Ok(new { success = true, data = outputs, message = "Lấy danh sách sản lượng sản xuất theo khoảng thời gian thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách sản lượng sản xuất theo khoảng thời gian", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sản lượng sản xuất theo chuyền và ngày
    /// </summary>
    [HttpGet("line/{lineId}/date")]
    public async Task<IActionResult> GetProductionOutputsByLineAndDate(int lineId, [FromQuery] string date, CancellationToken cancellationToken)
    {
        try
        {
            // Parse date string to DateTime with DD/MM/YYYY format
            Console.WriteLine($"Đang parse date string: '{date}'");

            // Try parsing with Vietnamese culture first (supports DD/MM/YYYY)
            var vietnameseCulture = new System.Globalization.CultureInfo("vi-VN");
            if (!DateTime.TryParse(date, vietnameseCulture, System.Globalization.DateTimeStyles.None, out var parsedDate))
            {
                Console.WriteLine($"Không thể parse date: '{date}' với culture vi-VN");
                return BadRequest(new { success = false, message = "Định dạng ngày không hợp lệ. Định dạng mong đợi: DD/MM/YYYY" });
            }

            Console.WriteLine($"Đang lấy sản lượng sản xuất cho chuyền {lineId} vào ngày {parsedDate:dd/MM/yyyy}");

            var outputs = await _productionOutputService.GetProductionOutputsByLineAndDateAsync(lineId, parsedDate, cancellationToken);

            Console.WriteLine($"Tìm thấy {outputs.Count} bản ghi sản lượng sản xuất");

            return Ok(new { success = true, data = outputs, message = "Lấy danh sách sản lượng sản xuất theo chuyền và ngày thành công" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi khi lấy sản lượng sản xuất: {ex.Message}");
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách sản lượng sản xuất theo chuyền và ngày", details = ex.Message });
        }
    }

    [HttpPost("upsert")]
    public async Task<IActionResult> UpsertProductionOutput([FromBody] CreateProductionOutputRequest request, CancellationToken cancellationToken)
    {
        // Check if exists, update if yes, create if no
        var existing = await _productionOutputService.GetProductionOutputsByLineAndDateAsync(request.LineId, request.Date, cancellationToken);
        var record = existing.FirstOrDefault(e => e.ShiftId == request.ShiftId && e.SlotTime == request.SlotTime);
        if (record != null)
        {
            var updateRequest = new UpdateProductionOutputRequest
            {
                LoadingTime = request.LoadingTime,
                TargetAmount = request.TargetAmount,
                ResultAmount = request.ResultAmount
            };
            return await UpdateProductionOutput(record.OutputId, updateRequest, cancellationToken);
        }
        else
        {
            return await CreateProductionOutput(request, cancellationToken);
        }
    }

    /// <summary>
    /// Lấy danh sách slot time có sẵn cho một chuyền, ngày và ca làm việc
    /// </summary>
    [HttpPost("available-slots")]
    public async Task<IActionResult> GetAvailableSlotTimes([FromBody] ProductionOutputSlotTimeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var slotTimes = await _productionOutputService.GetAvailableSlotTimesAsync(request, cancellationToken);
            return Ok(new { success = true, data = slotTimes, message = "Lấy danh sách slot time có sẵn thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách slot time có sẵn", details = ex.Message });
        }
    }

    /// <summary>
    /// Tính toán loading time cho một slot time cụ thể
    /// </summary>
    [HttpPost("calculate-loading-time")]
    public async Task<IActionResult> CalculateLoadingTime([FromBody] CalculateLoadingTimeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var loadingTime = await _productionOutputService.CalculateLoadingTimeAsync(
                request.LineId, request.Date, request.ShiftId, request.SlotTime, request.LoadingTime, cancellationToken);

            return Ok(new { success = true, data = new { loadingTime }, message = "Tính toán loading time thành công" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tính toán loading time", details = ex.Message });
        }
    }

    /// <summary>
    /// Tính toán OEE cho một slot time cụ thể
    /// </summary>
    [HttpPost("calculate-oee")]
    public async Task<IActionResult> CalculateOEE([FromBody] CalculateOEERequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            // Tính runTime = loadingTime - downtime trước
            var runTime = await _productionOutputService.CalculateLoadingTimeAsync(
                request.LineId, request.Date, request.ShiftId, request.SlotTime, request.LoadingTime, cancellationToken);

            var oee = await _productionOutputService.CalculateOEEAsync(
                request.LineId, request.Date, request.ShiftId, request.SlotTime, request.TargetAmount, request.ResultAmount, runTime, cancellationToken);

            // Convert OEE to percentage for display
            var oeePercentage = Math.Round(oee * 100, 2);

            return Ok(new
            {
                success = true,
                data = new
                {
                    oeePercentage
                },
                message = "Tính toán OEE thành công"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tính toán OEE", details = ex.Message });
        }
    }

    /// <summary>
    /// Tính toán OEE cho toàn bộ ca làm việc
    /// </summary>
    [HttpPost("calculate-oee-shift")]
    public async Task<IActionResult> CalculateOEEForShift([FromBody] CalculateOEEForShiftRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var oeeResult = await _productionOutputService.CalculateOEEForShiftAsync(
                request.LineId, request.Date, request.ShiftId, cancellationToken);

            return Ok(new
            {
                success = true,
                data = oeeResult,
                message = "Tính toán OEE cho ca làm việc thành công"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tính toán OEE cho ca làm việc", details = ex.Message });
        }
    }

    /// <summary>
    /// Tính toán OEE cho toàn bộ ngày
    /// </summary>
    [HttpPost("calculate-oee-day")]
    public async Task<IActionResult> CalculateOEEForDay([FromBody] CalculateOEEForDayRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            var oeeResult = await _productionOutputService.CalculateOEEForDayAsync(
                request.LineId, request.Date, cancellationToken);

            return Ok(new
            {
                success = true,
                data = oeeResult,
                message = "Tính toán OEE cho ngày thành công"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tính toán OEE cho ngày", details = ex.Message });
        }
    }


    private decimal CalculateQuality(string? targetAmount)
    {
        if (string.IsNullOrEmpty(targetAmount))
            return 100;

        var targetParts = targetAmount.Split('/');
        if (targetParts.Length == 2 &&
            int.TryParse(targetParts[0], out int targetGood) &&
            int.TryParse(targetParts[1], out int targetTotal))
        {
            return targetTotal > 0 ? Math.Round((decimal)targetGood / targetTotal * 100, 2) : 0;
        }
        return 100;
    }
}

/// <summary>
/// Request DTO cho tính toán loading time
/// </summary>
public class CalculateLoadingTimeRequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
    public string SlotTime { get; set; } = string.Empty;
    public int LoadingTime { get; set; }        
}

/// <summary>
/// Request DTO cho tính toán OEE
/// </summary>
public class CalculateOEERequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
    public string SlotTime { get; set; } = string.Empty;

    public int LoadingTime { get; set; }
    public int? TargetAmount { get; set; }
    public int? ResultAmount { get; set; }
}

/// <summary>
/// Request DTO cho tính toán OEE cho ca làm việc
/// </summary>
public class CalculateOEEForShiftRequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }
    public int ShiftId { get; set; }
}

/// <summary>
/// Request DTO cho tính toán OEE cho ngày
/// </summary>
public class CalculateOEEForDayRequest
{
    public int LineId { get; set; }
    public DateTime Date { get; set; }
}
