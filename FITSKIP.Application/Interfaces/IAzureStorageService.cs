using Microsoft.AspNetCore.Http;

namespace FITSKIP.Application.Interfaces;

public interface IAzureStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string containerName, string? folderPath = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string fileName, string containerName, CancellationToken cancellationToken = default);
    Task<string> GetFileUrlAsync(string fileName, string containerName);
}
