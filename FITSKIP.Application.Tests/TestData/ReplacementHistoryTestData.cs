using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using System;
using System.Collections.Generic;

namespace FITSKIP.Application.Tests.TestData
{
    public static class ReplacementHistoryTestData
    {
        public static List<SparePart> GetTestSpareParts()
        {
            return new List<SparePart>
            {
                new SparePart
                {
                    PartId = 1,
                    PartName = "Bạc đạn A",
                    Quantity = 100,
                    MinQuantity = 10,
                    IsActive = true
                },
                new SparePart
                {
                    PartId = 2,
                    PartName = "Vòng bi B",
                    Quantity = 50,
                    MinQuantity = 5,
                    IsActive = true
                },
                new SparePart
                {
                    PartId = 3,
                    PartName = "Phớt dầu C",
                    Quantity = 0,
                    MinQuantity = 10,
                    IsActive = false
                }
            };
        }

        public static List<ReplacementHistory> GetTestReplacementHistories()
        {
            return new List<ReplacementHistory>
            {
                new ReplacementHistory
                {
                    ReplacementId = 1,
                    EquipmentId = 1,
                    IncidentId = 1,
                    PartId = 1,
                    Quantity = 5,
                    ReplacedDate = DateTime.Now.AddDays(-5),
                    ReplacedBy = "TECH001",
                    ActualQuantityUsed = 3,
                    QuantityToReturn = 2,
                    ReturnedDate = DateTime.Now.AddDays(-4),
                    ReturnConfirmedBy = "ADMIN001",
                    Status = "Hoàn tất"
                },
                new ReplacementHistory
                {
                    ReplacementId = 2,
                    EquipmentId = 2,
                    IncidentId = 2,
                    PartId = 2,
                    Quantity = 10,
                    ReplacedDate = DateTime.Now.AddDays(-2),
                    ReplacedBy = "TECH002",
                    ActualQuantityUsed = 10,
                    QuantityToReturn = 0,
                    ReturnedDate = null,
                    ReturnConfirmedBy = null,
                    Status = "Đã xuất"
                },
                new ReplacementHistory
                {
                    ReplacementId = 3,
                    EquipmentId = 1,
                    IncidentId = null,
                    WorkOrderId = 1,
                    PartId = 1,
                    Quantity = 8,
                    ReplacedDate = DateTime.Now.AddDays(-1),
                    ReplacedBy = "TECH001",
                    ActualQuantityUsed = null,
                    QuantityToReturn = null,
                    ReturnedDate = null,
                    ReturnConfirmedBy = null,
                    Status = "Đã xuất"
                }
            };
        }

        public static ReplacementHistory GetValidCreateRequest()
        {
            return new ReplacementHistory
            {
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 1,
                Quantity = 5,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH001",
                Status = "Đã xuất"
            };
        }

        public static ReplacementHistory GetValidCreateRequest_WithWorkOrder()
        {
            return new ReplacementHistory
            {
                EquipmentId = 2,
                WorkOrderId = 1,
                PartId = 2,
                Quantity = 3,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH002",
                Status = "Đã xuất"
            };
        }

        public static ReplacementHistory GetInvalidCreateRequest_NegativeQuantity()
        {
            return new ReplacementHistory
            {
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 1,
                Quantity = -5,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH001"
            };
        }

        public static ReplacementHistory GetInvalidCreateRequest_ZeroQuantity()
        {
            return new ReplacementHistory
            {
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 1,
                Quantity = 0,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH001"
            };
        }

        public static ReplacementHistory GetInvalidCreateRequest_PartNotFound()
        {
            return new ReplacementHistory
            {
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 9999,
                Quantity = 5,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH001"
            };
        }

        public static ReplacementHistory GetInvalidCreateRequest_InactivePart()
        {
            return new ReplacementHistory
            {
                EquipmentId = 1,
                IncidentId = 1,
                PartId = 3,
                Quantity = 5,
                ReplacedDate = DateTime.Now,
                ReplacedBy = "TECH001"
            };
        }

        public static ReplacementHistory GetValidUpdateRequest()
        {
            return new ReplacementHistory
            {
                ReplacementId = 2,
                EquipmentId = 2,
                IncidentId = 2,
                PartId = 2,
                Quantity = 12,
                ReplacedDate = DateTime.Now.AddDays(-2),
                ReplacedBy = "TECH002",
                ActualQuantityUsed = 10,
                QuantityToReturn = 2,
                Status = "Đã trả một phần"
            };
        }

        public static ReplacementHistory GetValidUpdateRequest_FullReturn()
        {
            return new ReplacementHistory
            {
                ReplacementId = 3,
                EquipmentId = 1,
                WorkOrderId = 1,
                PartId = 1,
                Quantity = 8,
                ReplacedDate = DateTime.Now.AddDays(-1),
                ReplacedBy = "TECH001",
                ActualQuantityUsed = 0,
                QuantityToReturn = 8,
                Status = "Hoàn tất"
            };
        }

        public static ReturnConfirmationDto GetValidReturnConfirmation()
        {
            return new ReturnConfirmationDto
            {
                ActualQuantityUsed = 7,
                ReturnedDate = DateTime.Now,
                ReturnConfirmedBy = "ADMIN001"
            };
        }

        public static ReturnConfirmationDto GetValidReturnConfirmation_FullUsage()
        {
            return new ReturnConfirmationDto
            {
                ActualQuantityUsed = 10,
                ReturnedDate = DateTime.Now,
                ReturnConfirmedBy = "ADMIN001"
            };
        }

        public static ReturnConfirmationDto GetInvalidReturnConfirmation_ExcessUsage()
        {
            return new ReturnConfirmationDto
            {
                ActualQuantityUsed = 15,
                ReturnedDate = DateTime.Now,
                ReturnConfirmedBy = "ADMIN001"
            };
        }

        public static ReturnConfirmationDto GetValidReturnConfirmation_PartialReturn()
        {
            return new ReturnConfirmationDto
            {
                ActualQuantityUsed = 5,
                ReturnedDate = DateTime.Now,
                ReturnConfirmedBy = "ADMIN002"
            };
        }
    }
}
