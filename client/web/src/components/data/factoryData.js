export const mechanicalData = [
  {
    className: 'area-container area-top-left',
    boxes: [
      { code: 'MCCB1', oee: '85.2', availability: '92.1', performance: '92.5', quality: '98.7', status: 'Running', colorClass: 'box-green' },
      { code: 'MCB1', oee: '72.5', availability: '88.3', performance: '82.1', quality: '97.4', status: 'Running', colorClass: 'box-yellow' }
    ]
  },
  {
    className: 'area-container area-top-right',
    boxes: [
      {
        code: 'RCBO1',
        oee: '45.8',
        availability: '65.2',
        performance: '70.4',
        quality: '95.8',
        status: 'Down',
        colorClass: 'box-red',
        incident: {
          hours: '2.3',
          equipmentCode: 'EQ-RCBO-001',
          equipmentName: 'RCBO Breaker Machine',
          stage: 'Assembly',
          line: 'RCBO1',
          startTime: '2025-10-24 14:25:30',
          assignee: 'Nguyen Van A'
        }
      },
      { code: 'ARO1', oee: '90.1', availability: '94.7', performance: '95.2', quality: '99.1', status: 'Running', colorClass: 'box-green' },
      { code: 'OFF1', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' }
    ]
  },
  {
    className: 'area-empty',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-left',
    boxes: [
      { code: 'ARB1', oee: '68.3', availability: '85.6', performance: '79.8', quality: '96.2', status: 'Running', colorClass: 'box-yellow' },
      { code: 'VKE1', oee: '88.7', availability: '91.4', performance: '97.1', quality: '98.9', status: 'Running', colorClass: 'box-green' },
      {
        code: 'VKN1',
        oee: '52.4',
        availability: '72.8',
        performance: '72.1',
        quality: '94.7',
        status: 'Down',
        colorClass: 'box-red',
        incident: {
          hours: '1.8',
          equipmentCode: 'EQ-VKN-002',
          equipmentName: 'VKN Cutting Machine',
          stage: 'Cutting',
          line: 'VKN1',
          startTime: '2025-10-24 15:45:12',
          assignee: 'Tran Thi B'
        }
      },
      { code: 'GN1', oee: '86.5', availability: '89.2', performance: '96.8', quality: '99.3', status: 'Running', colorClass: 'box-green' }
    ]
  },
  {
    className: 'area-container area-center-right',
    boxes: [
      { code: 'OKOM1', oee: '71.8', availability: '87.9', performance: '81.7', quality: '97.1', status: 'Running', colorClass: 'box-yellow' },
      { code: 'KN202C1', oee: '46.2', availability: '68.4', performance: '67.5', quality: '95.4', status: 'Down', colorClass: 'box-red' }
    ]
  },
  {
    className: 'area-container area-bottom-left',
    boxes: [
      { code: 'G631', oee: '89.4', availability: '92.7', performance: '96.5', quality: '98.8', status: 'Running', colorClass: 'box-green' },
      { code: 'OFF2', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' },
      { code: 'A1251', oee: '69.7', availability: '86.1', performance: '80.9', quality: '96.8', status: 'Running', colorClass: 'box-yellow' },
      { code: 'G1251', oee: '87.3', availability: '90.5', performance: '96.2', quality: '99.0', status: 'Running', colorClass: 'box-green' }
    ]
  },
  {
    className: 'area-container area-bottom-right',
    boxes: [
      { code: 'CDKH1', oee: '53.1', availability: '71.9', performance: '73.8', quality: '95.1', status: 'Down', colorClass: 'box-red' },
      { code: 'CK011', oee: '84.9', availability: '88.6', performance: '95.4', quality: '98.5', status: 'Running', colorClass: 'box-green' },
      { code: 'CK021', oee: '73.2', availability: '89.7', performance: '81.9', quality: '97.3', status: 'Running', colorClass: 'box-yellow' }
    ]
  }
]
export const assemblyData = [
  {
    className: 'area-container area-top-full',
    boxes: [
      { code: 'MCCB1', oee: '85.2', availability: '92.1', performance: '92.5', quality: '98.7', status: 'Running', colorClass: 'box-green' },
      { code: 'MCB1', oee: '72.5', availability: '88.3', performance: '82.1', quality: '97.4', status: 'Running', colorClass: 'box-yellow' },
      { code: 'RCBO1', oee: '45.8', availability: '65.2', performance: '70.4', quality: '95.8', status: 'Down', colorClass: 'box-red' },
      { code: 'ARO1', oee: '90.1', availability: '94.7', performance: '95.2', quality: '99.1', status: 'Running', colorClass: 'box-green' },
      { code: 'OFF1', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' }
    ]
  },
  {
    className: 'area-empty-right',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-full',
    boxes: [
      { code: 'ARB1', oee: '68.3', availability: '85.6', performance: '79.8', quality: '96.2', status: 'Running', colorClass: 'box-yellow' },
      { code: 'VKE1', oee: '88.7', availability: '91.4', performance: '97.1', quality: '98.9', status: 'Running', colorClass: 'box-green' },
      { code: 'VKN1', oee: '52.4', availability: '72.8', performance: '72.1', quality: '94.7', status: 'Down', colorClass: 'box-red' },
      { code: 'GN1', oee: '86.5', availability: '89.2', performance: '96.8', quality: '99.3', status: 'Running', colorClass: 'box-green' },
      { code: 'OKOM1', oee: '71.8', availability: '87.9', performance: '81.7', quality: '97.1', status: 'Running', colorClass: 'box-yellow' }
    ]
  },
  {
    className: 'area-container area-bottom-left',
    boxes: [
      { code: 'G631', oee: '89.4', availability: '92.7', performance: '96.5', quality: '98.8', status: 'Running', colorClass: 'box-green' },
      { code: 'OFF2', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' },
      { code: 'A1251', oee: '69.7', availability: '86.1', performance: '80.9', quality: '96.8', status: 'Running', colorClass: 'box-yellow' },
      { code: 'G1251', oee: '87.3', availability: '90.5', performance: '96.2', quality: '99.0', status: 'Running', colorClass: 'box-green' }
    ]
  },
  {
    className: 'area-container area-bottom-right',
    boxes: [
      { code: 'CDKH1', oee: '53.1', availability: '71.9', performance: '73.8', quality: '95.1', status: 'Down', colorClass: 'box-red' },
      { code: 'CK011', oee: '84.9', availability: '88.6', performance: '95.4', quality: '98.5', status: 'Running', colorClass: 'box-green' },
      { code: 'CK021', oee: '73.2', availability: '89.7', performance: '81.9', quality: '97.3', status: 'Running', colorClass: 'box-yellow' },
      { code: 'CK031', oee: '44.5', availability: '66.3', performance: '67.2', quality: '94.9', status: 'Down', colorClass: 'box-red' },
      { code: 'CK041', oee: '91.6', availability: '95.1', performance: '96.1', quality: '99.4', status: 'Running', colorClass: 'box-green' },
      { code: 'ASM21', oee: '53.2', availability: '72.5', performance: '73.6', quality: '95.3', status: 'Down', colorClass: 'box-red' },
      { code: 'ASM22', oee: '89.8', availability: '93.2', performance: '96.1', quality: '98.8', status: 'Running', colorClass: 'box-green' },
      { code: 'ASM23', oee: '74.5', availability: '90.8', performance: '82.3', quality: '97.6', status: 'Running', colorClass: 'box-yellow' }
    ]
  }
]
export const wireData = [
  {
    className: 'area-container area-top-center',
    boxes: [
      { code: 'WIRE1', oee: '84.7', availability: '91.8', performance: '92.2', quality: '98.6', status: 'Running', colorClass: 'box-green' },
      { code: 'WIRE2', oee: '76.4', availability: '89.1', performance: '85.6', quality: '97.8', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE3', oee: '57.2', availability: '74.5', performance: '76.8', quality: '96.1', status: 'Down', colorClass: 'box-red' }
    ]
  },
  {
    className: 'area-container area-top-sides',
    boxes: [
      { code: 'WIRE4', oee: '92.8', availability: '96.2', performance: '96.3', quality: '99.6', status: 'Running', colorClass: 'box-green' },
      { code: 'OFFW1', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' }
    ]
  },
  {
    className: 'area-container area-top-sides-right',
    boxes: [
      { code: 'WIRE5', oee: '70.9', availability: '87.4', performance: '81.2', quality: '97.0', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE6', oee: '88.5', availability: '92.1', performance: '96.0', quality: '98.9', status: 'Running', colorClass: 'box-green' }
    ]
  },
  {
    className: 'area-empty-center',
    isEmpty: true,
    boxes: []
  },
  {
    className: 'area-container area-center-left',
    boxes: [
      { code: 'WIRE7', oee: '50.6', availability: '70.9', performance: '71.3', quality: '95.2', status: 'Down', colorClass: 'box-red' },
      { code: 'WIRE8', oee: '90.4', availability: '93.7', performance: '96.6', quality: '99.0', status: 'Running', colorClass: 'box-green' },
      { code: 'WIRE9', oee: '74.7', availability: '90.3', performance: '82.8', quality: '97.4', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE10', oee: '48.3', availability: '69.6', performance: '69.5', quality: '94.9', status: 'Down', colorClass: 'box-red' }
    ]
  },
  {
    className: 'area-container area-center-right',
    boxes: [
      { code: 'WIRE11', oee: '89.9', availability: '92.8', performance: '96.9', quality: '98.7', status: 'Running', colorClass: 'box-green' },
      { code: 'OFFW2', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' },
      { code: 'WIRE12', oee: '67.5', availability: '84.2', performance: '79.8', quality: '96.4', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE13', oee: '86.1', availability: '89.5', performance: '96.3', quality: '98.5', status: 'Running', colorClass: 'box-green' }
    ]
  },
  {
    className: 'area-container area-bottom-full',
    boxes: [
      { code: 'WIRE14', oee: '54.8', availability: '73.7', performance: '74.6', quality: '95.4', status: 'Down', colorClass: 'box-red' },
      { code: 'WIRE15', oee: '91.7', availability: '95.3', performance: '96.2', quality: '99.3', status: 'Running', colorClass: 'box-green' },
      { code: 'WIRE16', oee: '72.3', availability: '88.6', performance: '81.6', quality: '97.2', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE17', oee: '49.1', availability: '70.4', performance: '69.8', quality: '95.0', status: 'Down', colorClass: 'box-red' },
      { code: 'WIRE18', oee: '93.2', availability: '96.5', performance: '96.8', quality: '99.4', status: 'Running', colorClass: 'box-green' },
      { code: 'OFFW3', oee: '-', availability: '-', performance: '-', quality: '-', status: 'Office', colorClass: 'box-white' },
      { code: 'WIRE19', oee: '69.4', availability: '86.1', performance: '80.3', quality: '96.8', status: 'Running', colorClass: 'box-yellow' },
      { code: 'WIRE20', oee: '87.8', availability: '91.2', performance: '96.0', quality: '98.6', status: 'Running', colorClass: 'box-green' },
      { code: 'WIRE21', oee: '52.9', availability: '72.3', performance: '73.2', quality: '95.1', status: 'Down', colorClass: 'box-red' },
      { code: 'WIRE22', oee: '90.6', availability: '94.1', performance: '96.1', quality: '98.9', status: 'Running', colorClass: 'box-green' },
      { code: 'WIRE23', oee: '75.2', availability: '91.5', performance: '82.5', quality: '97.7', status: 'Running', colorClass: 'box-yellow' }
    ]
  }
]