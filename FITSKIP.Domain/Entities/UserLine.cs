using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class UserLine
{
    public int UserLineId { get; set; }

    public string UserId { get; set; } = null!;

    public int LineId { get; set; }

    public DateTime? CreateDate { get; set; }

    public virtual Line Line { get; set; } = null!;

    public virtual AspNetUser User { get; set; } = null!;
}
