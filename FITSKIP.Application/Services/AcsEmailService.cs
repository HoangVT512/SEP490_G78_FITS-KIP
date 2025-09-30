using Azure;
using Azure.Communication.Email;
using FITSKIP.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FITSKIP.Application.Services;

public class AcsEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public AcsEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string? plainTextBody = null, CancellationToken cancellationToken = default)
    {
        var acsSection = _configuration.GetSection("AcsEmail");
        var connectionString = acsSection["ConnectionString"] ?? string.Empty;
        var sender = acsSection["Sender"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(connectionString) || string.IsNullOrWhiteSpace(sender))
        {
            throw new InvalidOperationException("AcsEmail configuration is missing ConnectionString or Sender");
        }

        var emailClient = new EmailClient(connectionString);

        var content = new EmailContent(subject)
        {
            Html = string.IsNullOrWhiteSpace(htmlBody) ? null : htmlBody,
            PlainText = string.IsNullOrWhiteSpace(plainTextBody) ? null : plainTextBody
        };

        var recipients = new EmailRecipients(new[] { new EmailAddress(toEmail) });
        var message = new EmailMessage(sender, recipients, content);

        var response = await emailClient.SendAsync(WaitUntil.Completed, message, cancellationToken);
        if (response == null || response.Value == null)
        {
            throw new InvalidOperationException("Failed to send email via ACS");
        }
    }
}


