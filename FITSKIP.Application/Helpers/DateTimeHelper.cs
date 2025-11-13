using System;

namespace FITSKIP.Application.Helpers
{
    /// <summary>
    /// Helper class để xử lý chuyển đổi DateTime sang múi giờ Việt Nam (UTC+7)
    /// </summary>
    public static class DateTimeHelper
    {
        // Múi giờ Việt Nam (UTC+7)
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        /// <summary>
        /// Chuyển đổi DateTime từ UTC sang giờ Việt Nam (UTC+7)
        /// </summary>
        /// <param name="utcDateTime">DateTime ở múi giờ UTC</param>
        /// <returns>DateTime ở múi giờ Việt Nam</returns>
        public static DateTime ConvertUtcToVietnam(DateTime utcDateTime)
        {
            // Nếu DateTime đã là local time (không phải UTC), trước tiên cần specify nó là UTC
            if (utcDateTime.Kind == DateTimeKind.Unspecified)
            {
                utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
            }

            // Convert từ UTC sang Việt Nam
            DateTime vietnamDateTime = TimeZoneInfo.ConvertTime(utcDateTime, VietnamTimeZone);

            // Return với Kind = Unspecified để lưu vào database là local time
            return DateTime.SpecifyKind(vietnamDateTime, DateTimeKind.Unspecified);
        }

        /// <summary>
        /// Lấy thời gian hiện tại ở Việt Nam
        /// </summary>
        /// <returns>DateTime hiện tại ở múi giờ Việt Nam</returns>
        public static DateTime GetVietnamNow()
        {
            DateTime utcNow = DateTime.UtcNow;
            return ConvertUtcToVietnam(utcNow);
        }

        /// <summary>
        /// Chuyển đổi DateTime từ giờ Việt Nam sang UTC
        /// </summary>
        /// <param name="vietnamDateTime">DateTime ở múi giờ Việt Nam</param>
        /// <returns>DateTime ở múi giờ UTC</returns>
        public static DateTime ConvertVietnamToUtc(DateTime vietnamDateTime)
        {
            if (vietnamDateTime.Kind == DateTimeKind.Unspecified)
            {
                vietnamDateTime = DateTime.SpecifyKind(vietnamDateTime, DateTimeKind.Unspecified);
            }

            // Assume vietnamDateTime là local time ở Việt Nam
            DateTime utcDateTime = TimeZoneInfo.ConvertTimeToUtc(vietnamDateTime, VietnamTimeZone);
            return utcDateTime;
        }
    }
}
