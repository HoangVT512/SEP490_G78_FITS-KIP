using FITSKIP.Domain.DTO;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace FITSKIP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReplacementStatisticsController : ControllerBase
    {
        private readonly FitskipDbContext _context;

        public ReplacementStatisticsController(FitskipDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy thống kê linh kiện tiêu hao theo dây chuyền và công đoạn
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComponentReplacementStatisticsDTO>>> GetStatistics(
            [FromQuery] int? lineId = null,
            [FromQuery] int? stageId = null,
            [FromQuery] string? status = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Lấy tất cả replacement history có status = "Hoàn thành"
                var replacementHistories = await _context.ReplacementHistories
                    .Include(r => r.Part)
                    .Include(r => r.Equipment)
                        .ThenInclude(e => e.Stage)
                            .ThenInclude(s => s.Line)
                    .Where(r => r.Status == "Hoàn thành" && r.ActualQuantityUsed.HasValue)
                    .ToListAsync(cancellationToken);

                // Group theo PartId, Equipment, Stage, Line
                var grouped = replacementHistories
                    .GroupBy(r => new
                    {
                        PartId = r.PartId,
                        EquipmentId = r.EquipmentId,
                        StageId = r.Equipment?.StageId,
                        LineId = r.Equipment?.Stage?.LineId
                    })
                    .Select(g =>
                    {
                        var first = g.First();
                        var part = first.Part;
                        var equipment = first.Equipment;
                        var stage = equipment?.Stage;
                        var line = stage?.Line;

                        // Tính tổng số lượng đã sử dụng
                        var totalUsed = g.Sum(r => r.ActualQuantityUsed ?? 0);
                        
                        // Số lần thay thế
                        var replacementCount = g.Count();
                        
                        // Ngày thay gần nhất
                        var lastDate = g.Max(r => r.ReplacedDate);

                        // Parse ReplacementCycle để lấy limit value và unit
                        var (limitValue, limitUnit) = ParseReplacementCycle(part?.ReplacementCycle);

                        // Tính % sử dụng
                        decimal? usagePercentage = null;
                        if (limitValue.HasValue && limitValue.Value > 0)
                        {
                            usagePercentage = ((decimal)totalUsed / limitValue.Value) * 100;
                        }

                        // Xác định status và color
                        var (statusStr, colorStr) = CalculateStatus(usagePercentage);

                        return new ComponentReplacementStatisticsDTO
                        {
                            PartId = g.Key.PartId,
                            PartNumber = part?.PartNumber ?? "",
                            PartName = part?.PartName ?? "",
                            PartType = part?.PartType,
                            LineId = line?.LineId,
                            LineName = line?.LineName,
                            StageId = stage?.StageId,
                            StageName = stage?.StageName,
                            EquipmentId = equipment?.EquipmentId,
                            EquipmentCode = equipment?.EquipmentCode,
                            EquipmentName = equipment?.EquipmentName,
                            ReplacementCycle = part?.ReplacementCycle,
                            LimitValue = limitValue,
                            LimitUnit = limitUnit,
                            TotalQuantityUsed = totalUsed,
                            ReplacementCount = replacementCount,
                            LastReplacementDate = lastDate,
                            UsagePercentage = usagePercentage,
                            Status = statusStr,
                            StatusColor = colorStr
                        };
                    })
                    .ToList();

                // Apply filters
                if (lineId.HasValue)
                {
                    grouped = grouped.Where(s => s.LineId == lineId.Value).ToList();
                }

                if (stageId.HasValue)
                {
                    grouped = grouped.Where(s => s.StageId == stageId.Value).ToList();
                }

                if (!string.IsNullOrEmpty(status))
                {
                    grouped = grouped.Where(s => s.Status == status).ToList();
                }

                // Sắp xếp theo % sử dụng giảm dần
                grouped = grouped.OrderByDescending(s => s.UsagePercentage ?? 0).ToList();

                return Ok(grouped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Parse ReplacementCycle string để lấy số và đơn vị
        /// Ví dụ: "50000 PCS" -> (50000, "PCS"), "12 Tháng" -> (12, "Tháng")
        /// </summary>
        private (int?, string?) ParseReplacementCycle(string? replacementCycle)
        {
            if (string.IsNullOrWhiteSpace(replacementCycle))
                return (null, null);

            try
            {
                // Regex để tìm số và chữ
                var match = Regex.Match(replacementCycle.Trim(), @"(\d+)\s*(.*)");
                if (match.Success)
                {
                    var value = int.Parse(match.Groups[1].Value);
                    var unit = match.Groups[2].Value.Trim();
                    return (value, string.IsNullOrEmpty(unit) ? "PCS" : unit);
                }
            }
            catch
            {
                // Ignore parsing errors
            }

            return (null, null);
        }

        /// <summary>
        /// Tính status và color dựa trên % sử dụng
        /// </summary>
        private (string status, string color) CalculateStatus(decimal? usagePercentage)
        {
            if (!usagePercentage.HasValue)
                return ("safe", "#2980b9"); // Chưa có dữ liệu

            if (usagePercentage.Value > 100)
                return ("critical", "#e74c3c"); // Quá hạn

            if (usagePercentage.Value >= 80)
                return ("warning", "#f39c12"); // Đến hạn

            return ("safe", "#2980b9"); // An toàn
        }

        /// <summary>
        /// Lấy danh sách các dây chuyền có dữ liệu thống kê
        /// </summary>
        [HttpGet("lines")]
        public async Task<ActionResult<IEnumerable<object>>> GetLinesWithData(CancellationToken cancellationToken = default)
        {
            try
            {
                var lines = await _context.Lines
                    .Where(l => l.IsActive)
                    .OrderBy(l => l.LineName)
                    .Select(l => new
                    {
                        LineId = l.LineId,
                        LineName = l.LineName,
                        LineCode = l.LineCode
                    })
                    .ToListAsync(cancellationToken);

                return Ok(lines);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tổng hợp số lượng theo trạng thái cho một dây chuyền
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary(
            [FromQuery] int? lineId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Get all statistics
                var allStats = await GetStatistics(lineId, null, null, cancellationToken);
                var stats = (allStats.Result as OkObjectResult)?.Value as IEnumerable<ComponentReplacementStatisticsDTO>;

                if (stats == null)
                    return Ok(new { safe = 0, warning = 0, critical = 0, total = 0 });

                var summary = new
                {
                    safe = stats.Count(s => s.Status == "safe"),
                    warning = stats.Count(s => s.Status == "warning"),
                    critical = stats.Count(s => s.Status == "critical"),
                    total = stats.Count()
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
