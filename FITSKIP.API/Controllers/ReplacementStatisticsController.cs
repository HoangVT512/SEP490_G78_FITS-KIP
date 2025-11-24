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
    [Authorize(Roles = "Quản trị viên,Quản lý kho,Quản lý kỹ thuật")]
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
                            TotalQuantityUsed = totalUsed,
                            ReplacementCount = replacementCount,
                            LastReplacementDate = lastDate
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

                // Sắp xếp theo tổng số lượng đã sử dụng giảm dần
                grouped = grouped.OrderByDescending(s => s.TotalQuantityUsed).ToList();

                return Ok(grouped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
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
                    return Ok(new { total = 0 });

                var summary = new
                {
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
