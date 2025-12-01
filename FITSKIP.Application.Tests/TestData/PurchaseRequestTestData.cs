using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using System;
using System.Collections.Generic;

namespace FITSKIP.Application.Tests.TestData
{
    public static class PurchaseRequestTestData
    {
        public static List<PurchaseRequest> GetTestPurchaseRequests()
        {
            return new List<PurchaseRequest>
            {
                new PurchaseRequest
                {
                    RequestId = 1,
                    PartId = 1,
                    Quantity = 50,
                    RequestedBy = "TECH001",
                    Reason = "Phụ tùng sắp hết",
                    Status = "Đã duyệt",
                    ApprovedBy = "ADMIN001",
                    ApprovedAt = DateTime.Now.AddDays(-4),
                    RejectedBy = null,
                    RejectedAt = null,
                    ReceivedBy = null,
                    ReceivedAt = null
                },
                new PurchaseRequest
                {
                    RequestId = 2,
                    PartId = 2,
                    Quantity = 20,
                    RequestedBy = "TECH002",
                    Reason = "Cần bổ sung tồn kho",
                    Status = "Chờ duyệt",
                    ApprovedBy = null,
                    ApprovedAt = null,
                    RejectedBy = null,
                    RejectedAt = null,
                    ReceivedBy = null,
                    ReceivedAt = null
                },
                new PurchaseRequest
                {
                    RequestId = 3,
                    PartId = 3, // Different PartId to avoid conflict
                    Quantity = 30,
                    RequestedBy = "TECH001",
                    Reason = "Phụ tùng hỏng",
                    Status = "Chờ duyệt", // Changed from "Từ chối" to "Chờ duyệt" for reject tests
                    ApprovedBy = null,
                    ApprovedAt = null,
                    RejectedBy = null,
                    RejectedAt = null,
                    ReceivedBy = null,
                    ReceivedAt = null
                },
                new PurchaseRequest
                {
                    RequestId = 4,
                    PartId = 4, // Different PartId
                    Quantity = 15,
                    RequestedBy = "TECH003",
                    Reason = "Mở rộng sản xuất",
                    Status = "Đã nhập",
                    ApprovedBy = "ADMIN001",
                    ApprovedAt = DateTime.Now.AddDays(-6),
                    RejectedBy = null,
                    RejectedAt = null,
                    ReceivedBy = "WAREHOUSE001",
                    ReceivedAt = DateTime.Now.AddDays(-5)
                }
            };
        }

        public static CreatePurchaseRequestRequest GetValidCreateRequest()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 1,
                Quantity = 25,
                Reason = "Tồn kho thấp, cần bổ sung"
            };
        }

        public static CreatePurchaseRequestRequest GetValidCreateRequest_MinimalInfo()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 2,
                Quantity = 10,
                Reason = null // Optional reason
            };
        }

        public static CreatePurchaseRequestRequest GetInvalidCreateRequest_ZeroQuantity()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 1,
                Quantity = 0,
                Reason = "Invalid quantity"
            };
        }

        public static CreatePurchaseRequestRequest GetInvalidCreateRequest_NegativeQuantity()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 1,
                Quantity = -5,
                Reason = "Invalid quantity"
            };
        }

        public static CreatePurchaseRequestRequest GetInvalidCreateRequest_PartNotFound()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 9999,
                Quantity = 10,
                Reason = "Part not found"
            };
        }

        public static CreatePurchaseRequestRequest GetInvalidCreateRequest_DuplicatePending()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 2, // Already has pending request (RequestId = 2)
                Quantity = 15,
                Reason = "Duplicate pending"
            };
        }

        public static CreatePurchaseRequestRequest GetInvalidCreateRequest_LongReason()
        {
            return new CreatePurchaseRequestRequest
            {
                PartId = 1,
                Quantity = 10,
                Reason = new string('A', 501) // Exceed 500 chars
            };
        }

        public static UpdatePurchaseRequestRequest GetValidUpdateRequest()
        {
            return new UpdatePurchaseRequestRequest
            {
                Quantity = 35,
                Reason = "Cập nhật số lượng yêu cầu"
            };
        }

        public static UpdatePurchaseRequestRequest GetInvalidUpdateRequest_ZeroQuantity()
        {
            return new UpdatePurchaseRequestRequest
            {
                Quantity = 0,
                Reason = "Invalid update"
            };
        }
    }
}
