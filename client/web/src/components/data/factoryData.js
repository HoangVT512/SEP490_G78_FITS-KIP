// Factory layout configuration - mapping LineID to box positions and structure
export const LINE_CONFIG = {
  1: { code: 'CK-C01', name: 'Gia công tiện / khoan / phay', factory: 'mechanical' },
  2: { code: 'CK-C02', name: 'Dập / uốn / cắt tôn', factory: 'mechanical' },
  3: { code: 'CK-C03', name: 'Mạ / xử lý bề mặt', factory: 'mechanical' },
  4: { code: 'CK-C04', name: 'Hàn linh kiện cơ khí', factory: 'mechanical' },
  5: { code: 'CK-C05', name: 'Cắt dây kim loại & tấm', factory: 'mechanical' },
  6: { code: 'CK-C06', name: 'Đánh bóng & hoàn thiện', factory: 'mechanical' },
  7: { code: 'LR-L01', name: 'Lắp ráp thân & vỏ thiết bị', factory: 'assembly' },
  8: { code: 'LR-L02', name: 'Lắp linh kiện điện & đấu nối', factory: 'assembly' },
  9: { code: 'LR-L03', name: 'Thử chức năng điện – aptomat', factory: 'assembly' },
  10: { code: 'LR-L04', name: 'Lắp ráp quạt & thiết bị chiếu sáng', factory: 'assembly' },
  11: { code: 'LR-L05', name: 'Hàn & gắn phụ kiện', factory: 'assembly' },
  12: { code: 'LR-L06', name: 'Đóng gói sơ bộ & dán nhãn', factory: 'assembly' },
  13: { code: 'LR-L07', name: 'Kiểm tra cuối & đóng kiện xuất hàng', factory: 'assembly' },
  14: { code: 'DY-D01', name: 'Kéo / bện dây dẫn', factory: 'wire' },
  15: { code: 'DY-D02', name: 'Bọc cách điện PVC/XLPE', factory: 'wire' },
  16: { code: 'DY-D03', name: 'Máy tuốt đầu dây & cắt dây', factory: 'wire' },
  17: { code: 'DY-D04', name: 'Đánh cuộn & cuộn dây lớn', factory: 'wire' },
  18: { code: 'DY-D05', name: 'In nhãn & đóng gói dây/cáp', factory: 'wire' },
};

// Helper function to get color based on OEE value
export function getOEEColor(oee) {
  if (oee === null || oee === undefined || oee === 0) return '#FFFFFF'; // White for no data
  if (oee > 85) return '#4CAF50'; // Green
  if (oee >= 70) return '#FFEB3B'; // Yellow
  return '#F44336'; // Red
}

// Original layout structure preserved
export const mechanicalData = [
  {
    className: 'area-container area-top-left',
    lineIds: [1, 2] // CK-C01, CK-C02
  },
  {
    className: 'area-container area-top-right',
    lineIds: [3, 4], // CK-C03, CK-C04
    hasOffice: true
  },
  {
    className: 'area-empty',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-left',
    lineIds: [5, 6] // CK-C05, CK-C06
  },
  {
    className: 'area-container area-center-right',
    boxes: [
      { code: 'CK-C07', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Không sản xuất', colorClass: 'box-white' }
    ]
  }
];

export const assemblyData = [
  {
    className: 'area-container area-top-left',
    lineIds: [7, 8] // LR-L01, LR-L02
  },
  {
    className: 'area-container area-top-center',
    lineIds: [9] // LR-L03
  },
  {
    className: 'area-container area-top-right',
    lineIds: [10], // LR-L04
    hasOffice: true
  },
  {
    className: 'area-empty',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-left',
    lineIds: [11, 12] // LR-L05, LR-L06
  },
  {
    className: 'area-container area-center-right',
    lineIds: [13] // LR-L07
  }
];

export const wireData = [
  {
    className: 'area-container area-top-center',
    lineIds: [14, 15] // DY-D01, DY-D02
  },
  {
    className: 'area-container area-top-sides',
    lineIds: [16], // DY-D03
    hasOffice: true
  },
  {
    className: 'area-container area-top-sides-right',
    lineIds: [17, 18] // DY-D04, DY-D05
  },
  {
    className: 'area-empty-center',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-left',
    boxes: [
      { code: 'DY-D06', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Không sản xuất', colorClass: 'box-white' }
    ]
  },
  {
    className: 'area-container area-center-right',
    boxes: [
      { code: 'DY-D07', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Không sản xuất', colorClass: 'box-white' },
      { code: 'OFFW2', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' }
    ]
  }
];