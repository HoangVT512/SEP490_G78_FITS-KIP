namespace FITSKIP.Domain.Exceptions;

public class DomainValidationException : Exception
{
    public string ErrorCode { get; }
    public object? ErrorData { get; }

    public DomainValidationException(string message, string errorCode = "VALIDATION_ERROR", object? errorData = null)
        : base(message)
    {
        ErrorCode = errorCode;
        ErrorData = errorData;
    }
}

public class DepartmentValidationException : DomainValidationException
{
    public DepartmentValidationException(string message, string errorCode = "DEPARTMENT_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class LineValidationException : DomainValidationException
{
    public LineValidationException(string message, string errorCode = "LINE_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class StageValidationException : DomainValidationException
{
    public StageValidationException(string message, string errorCode = "STAGE_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class EquipmentValidationException : DomainValidationException
{
    public EquipmentValidationException(string message, string errorCode = "EQUIPMENT_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class SparePartValidationException : DomainValidationException
{
    public SparePartValidationException(string message, string errorCode = "SPAREPART_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class UserValidationException : DomainValidationException
{
    public UserValidationException(string message, string errorCode = "USER_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class ReplacementHistoryValidationException : DomainValidationException
{
    public ReplacementHistoryValidationException(string message, string errorCode = "REPLACEMENT_HISTORY_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class PurchaseRequestValidationException : DomainValidationException
{
    public PurchaseRequestValidationException(string message, string errorCode = "PURCHASE_REQUEST_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class ProductionOutputValidationException : DomainValidationException
{
    public ProductionOutputValidationException(string message, string errorCode = "PRODUCTION_OUTPUT_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class NotificationValidationException : DomainValidationException
{
    public NotificationValidationException(string message, string errorCode = "NOTIFICATION_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class IncidentValidationException : DomainValidationException
{
    public IncidentValidationException(string message, string errorCode = "INCIDENT_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

public class DashboardValidationException : DomainValidationException
{
    public DashboardValidationException(string message, string errorCode = "DASHBOARD_VALIDATION_ERROR", object? errorData = null)
        : base(message, errorCode, errorData)
    {
    }
}

