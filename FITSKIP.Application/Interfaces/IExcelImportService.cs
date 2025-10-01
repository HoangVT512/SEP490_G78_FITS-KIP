using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IExcelImportService
    {
        Task<List<CreateUserRequest>> ImportUsersFromExcelAsync(Stream fileStream);
    }
}