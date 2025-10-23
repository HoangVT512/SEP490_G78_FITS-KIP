using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using FITSKIP.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace FITSKIP.Application.Services;

public class AzureStorageService : IAzureStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _baseUrl;

    public AzureStorageService(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("AzureStorage");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Azure Storage connection string is not configured");
        }

        _blobServiceClient = new BlobServiceClient(connectionString);
        _baseUrl = configuration["AzureStorage:BaseUrl"] ?? "";
    }

    public async Task<string> UploadFileAsync(IFormFile file, string containerName, string? folderPath = null, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        // Validate file type (only images)
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
        {
            throw new ArgumentException($"File type {fileExtension} is not allowed. Only image files are supported.");
        }

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            throw new ArgumentException("File size cannot exceed 10MB");
        }

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var blobName = string.IsNullOrEmpty(folderPath) ? fileName : $"{folderPath.TrimEnd('/')}/{fileName}";

        // Get container client
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        
        // Create container if it doesn't exist
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

        // Get blob client
        var blobClient = containerClient.GetBlobClient(blobName);

        // Set content type
        var blobHttpHeaders = new BlobHttpHeaders
        {
            ContentType = GetContentType(fileExtension)
        };

        // Upload file
        using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions
        {
            HttpHeaders = blobHttpHeaders
        }, cancellationToken);

        // Return the blob URL
        return blobClient.Uri.ToString();
    }

    public async Task<bool> DeleteFileAsync(string fileName, string containerName, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var response = await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
            return response.Value;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetFileUrlAsync(string fileName, string containerName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);
        
        return blobClient.Uri.ToString();
    }

    private static string GetContentType(string fileExtension)
    {
        return fileExtension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
