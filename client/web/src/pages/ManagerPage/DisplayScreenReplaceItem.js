import React, { useState, useEffect } from 'react';
import { Layout, Select, Card, Typography, Table, Badge, Row, Col, Space } from 'antd';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DisplayScreenReplaceItem = () => {
  const [selectedLine, setSelectedLine] = useState('31612-MCV-E assy');
  const [lineFilter, setLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const data = [
    // 🔴 TRƯỜNG HỢP QUÁ HẠN (>100%) - Nguy hiểm!
    {
      line: '31612-MCV-E assy',
      stage: 'KT rò trong và đặc tính PH',
      component: 'Connector',
      code: '7283-7050-30',
      limit: 50000,
      used: 168292,
      unit: 'PCS',
      lastChange: '10/08/2024',
      changeCount: 5
    },

    // 🟡 TRƯỜNG HỢP ĐẾN HẠN (80-100%) - Cảnh báo!
    {
      line: '31612-MCV-E assy',
      stage: 'Kiểm tra rò ngoài',
      component: 'Jig đổi mã 5W',
      code: 'JIG-5W-001',
      limit: 100000,
      used: 89500,
      unit: 'PCS',
      lastChange: '15/09/2024',
      changeCount: 2
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Bushing và collar',
      component: 'Kim bấm số 3',
      code: 'PIN-003-SA',
      limit: 200000,
      used: 175000,
      unit: 'PCS',
      lastChange: '20/07/2024',
      changeCount: 4
    },

    // 🔵 TRƯỜNG HỢP CHƯA ĐẾN HẠN (<80%) - An toàn
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Valve SA',
      component: 'Jig đổi mã 5W',
      code: 'JIG-5W-002',
      limit: 50000,
      used: 11287,
      unit: 'PCS',
      lastChange: '01/10/2024',
      changeCount: 1
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Shaft SA 5W',
      component: 'Jig đổi mã 0080',
      code: 'JIG-0080-A',
      limit: 50000,
      used: 10745,
      unit: 'PCS',
      lastChange: '05/10/2024',
      changeCount: 1
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Kiểm tra rò ngoặc',
      component: 'Dẫn hướng',
      code: null,
      limit: 12,
      used: 2.3,
      unit: 'Tháng',
      lastChange: '15/08/2024',
      changeCount: 3
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Bushing và collar',
      component: 'Dẫn hướng jig lắp BS-3W',
      code: 'DH-BS3W-05',
      limit: 12,
      used: 0.5,
      unit: 'Tháng',
      lastChange: '01/10/2024',
      changeCount: 1
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Valve SA',
      component: 'Trụ shaft',
      code: 'SHAFT-PILLAR-12',
      limit: 250000,
      used: 12500,
      unit: 'PCS',
      lastChange: '12/09/2024',
      changeCount: 2
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Lắp Valve SA',
      component: 'Jig set shaft',
      code: 'JIG-SHAFT-SET-A',
      limit: 250000,
      used: 8200,
      unit: 'PCS',
      lastChange: '18/09/2024',
      changeCount: 1
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Đóng gói sản phẩm',
      component: 'Khuôn đóng gói',
      code: 'MOLD-PKG-07',
      limit: 500000,
      used: 125000,
      unit: 'PCS',
      lastChange: '05/08/2024',
      changeCount: 3
    },
    {
      line: '31612-MCV-E assy',
      stage: 'In mã QR',
      component: 'Đầu in laser',
      code: 'LASER-HEAD-203',
      limit: 1000000,
      used: 450000,
      unit: 'PCS',
      lastChange: '01/07/2024',
      changeCount: 6
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Kiểm tra điện',
      component: 'Đầu đo điện trở',
      code: 'PROBE-RES-18',
      limit: 150000,
      used: 32000,
      unit: 'PCS',
      lastChange: '22/09/2024',
      changeCount: 2
    },
    {
      line: '31612-MCV-E assy',
      stage: 'Bôi keo',
      component: 'Kim phun keo',
      code: 'GLUE-NOZZLE-5mm',
      limit: 80000,
      used: 15600,
      unit: 'PCS',
      lastChange: '28/09/2024',
      changeCount: 4
    },

    // DÂY CHUYỀN MỚI: 31612-ABC-E assy
    {
      line: '31612-ABC-E assy',
      stage: 'Kiểm tra áp suất',
      component: 'Sensor áp suất',
      code: 'PRESS-SEN-101',
      limit: 75000,
      used: 82500,
      unit: 'PCS',
      lastChange: '12/09/2024',
      changeCount: 3
    },
    {
      line: '31612-ABC-E assy',
      stage: 'Lắp Motor ABC',
      component: 'Bearing chính',
      code: 'BEAR-MAIN-205',
      limit: 300000,
      used: 285000,
      unit: 'PCS',
      lastChange: '08/08/2024',
      changeCount: 7
    },
    {
      line: '31612-ABC-E assy',
      stage: 'Test điện tử',
      component: 'Probe test',
      code: 'PROBE-TEST-88',
      limit: 120000,
      used: 25000,
      unit: 'PCS',
      lastChange: '25/09/2024',
      changeCount: 1
    },
    {
      line: '31612-ABC-E assy',
      stage: 'Bôi dầu mỡ',
      component: 'Đầu phun dầu',
      code: 'OIL-NOZZLE-12',
      limit: 60000,
      used: 48000,
      unit: 'PCS',
      lastChange: '15/08/2024',
      changeCount: 4
    },
    {
      line: '31612-ABC-E assy',
      stage: 'Kiểm tra rung động',
      component: 'Sensor rung',
      code: 'VIB-SEN-303',
      limit: 90000,
      used: 15500,
      unit: 'PCS',
      lastChange: '30/09/2024',
      changeCount: 2
    },

    // DÂY CHUYỀN MỚI: 42150-XYZ-D assy
    {
      line: '42150-XYZ-D assy',
      stage: 'Gia công CNC',
      component: 'Dao phay carbide',
      code: 'CARB-MILL-25',
      limit: 25000,
      used: 28500,
      unit: 'PCS',
      lastChange: '10/09/2024',
      changeCount: 8
    },
    {
      line: '42150-XYZ-D assy',
      stage: 'Mài tinh',
      component: 'Đá mài kim cương',
      code: 'DIAM-WHEEL-80',
      limit: 15000,
      used: 13200,
      unit: 'PCS',
      lastChange: '18/09/2024',
      changeCount: 5
    },
    {
      line: '42150-XYZ-D assy',
      stage: 'Kiểm tra kích thước',
      component: 'Đầu đo CMM',
      code: 'CMM-PROBE-2024',
      limit: 200000,
      used: 45000,
      unit: 'PCS',
      lastChange: '28/09/2024',
      changeCount: 2
    },
    {
      line: '42150-XYZ-D assy',
      stage: 'Rửa siêu âm',
      component: 'Transducer siêu âm',
      code: 'ULTRA-TRANS-40K',
      limit: 100000,
      used: 165000,
      unit: 'PCS',
      lastChange: '05/08/2024',
      changeCount: 6
    },
    {
      line: '42150-XYZ-D assy',
      stage: 'Đóng gói xuất',
      component: 'Máy hàn miệng túi',
      code: 'SEAL-MACHINE-X1',
      limit: 500000,
      used: 125000,
      unit: 'PCS',
      lastChange: '20/09/2024',
      changeCount: 3
    }
  ];

  const calculateStatus = (used, limit) => {
    const percent = (used / limit) * 100;
    if (percent > 100) return { status: 'critical', color: '#e74c3c', rowClass: 'row-critical' };
    if (percent >= 80) return { status: 'warning', color: '#f39c12', rowClass: 'row-warning' };
    return { status: 'safe', color: '#2980b9', rowClass: '' };
  };

  const applyFilters = () => {
    let filtered = data;

    if (statusFilter) {
      filtered = filtered.filter(item => {
        const status = calculateStatus(item.used, item.limit);
        return status.status === statusFilter;
      });
    }

    if (componentFilter) {
      filtered = filtered.filter(item => item.component.includes(componentFilter));
    }

    if (codeFilter) {
      filtered = filtered.filter(item => item.code && item.code.includes(codeFilter));
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, componentFilter, codeFilter]);

  // Hàm để lấy dữ liệu theo từng dây chuyền
  const getDataByLine = (lineName) => {
    let lineData = data.filter(item => item.line === lineName);
    
    if (statusFilter) {
      lineData = lineData.filter(item => {
        const status = calculateStatus(item.used, item.limit);
        return status.status === statusFilter;
      });
    }

    if (componentFilter) {
      lineData = lineData.filter(item => item.component.includes(componentFilter));
    }

    if (codeFilter) {
      lineData = lineData.filter(item => item.code && item.code.includes(codeFilter));
    }

    return lineData;
  };

  // Hàm để lấy thống kê theo từng dây chuyền
  const getStatusCountsByLine = (lineName) => {
    const lineData = getDataByLine(lineName);
    const counts = { safe: 0, warning: 0, critical: 0 };
    lineData.forEach(item => {
      const status = calculateStatus(item.used, item.limit);
      counts[status.status]++;
    });
    return counts;
  };

  // Danh sách các dây chuyền
  const productionLines = [
    '31612-MCV-E assy',
    '31612-ABC-E assy', 
    '42150-XYZ-D assy',
    'Tất cả dây chuyền'
  ];

  const getStatusCounts = () => {
    const counts = { safe: 0, warning: 0, critical: 0 };
    filteredData.forEach(item => {
      const status = calculateStatus(item.used, item.limit);
      counts[status.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (text, record, index) => index + 1,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 60,
      align: 'center',
      render: (text, record) => {
        const status = calculateStatus(record.used, record.limit);
        return (
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: status.color,
            margin: '0 auto'
          }}></div>
        );
      }
    },
    {
      title: 'Dây chuyền',
      dataIndex: 'line',
      key: 'line',
      width: 150
    },
    {
      title: 'Công đoạn sử dụng',
      dataIndex: 'stage',
      key: 'stage',
      width: 200
    },
    {
      title: 'Tên LK tiêu hao',
      dataIndex: 'component',
      key: 'component',
      width: 150
    },
    {
      title: 'Mã LK tiêu hao',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text) => text || '—'
    },
    {
      title: 'Định mức / Chu kỳ thay',
      dataIndex: 'limit',
      key: 'limit',
      width: 150,
      render: (text, record) => `${text.toLocaleString()} (${record.unit})`
    },
    {
      title: 'Số lượng đã dùng',
      dataIndex: 'used',
      key: 'used',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text.toLocaleString()} ({record.unit})</div>
          <span style={{ 
            fontSize: '11px', 
            color: '#666', 
            display: 'block', 
            marginTop: '2px' 
          }}>
            {((text / record.limit) * 100).toFixed(1)}% đã dùng
          </span>
        </div>
      )
    },
    {
      title: '% Sử dụng',
      dataIndex: 'percent',
      key: 'percent',
      width: 100,
      render: (text, record) => (
        <strong>{((record.used / record.limit) * 100).toFixed(1)}%</strong>
      ),
      align: 'center'
    },
    {
      title: 'Ngày thay gần nhất',
      dataIndex: 'lastChange',
      key: 'lastChange',
      width: 130,
      align: 'center'
    },
    {
      title: 'Số lần thay thế',
      dataIndex: 'changeCount',
      key: 'changeCount',
      width: 120,
      align: 'center'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>

      <Content style={{ padding: 0 }}>
        {/* Filter Section */}
        <div style={{
          backgroundColor: '#e8e8e8',
          padding: '15px 20px',
          display: 'flex',
          gap: '30px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <label style={{ 
              fontWeight: 'bold', 
              color: '#333', 
              whiteSpace: 'nowrap' 
            }}>
              Trạng thái:
            </label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ 
                minWidth: '150px',
                backgroundColor: 'white'
              }}
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="safe">🔵 Chưa đến hạn (&lt;80%)</Option>
              <Option value="warning">🟡 Đến hạn (80-100%)</Option>
              <Option value="critical">🔴 Quá hạn (&gt;100%)</Option>
            </Select>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <label style={{ 
              fontWeight: 'bold', 
              color: '#333', 
              whiteSpace: 'nowrap' 
            }}>
              Tên LK tiêu hao:
            </label>
            <Select
              value={componentFilter}
              onChange={setComponentFilter}
              style={{ 
                minWidth: '150px',
                backgroundColor: 'white'
              }}
            >
              <Option value="">Tất cả linh kiện</Option>
              <Option value="Connector">Connector</Option>
              <Option value="Jig">Jig đổi mã</Option>
              <Option value="Dẫn hướng">Dẫn hướng</Option>
              <Option value="Trụ shaft">Trụ shaft</Option>
              <Option value="Kim">Kim bấm</Option>
              <Option value="Sensor">Sensor</Option>
              <Option value="Bearing">Bearing</Option>
              <Option value="Probe">Probe</Option>
              <Option value="Dao">Dao phay</Option>
              <Option value="Đá mài">Đá mài</Option>
              <Option value="Transducer">Transducer</Option>
              <Option value="Máy hàn">Máy hàn</Option>
            </Select>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <label style={{ 
              fontWeight: 'bold', 
              color: '#333', 
              whiteSpace: 'nowrap' 
            }}>
              Mã LK tiêu hao:
            </label>
            <Select
              value={codeFilter}
              onChange={setCodeFilter}
              style={{ 
                minWidth: '150px',
                backgroundColor: 'white'
              }}
            >
              <Option value="">Tất cả mã LK</Option>
              <Option value="7283-7050-30">7283-7050-30</Option>
              <Option value="JIG-5W">JIG-5W</Option>
              <Option value="PIN-003-SA">PIN-003-SA</Option>
              <Option value="DH-BS3W-05">DH-BS3W-05</Option>
              <Option value="SHAFT-PILLAR-12">SHAFT-PILLAR-12</Option>
              <Option value="MOLD-PKG-07">MOLD-PKG-07</Option>
              <Option value="LASER-HEAD-203">LASER-HEAD-203</Option>
              <Option value="PROBE-RES-18">PROBE-RES-18</Option>
              <Option value="GLUE-NOZZLE-5mm">GLUE-NOZZLE-5mm</Option>
              <Option value="PRESS-SEN-101">PRESS-SEN-101</Option>
              <Option value="BEAR-MAIN-205">BEAR-MAIN-205</Option>
              <Option value="PROBE-TEST-88">PROBE-TEST-88</Option>
              <Option value="OIL-NOZZLE-12">OIL-NOZZLE-12</Option>
              <Option value="VIB-SEN-303">VIB-SEN-303</Option>
              <Option value="CARB-MILL-25">CARB-MILL-25</Option>
              <Option value="DIAM-WHEEL-80">DIAM-WHEEL-80</Option>
              <Option value="CMM-PROBE-2024">CMM-PROBE-2024</Option>
              <Option value="ULTRA-TRANS-40K">ULTRA-TRANS-40K</Option>
              <Option value="SEAL-MACHINE-X1">SEAL-MACHINE-X1</Option>
            </Select>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: '#856404', 
            marginBottom: '10px', 
            fontSize: '18px' 
          }}>
            📊 Mục đích của trang: Quản lý Bảo trì Dự phòng (Preventive Maintenance)
          </h3>
          <ul style={{ 
            marginLeft: '20px', 
            color: '#856404' 
          }}>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Theo dõi tuổi thọ linh kiện:</strong> Mỗi linh kiện có giới hạn sử dụng (ví dụ: Connector chỉ dùng được 50,000 sản phẩm)
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Cảnh báo sớm:</strong> 🟡 Vàng (80-100%) = Chuẩn bị linh kiện thay thế | 🔴 Đỏ (&gt;100%) = Khẩn cấp phải thay ngay!
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Tránh dừng máy:</strong> Thay linh kiện theo kế hoạch thay vì chờ hỏng mới thay (gây thiệt hại lớn)
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Quản lý chi phí:</strong> Biết được tần suất thay, chi phí bảo trì hàng tháng/năm
            </li>
          </ul>
        </div>

        {/* Title Section */}

        {/* Render Tables for Each Production Line */}
        {productionLines.slice(0, -1).map((lineName, index) => {
          const lineData = getDataByLine(lineName);
          const lineCounts = getStatusCountsByLine(lineName);
          
          return (
            <div key={lineName} style={{ marginBottom: '40px' }}>
              {/* Title Section for Each Line */}
              <div style={{
                backgroundColor: '#d0d0d0',
                padding: '20px',
                textAlign: 'center',
                margin: '20px'
              }}>
                <h1 style={{
                  fontSize: '28px',
                  color: '#2c3e50',
                  marginBottom: '15px',
                  margin: '0 0 15px 0'
                }}>
                  Trạng thái linh kiện thay thế dây chuyền <span style={{ 
                    color: '#2980b9', 
                    fontWeight: 'bold' 
                  }}>{lineName}</span>
                </h1>

                {/* Legend for Each Line */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '30px',
                  margin: '15px 0',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#2980b9'
                    }}></div>
                    <span>Chưa đến hạn: &lt; 80% định mức (An toàn)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#f39c12'
                    }}></div>
                    <span>Đến hạn: 80-100% (Chuẩn bị thay)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#e74c3c'
                    }}></div>
                    <span>Quá hạn: &gt; 100% (Thay ngay!)</span>
                  </div>
                </div>

                {/* Status Summary for This Line */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      margin: '0 auto 5px',
                      backgroundColor: '#2980b9'
                    }}></div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Chưa đến hạn {lineCounts.safe}/{lineData.length} (pcs)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      margin: '0 auto 5px',
                      backgroundColor: '#f39c12'
                    }}></div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Đến hạn {lineCounts.warning}/{lineData.length} (pcs)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      margin: '0 auto 5px',
                      backgroundColor: '#e74c3c'
                    }}></div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      Quá hạn {lineCounts.critical}/{lineData.length} (pcs)
                    </div>
                  </div>
                </div>
              </div>

              {/* Table for This Line */}
              <div style={{
                margin: '20px',
                backgroundColor: 'white',
                borderRadius: '5px',
                overflowX: 'auto',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                <Table
                  columns={columns}
                  dataSource={lineData}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} linh kiện`,
                    position: ['bottomCenter']
                  }}
                  scroll={{ x: 1200 }}
                  size="middle"
                  rowClassName={(record) => calculateStatus(record.used, record.limit).rowClass}
                  components={{
                    header: {
                      cell: (props) => (
                        <th 
                          {...props} 
                          style={{
                            backgroundColor: '#334766',
                            color: 'white',
                            padding: '12px 8px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            borderRight: '1px solid rgba(255,255,255,0.2)',
                            whiteSpace: 'nowrap',
                            ...(props.style || {})
                          }}
                        />
                      )
                    },
                    body: {
                      cell: (props) => (
                        <td 
                          {...props} 
                          style={{
                            padding: '10px 8px',
                            fontSize: '13px',
                            color: '#333',
                            borderRight: '1px solid #e0e0e0',
                            borderBottom: '1px solid #e0e0e0',
                            ...(props.style || {})
                          }}
                        />
                      ),
                      row: (props) => (
                        <tr 
                          {...props} 
                          style={{
                            ...(props.style || {}),
                            borderBottom: '1px solid #e0e0e0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9f9f9';
                          }}
                          onMouseLeave={(e) => {
                            const record = lineData[props['data-row-key']];
                            if (record) {
                              const status = calculateStatus(record.used, record.limit);
                              if (status.rowClass === 'row-critical') {
                                e.currentTarget.style.backgroundColor = '#ffe6e6';
                              } else if (status.rowClass === 'row-warning') {
                                e.currentTarget.style.backgroundColor = '#fff8e6';
                              } else {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }
                          }}
                        />
                      )
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </Content>
      
      <style jsx global>{`
        .row-critical {
          background-color: #ffe6e6 !important;
        }
        .row-warning {
          background-color: #fff8e6 !important;
        }
        .ant-table-thead > tr > th:last-child {
          border-right: none !important;
        }
        .ant-table-tbody > tr > td:last-child {
          border-right: none !important;
        }
      `}</style>
    </Layout>
  );
};

export default DisplayScreenReplaceItem;