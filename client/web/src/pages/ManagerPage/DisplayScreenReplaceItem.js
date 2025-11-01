import React, { useState, useEffect } from 'react';
import { Layout, Select, Table, Spin, message, Empty } from 'antd';
import { replacementStatisticsService } from '../../services/replacementStatisticsService';
import { lineService } from '../../services/lineService';
import { departmentService } from '../../services/departmentService';
import { authService } from '../../services/authService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Option } = Select;

const DisplayScreenReplaceItem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [selectedLines, setSelectedLines] = useState([]);
  
  const [allData, setAllData] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchUserAndLines();
  }, []);

  useEffect(() => {
    if (dataLoaded && selectedLines.length > 0) {
      loadAllStatistics();
    }
  }, [selectedLines, statusFilter, dataLoaded]);

  const fetchUserAndLines = async () => {
    try {
      setLoading(true);
      setDataLoaded(false);

      // Lấy thông tin user hiện tại
      let user = authService.getStoredUser();
      if (!user) {
        message.error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      // Nếu user không có departmentId, thử lấy từ API
      if (!user.departmentId && user.id) {
        try {
          const currentUserInfo = await authService.getCurrentUser();
          if (currentUserInfo && currentUserInfo.departmentId) {
            user.departmentId = currentUserInfo.departmentId;
          }
        } catch (deptError) {
          console.error('Lỗi lấy thông tin người dùng hiện tại:', deptError);
        }
      }

      setCurrentUser(user);

      // Lấy danh sách lines được phép xem dựa trên quyền
      let allowedLines = [];

      const isManager = user.roles && Array.isArray(user.roles) && user.roles.some(role =>
        role && typeof role === 'string' && role.includes('Quản lý')
      );

      // Luôn lấy lines mà user được assign trước
      let userAssignedLines = [];
      try {
        const userLinesResponse = await lineService.getLinesByUser(user.id);
        userAssignedLines = userLinesResponse.success ? userLinesResponse.data : (Array.isArray(userLinesResponse) ? userLinesResponse : []);
      } catch (lineError) {
        console.error('Lỗi lấy danh sách dây chuyền của người dùng:', lineError);
        userAssignedLines = [];
      }

      // Nếu là quản lý, lấy thêm tất cả lines trong phòng ban của họ
      let departmentLines = [];
      if (isManager) {
        try {
          const departments = await departmentService.getActiveDepartments();
          const managedDepartment = departments.find(dept => dept.managerId === user.id);

          if (managedDepartment) {
            const departmentLinesResponse = await lineService.getLinesByDepartment(managedDepartment.departmentId);
            departmentLines = departmentLinesResponse.success ? departmentLinesResponse.data : (Array.isArray(departmentLinesResponse) ? departmentLinesResponse : []);
          }
        } catch (lineError) {
          console.error('Lỗi lấy danh sách dây chuyền theo phòng ban:', lineError);
          departmentLines = [];
        }
      }

      // Merge user assigned lines và department lines, loại bỏ duplicate
      const allLineIds = new Set();
      const mergedLines = [];

      userAssignedLines.forEach(line => {
        if (!allLineIds.has(line.lineId)) {
          allLineIds.add(line.lineId);
          mergedLines.push(line);
        }
      });

      departmentLines.forEach(line => {
        if (!allLineIds.has(line.lineId)) {
          allLineIds.add(line.lineId);
          mergedLines.push(line);
        }
      });

      allowedLines = mergedLines;

      // Transform data
      const transformedLines = allowedLines.map(line => ({
        id: line.lineId.toString(),
        lineId: line.lineId,
        name: line.lineName,
        lineName: line.lineName,
        status: line.isActive ? 'active' : 'inactive'
      }));

      setProductionLines(transformedLines);

      // Mặc định chọn tất cả dây chuyền
      if (transformedLines.length > 0) {
        setSelectedLines(transformedLines.map(line => line.id));
      }

      setDataLoaded(true);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      message.error('Không thể tải danh sách dây chuyền');
    } finally {
      setLoading(false);
    }
  };

  const loadAllStatistics = async () => {
    try {
      setLoading(true);
      const promises = selectedLines.map(lineId => {
        const line = productionLines.find(l => l.id === lineId);
        return replacementStatisticsService.getStatistics({ 
          lineId: line ? line.lineId : parseInt(lineId),
          status: statusFilter || undefined 
        });
      });
      
      const results = await Promise.all(promises);
      const combinedData = results.flat().filter(Boolean);
      setAllData(combinedData);
    } catch (error) {
      console.error('Lỗi tải dữ liệu thống kê:', error);
      message.error('Không thể tải dữ liệu thống kê');
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (used, limit) => {
    const percent = (used / limit) * 100;
    if (percent > 100) return { status: 'critical', color: '#e74c3c', rowClass: 'row-critical' };
    if (percent >= 80) return { status: 'warning', color: '#f39c12', rowClass: 'row-warning' };
    return { status: 'safe', color: '#2980b9', rowClass: '' };
  };

  const getDataByLine = (lineId) => {
    let lineData = allData.filter(item => item.lineId === lineId);
    
    if (componentFilter) {
      lineData = lineData.filter(item => 
        item.partName && item.partName.toLowerCase().includes(componentFilter.toLowerCase())
      );
    }
    
    if (codeFilter) {
      lineData = lineData.filter(item => 
        item.partNumber && item.partNumber.toLowerCase().includes(codeFilter.toLowerCase())
      );
    }
    
    return lineData;
  };

  const getStatusCountsByLine = (lineId) => {
    const lineData = getDataByLine(lineId);
    const counts = { safe: 0, warning: 0, critical: 0 };
    lineData.forEach(item => {
      if (item.usagePercentage !== null && item.usagePercentage !== undefined) {
        const status = calculateStatus(item.totalQuantityUsed, item.limitValue || 1);
        counts[status.status]++;
      }
    });
    return counts;
  };

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
      dataIndex: 'statusColor',
      key: 'status',
      width: 80,
      align: 'center',
      render: (color, record) => {
        const status = calculateStatus(record.totalQuantityUsed || 0, record.limitValue || 1);
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
      dataIndex: 'lineName',
      key: 'lineName',
      width: 150,
      render: (text) => text || '—'
    },
    {
      title: 'Công đoạn sử dụng',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 200,
      render: (text) => text || '—'
    },
    {
      title: 'Tên LK tiêu hao',
      dataIndex: 'partName',
      key: 'partName',
      width: 180
    },
    {
      title: 'Mã LK tiêu hao',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 150,
      render: (text) => text || '—'
    },
    {
      title: 'Định mức / Chu kỳ thay',
      dataIndex: 'replacementCycle',
      key: 'replacementCycle',
      width: 180,
      render: (text, record) => {
        if (record.limitValue && record.limitUnit) {
          return `${record.limitValue.toLocaleString()} (${record.limitUnit})`;
        }
        return text || '—';
      }
    },
    {
      title: 'Số lượng đã dùng',
      dataIndex: 'totalQuantityUsed',
      key: 'totalQuantityUsed',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{(text || 0).toLocaleString()} {record.limitUnit ? `(${record.limitUnit})` : ''}</div>
          {record.usagePercentage !== null && record.usagePercentage !== undefined && (
            <span style={{ 
              fontSize: '11px', 
              color: '#666', 
              display: 'block', 
              marginTop: '2px' 
            }}>
              {record.usagePercentage.toFixed(1)}% đã dùng
            </span>
          )}
        </div>
      )
    },
    {
      title: '% Sử dụng',
      dataIndex: 'usagePercentage',
      key: 'usagePercentage',
      width: 120,
      render: (text) => (
        <strong>{text !== null && text !== undefined ? `${text.toFixed(1)}%` : '—'}</strong>
      ),
      align: 'center'
    },
    {
      title: 'Ngày thay gần nhất',
      dataIndex: 'lastReplacementDate',
      key: 'lastReplacementDate',
      width: 150,
      align: 'center',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '—'
    },
    {
      title: 'Số lần thay thế',
      dataIndex: 'replacementCount',
      key: 'replacementCount',
      width: 130,
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
              Chọn dây chuyền:
            </label>
            <Select
              mode="multiple"
              value={selectedLines}
              onChange={setSelectedLines}
              style={{ 
                minWidth: '250px',
                backgroundColor: 'white'
              }}
              placeholder="Chọn dây chuyền"
              maxTagCount={2}
            >
              {productionLines.map(line => (
                <Option key={line.id} value={line.id}>
                  {line.name}
                </Option>
              ))}
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
              showSearch
              allowClear
            >
              <Option value="">Tất cả linh kiện</Option>
              {[...new Set(allData.map(d => d.partName))].filter(Boolean).map(name => (
                <Option key={name} value={name}>{name}</Option>
              ))}
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
              showSearch
              allowClear
            >
              <Option value="">Tất cả mã LK</Option>
              {[...new Set(allData.map(d => d.partNumber))].filter(Boolean).map(code => (
                <Option key={code} value={code}>{code}</Option>
              ))}
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

        {/* Render Tables for Each Production Line */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : productionLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="Bạn chưa được phân công quản lý dây chuyền nào" />
          </div>
        ) : selectedLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="Vui lòng chọn ít nhất một dây chuyền để xem thống kê" />
          </div>
        ) : (
          productionLines
            .filter(line => selectedLines.includes(line.id))
            .map((line) => {
              const lineData = getDataByLine(line.lineId);
              const lineCounts = getStatusCountsByLine(line.lineId);
            
            return (
              <div key={line.lineId} style={{ marginBottom: '40px' }}>
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
                    }}>{line.name}</span>
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
                    rowKey={(record) => `${record.partId}-${record.equipmentId || 'noequip'}-${line.lineId}`}
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
                    rowClassName={(record) => {
                      const status = calculateStatus(record.totalQuantityUsed || 0, record.limitValue || 1);
                      return status.rowClass;
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="Chưa có dữ liệu thống kê cho dây chuyền này"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )
                    }}
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
                        )
                      }
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
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
        .ant-table-tbody > tr:hover > td {
          background-color: #f9f9f9 !important;
        }
        .row-critical:hover > td {
          background-color: #ffcccc !important;
        }
        .row-warning:hover > td {
          background-color: #ffeacc !important;
        }
      `}</style>
    </Layout>
  );
};

export default DisplayScreenReplaceItem;
