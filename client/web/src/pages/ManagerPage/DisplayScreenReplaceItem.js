import React, { useState, useEffect } from 'react';
import { Layout, Select, Table, Spin, message, Empty, Tag } from 'antd';
import { lineService } from '../../services/lineService';
import { departmentService } from '../../services/departmentService';
import { authService } from '../../services/authService';
import { replacementHistoryService } from '../../services/replacementHistoryService';
import { equipmentService } from '../../services/equipmentService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Option } = Select;

const DisplayScreenReplaceItem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [selectedLines, setSelectedLines] = useState([]);
  
  const [allDistributedItems, setAllDistributedItems] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchUserAndLines();
  }, []);

  useEffect(() => {
    if (dataLoaded && selectedLines.length > 0) {
      loadAllDistributedItems();
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

  const loadAllDistributedItems = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả lịch sử thay thế từ replacementHistoryService
      const response = await replacementHistoryService.getAll();
      let replacementHistories = [];
      
      if (response && response.success) {
        replacementHistories = response.data;
      } else if (Array.isArray(response)) {
        replacementHistories = response;
      } else if (response && response.data) {
        replacementHistories = response.data;
      }
      
      console.log('Replacement Histories Response:', response);
      console.log('Replacement Histories Data:', replacementHistories);
      
      // Lấy thông tin thiết bị để mapping với line
      let equipmentLineMap = {};
      try {
        // Lấy thông tin thiết bị
        const equipmentResponse = await equipmentService.getEquipments();
        let equipments = [];
        
        if (equipmentResponse && equipmentResponse.success) {
          equipments = equipmentResponse.data;
        } else if (Array.isArray(equipmentResponse)) {
          equipments = equipmentResponse;
        }
        
        console.log('Equipment data:', equipments);
        
        // Tạo mapping equipmentId → lineId
        equipments.forEach(equipment => {
          if (equipment.equipmentId || equipment.id) {
            const equipId = equipment.equipmentId || equipment.id;
            const lineId = equipment.lineId || equipment.productionLineId || equipment.line_id;
            if (lineId) {
              equipmentLineMap[equipId] = {
                lineId: lineId,
                lineName: equipment.lineName || equipment.productionLineName || equipment.line,
                stageName: equipment.stageName || equipment.stage || equipment.processName
              };
            }
          }
        });
        
        console.log('Equipment Line Map:', equipmentLineMap);
      } catch (equipError) {
        console.error('Lỗi lấy thông tin thiết bị:', equipError);
      }
      
      // Lọc theo dây chuyền được chọn
      const selectedLineIds = selectedLines.map(lineId => {
        const line = productionLines.find(l => l.id === lineId);
        return line ? line.lineId : parseInt(lineId);
      });
      
      console.log('Selected Line IDs:', selectedLineIds);
      
      // Chuyển đổi dữ liệu lịch sử thay thế thành format hiển thị
      const distributedItems = [];
      
      replacementHistories.forEach((history, index) => {
        console.log(`Processing history ${index}:`, history);
        
        // Lấy lineId từ equipment mapping
        const equipmentId = history.equipmentID || history.equipmentId;
        const equipmentInfo = equipmentLineMap[equipmentId];
        const historyLineId = equipmentInfo?.lineId;
        
        console.log(`Equipment ID: ${equipmentId}, Equipment Info:`, equipmentInfo, `Line ID: ${historyLineId}`);
        
        // Chỉ lấy những record thuộc dây chuyền được chọn
        if (historyLineId && selectedLineIds.includes(historyLineId)) {
          const distributedItem = {
            id: `history-${history.replacementID || history.id || index}`,
            distributionId: history.replacementID || history.id,
            distributionType: history.replacementType || history.type || (history.incidentId ? 'incident' : 'maintenance'),
            recordId: history.workOrderId || history.incidentId || history.maintenanceId || history.requestId || 'N/A',
            recordCode: history.equipmentCode || history.code || history.equipmentNumber,
            recordName: history.equipmentName || history.name || history.equipment,
            equipmentName: history.equipmentName || history.name || history.equipment || history.equipmentDesc,
            stageName: equipmentInfo?.stageName || history.stageName || history.stage || history.processName || 'Không xác định',
            lineId: historyLineId,
            lineName: equipmentInfo?.lineName || history.lineName || history.productionLineName || history.line || 'Chưa xác định',
            partId: history.partID || history.sparePartId,
            partName: history.partName || history.sparePartName || history.componentName,
            partNumber: history.partNumber || history.partCode || history.sparePartCode,
            quantityDistributed: history.quantity || history.quantityUsed || history.quantityDistributed || 1,
            quantityReturned: history.quantityReturned || history.returnedQuantity || history.currentQuantityInUse || 0,
            actualUsed: (history.quantity || history.quantityUsed || 1) - (history.quantityReturned || history.currentQuantityInUse || 0),
            distributedAt: history.replacedDate || history.replacementDate || history.createdAt || history.dateReplaced,
            returnedAt: history.returnedAt || history.returnDate,
            status: history.status || 'Đã xuất',
            technicianName: history.replacedByFullName || history.technicianName || history.performedBy || history.replacedBy || history.technician,
            note: history.note || history.description || history.remarks
          };
          
          console.log(`Adding distributed item:`, distributedItem);
          distributedItems.push(distributedItem);
        } else {
          console.log(`Skipping history ${index} - Line ID ${historyLineId} not in selected lines:`, selectedLineIds);
        }
      });
      
      console.log('Final distributed items:', distributedItems);
      setAllDistributedItems(distributedItems);
    } catch (error) {
      console.error('Lỗi tải dữ liệu lịch sử thay thế:', error);
      console.log('Available methods in replacementHistoryService:', Object.keys(replacementHistoryService));
      console.log('Selected lines:', selectedLines);
      console.log('Production lines:', productionLines);
      message.error('Không thể tải dữ liệu lịch sử thay thế: ' + error.message);
      setAllDistributedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (item) => {
    // Logic trạng thái giống như trang quản lý kho
    // Hoàn tất: xuất bao nhiêu, trả lại đủ bấy nhiêu (không còn sử dụng gì)
    if (item.quantityReturned >= item.quantityDistributed) {
      return { status: 'completed', color: '#52c41a', text: 'Hoàn tất', rowClass: 'row-completed' };
    } else if (item.quantityReturned > 0) {
      return { status: 'partial_returned', color: '#faad14', text: 'Đã trả một phần', rowClass: 'row-partial-returned' };
    }
    return { status: 'distributed', color: '#1890ff', text: 'Đã xuất', rowClass: 'row-distributed' };
  };

  const getDataByLine = (lineId) => {
    // Nếu không có lineId trong data, lấy tất cả items
    let lineData = allDistributedItems.filter(item => 
      !lineId || item.lineId === lineId || item.lineId === null
    );
    
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
    
    if (statusFilter) {
      if (statusFilter === 'distributed') {
        lineData = lineData.filter(item => item.quantityReturned === 0);
      } else if (statusFilter === 'partial_returned') {
        lineData = lineData.filter(item => item.quantityReturned > 0 && item.quantityReturned < item.quantityDistributed);
      } else if (statusFilter === 'completed') {
        lineData = lineData.filter(item => item.quantityReturned >= item.quantityDistributed);
      }
    }
    
    return lineData;
  };

  const getStatusCountsByLine = (lineId) => {
    const lineData = getDataByLine(lineId);
    const counts = { distributed: 0, partial_returned: 0, completed: 0, total: 0 };
    
    lineData.forEach(item => {
      counts.total++;
      const statusInfo = getStatusInfo(item);
      if (statusInfo.status === 'completed') {
        counts.completed++;
      } else if (statusInfo.status === 'partial_returned') {
        counts.partial_returned++;
      } else {
        counts.distributed++;
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
      key: 'status',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const statusInfo = getStatusInfo(record);
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: statusInfo.color
            }}></div>
          </div>
        );
      }
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'distributionType',
      key: 'distributionType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'incident' ? 'red' : 'purple'}>
          {type === 'incident' ? 'Sự cố' : 'Bảo trì'}
        </Tag>
      )
    },
    {
      title: 'Mã SC/BT',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 100,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Thiết bị',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.recordCode}</div>
        </div>
      )
    },
    {
      title: 'Công đoạn',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 150,
      render: (text) => text || '—'
    },
    {
      title: 'Dây chuyền',
      dataIndex: 'lineName',
      key: 'lineName',
      width: 150,
      render: (text) => text || '—'
    },
    {
      title: 'Tên linh kiện',
      dataIndex: 'partName',
      key: 'partName',
      width: 180
    },
    {
      title: 'Mã linh kiện',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 130,
      render: (text) => text || '—'
    },
    {
      title: 'SL xuất',
      dataIndex: 'quantityDistributed',
      key: 'quantityDistributed',
      width: 80,
      align: 'center',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text || 0}</strong>
    },
    {
      title: 'SL trả lại',
      dataIndex: 'quantityReturned',
      key: 'quantityReturned',
      width: 80,
      align: 'center',
      render: (text) => text > 0 ? <strong style={{ color: '#52c41a' }}>{text}</strong> : '—'
    },
    {
      title: 'SL thực dùng',
      dataIndex: 'actualUsed',
      key: 'actualUsed',
      width: 100,
      align: 'center',
      render: (text) => <strong style={{ color: '#f5222d' }}>{text || 0}</strong>
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'distributedAt',
      key: 'distributedAt',
      width: 120,
      align: 'center',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '—'
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'technicianName',
      key: 'technicianName',
      width: 130,
      render: (text) => text || '—'
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
                minWidth: '180px',
                backgroundColor: 'white'
              }}
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="distributed">🔵 Đã xuất</Option>
              <Option value="partial_returned">🟡 Đã trả một phần</Option>
              <Option value="completed">🟢 Hoàn tất</Option>
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
              {[...new Set(allDistributedItems.map(d => d.partName))].filter(Boolean).map(name => (
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
              {[...new Set(allDistributedItems.map(d => d.partNumber))].filter(Boolean).map(code => (
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
            🔧 Mục đích của trang: Theo dõi Lịch sử Thay thế Linh kiện (Replacement History Tracking)
          </h3>
          <ul style={{ 
            marginLeft: '20px', 
            color: '#856404' 
          }}>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Theo dõi lịch sử thay thế:</strong> Hiển thị tất cả linh kiện/vật tư đã được thay thế trong quá trình bảo trì và sửa chữa sự cố
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Phân loại theo nguồn:</strong> 🔵 Bảo trì = Thay thế theo kế hoạch | 🔴 Sự cố = Thay thế do hỏng hóc
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Theo thiết bị và công đoạn:</strong> Xem chi tiết linh kiện nào được thay cho thiết bị nào, công đoạn nào
            </li>
            <li style={{ margin: '5px 0', lineHeight: '1.6' }}>
              <strong>Phân tích tuổi thọ:</strong> Theo dõi tần suất thay thế để tối ưu kế hoạch bảo trì và mua sắm
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
        ) : allDistributedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="Chưa có dữ liệu lịch sử thay thế nào" />
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
                    Lịch sử thay thế linh kiện dây chuyền <span style={{ 
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
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff'
                      }}></div>
                      <span><strong>Đã xuất:</strong> Linh kiện đã được xuất kho</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#faad14'
                      }}></div>
                      <span><strong>Đã trả một phần:</strong> Có một phần linh kiện được trả lại</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#52c41a'
                      }}></div>
                      <span><strong>Hoàn tất:</strong> Đã trả lại đủ số lượng xuất</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#f5222d'
                      }}></div>
                      <span><strong>Sự cố:</strong> Thay thế do sự cố</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#722ed1'
                      }}></div>
                      <span><strong>Bảo trì:</strong> Thay thế theo kế hoạch bảo trì</span>
                    </div>
                  </div>

                  {/* Status Summary for This Line */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    padding: '10px 0',
                    maxWidth: '800px',
                    margin: '0 auto'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1890ff',
                        margin: '0 auto 5px'
                      }}>{lineCounts.distributed}</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        Đã xuất
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#faad14',
                        margin: '0 auto 5px'
                      }}>{lineCounts.partial_returned}</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        Đã trả một phần
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#52c41a',
                        margin: '0 auto 5px'
                      }}>{lineCounts.completed}</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        Hoàn tất
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#722ed1',
                        margin: '0 auto 5px'
                      }}>{lineCounts.total}</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        Tổng cộng
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
                    rowKey={(record) => record.id}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} của ${total} lần thay`,
                      position: ['bottomCenter']
                    }}
                    scroll={{ x: 1400 }}
                    size="middle"
                    rowClassName={(record) => {
                      const statusInfo = getStatusInfo(record);
                      return statusInfo.rowClass;
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          description="Chưa có lịch sử thay thế nào cho dây chuyền này"
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
      
      <style>{`
        .row-distributed {
          background-color: #e6f7ff !important;
        }
        .row-partial-returned {
          background-color: #fff7e6 !important;
        }
        .row-completed {
          background-color: #f6ffed !important;
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
        .row-distributed:hover > td {
          background-color: #bae7ff !important;
        }
        .row-partial-returned:hover > td {
          background-color: #ffe7ba !important;
        }
        .row-completed:hover > td {
          background-color: #d9f7be !important;
        }
      `}</style>
    </Layout>
  );
};

export default DisplayScreenReplaceItem;
