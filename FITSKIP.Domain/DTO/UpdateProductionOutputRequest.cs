using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO;

public class UpdateProductionOutputRequest
{
    [Range(1, 1440, ErrorMessage = "Thời gian tải phải từ 1 đến 1440 phút")]
    public int? LoadingTime { get; set; }

    [Range(1, 10000, ErrorMessage = "Số lượng mục tiêu phải từ 1 đến 10.000")]
    public int? TargetAmount { get; set; }

    [Range(0, 10000, ErrorMessage = "Số lượng thực tế phải từ 0 đến 10.000")]
    public int? ResultAmount { get; set; }
}
