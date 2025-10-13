using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Settings;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace FITSKIP.Application.Services
{
    public class TwilioSmsService : ISmsService
    {
        private readonly TwilioSettings _twilioSettings;
        private readonly HttpClient _httpClient;

        public TwilioSmsService(IOptions<TwilioSettings> twilioSettings, HttpClient httpClient)
        {
            _twilioSettings = twilioSettings.Value;
            _httpClient = httpClient;
            
            // Setup basic authentication for Twilio API
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_twilioSettings.AccountSid}:{_twilioSettings.AuthToken}"));
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var url = $"https://api.twilio.com/2010-04-01/Accounts/{_twilioSettings.AccountSid}/Messages.json";
                
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new("From", _twilioSettings.PhoneNumber),
                    new("To", phoneNumber),
                    new("Body", message)
                };

                var content = new FormUrlEncodedContent(parameters);
                var response = await _httpClient.PostAsync(url, content);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMS Error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendVerificationCodeAsync(string phoneNumber)
        {
            try
            {
                var url = $"https://verify.twilio.com/v2/Services/{_twilioSettings.VerifyServiceSid}/Verifications";
                
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new("To", phoneNumber),
                    new("Channel", "sms")
                };

                var content = new FormUrlEncodedContent(parameters);
                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Twilio Verification Response: {responseContent}");
                    
                    var jsonDoc = JsonDocument.Parse(responseContent);
                    var status = jsonDoc.RootElement.GetProperty("status").GetString();
                    return status == "pending";
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Twilio Verification Error: {response.StatusCode} - {errorContent}");
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMS Verification Error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> VerifyCodeAsync(string phoneNumber, string code)
        {
            try
            {
                var url = $"https://verify.twilio.com/v2/Services/{_twilioSettings.VerifyServiceSid}/VerificationCheck";
                
                var parameters = new List<KeyValuePair<string, string>>
                {
                    new("To", phoneNumber),
                    new("Code", code)
                };

                var content = new FormUrlEncodedContent(parameters);
                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Twilio Verification Check Response: {responseContent}");
                    
                    var jsonDoc = JsonDocument.Parse(responseContent);
                    var status = jsonDoc.RootElement.GetProperty("status").GetString();
                    return status == "approved";
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Twilio Verification Check Error: {response.StatusCode} - {errorContent}");
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMS Verification Check Error: {ex.Message}");
                return false;
            }
        }
    }
}