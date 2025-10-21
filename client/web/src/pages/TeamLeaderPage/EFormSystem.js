import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Table, Modal, Card, Row, Col, Typography, Tabs } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../../styles/pages/EFormSystem.css';

const { Title, Text } = Typography;
const { Option } = Select;

const EFormSystem = () => {
  const [searchForm] = Form.useForm();
  const [productionForm] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [activeShift, setActiveShift] = useState('1');

  const [currentEditingFormId, setCurrentEditingFormId] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Danh sách các form đã lưu
  const [savedForms, setSavedForms] = useState([
    {
      id: 1,
      stt: '04119824',
      subtitle: 'Bảng quản lý sản lượng[04119824]',
      created: '09/09/2025',
      updated: '09/09/2025',
      status: 'saved', // 'draft', 'saved', or 'temporary'
      data: {
        line: 'TZ',
        process: 'Lắp Sleeve S/A',
        date: '09/09/2025',
        actualTT: '8/4',
        shifts: {
          1: [
            { key: '1', time: '06:00 - 07:00', loadingTime: '60', targetAmount: '177/377', resultAmount: '', oee: '78.4%', downDetails: [
              { type: 'Dừng ngắn', minutes: 5 },
              { type: 'Chuẩn bị sản xuất', minutes: 10 }
            ] },
            { key: '2', time: '07:00 - 08:00', loadingTime: '60', targetAmount: '377/754', resultAmount: '', oee: '80.63%', downDetails: [
              { type: 'Phế phẩm', minutes: 8, count: 3 },
              { type: 'Dừng ngắn', minutes: 12 }
            ] },
            { key: '3', time: '08:00 - 09:00', loadingTime: '50', targetAmount: '314/1068', resultAmount: '', oee: '85.0%', downDetails: '' },
            { key: '4', time: '09:00 - 10:00', loadingTime: '60', targetAmount: '377/1445', resultAmount: '', oee: '87%', downDetails: '' },
            { key: '5', time: '10:00 - 11:00', loadingTime: '60', targetAmount: '377/1822', resultAmount: '', oee: '85%', downDetails: '' },
            { key: '6', time: '11:00 - 12:00', loadingTime: '50', targetAmount: '314/2136', resultAmount: '', oee: '67%', downDetails: '' },
            { key: '7', time: '12:00 - 13:00', loadingTime: '80', targetAmount: '566/2702', resultAmount: '', oee: '53%', downDetails: '' },
            { key: '8', time: '13:00 - 14:00', loadingTime: '60', targetAmount: '317/1425', resultAmount: '', oee: '', downDetails: '' },
          ],
          2: [
            { key: '1', time: '14:00 - 15:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '2', time: '15:00 - 16:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '3', time: '16:00 - 17:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '4', time: '17:00 - 18:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '5', time: '18:00 - 19:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '6', time: '19:00 - 20:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '7', time: '20:00 - 21:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '8', time: '21:00 - 22:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
          ],
          3: [
            { key: '1', time: '22:00 - 23:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '2', time: '23:00 - 00:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '3', time: '00:00 - 01:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '4', time: '01:00 - 02:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '5', time: '02:00 - 03:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '6', time: '03:00 - 04:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '7', time: '04:00 - 05:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
            { key: '8', time: '05:00 - 06:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
          ]
        }
      }
    }
  ]);

  // Dữ liệu form hiện tại đang được edit
  const [currentFormData, setCurrentFormData] = useState({
    line: 'TZ',
    process: 'Lắp Sleeve S/A',
    date: dayjs().format('DD/MM/YYYY'),
    actualTT: '8/4'
  });

  // Data cho 3 ca
  const [shift1Data, setShift1Data] = useState([
    { key: '1', time: '06:00 - 07:00', loadingTime: '60', targetAmount: '177/377', resultAmount: '', oee: '78.4%', downDetails: [
      { type: 'Lỗi điểm ra', minutes: 5 },
      { type: 'Chuyển mới mở', minutes: 10 }
    ] },
    { key: '2', time: '07:00 - 08:00', loadingTime: '60', targetAmount: '377/754', resultAmount: '', oee: '80.63%', downDetails: [
      { type: 'Phế phẩm', minutes: 8, count: 3 },
      { type: 'Dừng ngắn', minutes: 12 }
    ] },
    { key: '3', time: '08:00 - 09:00', loadingTime: '50', targetAmount: '314/1068', resultAmount: '', oee: '85.0%', downDetails: '' },
    { key: '4', time: '09:00 - 10:00', loadingTime: '60', targetAmount: '377/1445', resultAmount: '', oee: '87%', downDetails: '' },
    { key: '5', time: '10:00 - 11:00', loadingTime: '60', targetAmount: '377/1822', resultAmount: '', oee: '85%', downDetails: '' },
    { key: '6', time: '11:00 - 12:00', loadingTime: '50', targetAmount: '314/2136', resultAmount: '', oee: '67%', downDetails: '' },
    { key: '7', time: '12:00 - 13:00', loadingTime: '80', targetAmount: '566/2702', resultAmount: '', oee: '53%', downDetails: '' },
    { key: '8', time: '13:00 - 14:00', loadingTime: '60', targetAmount: '566/2702', resultAmount: '', oee: '', downDetails: '' },
  ]);

  const [shift2Data, setShift2Data] = useState([
    { key: '1', time: '14:00 - 15:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2', time: '15:00 - 16:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '3', time: '16:00 - 17:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '4', time: '17:00 - 18:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '5', time: '18:00 - 19:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '6', time: '19:00 - 20:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '7', time: '20:00 - 21:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '8', time: '21:00 - 22:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
  ]);

  const [shift3Data, setShift3Data] = useState([
    { key: '1', time: '22:00 - 23:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2', time: '23:00 - 00:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '3', time: '00:00 - 01:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '4', time: '01:00 - 02:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '5', time: '02:00 - 03:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '6', time: '03:00 - 04:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '7', time: '04:00 - 05:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '8', time: '05:00 - 06:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
  ]);

  const getCurrentShiftData = () => {
    switch (activeShift) {
      case '1': return shift1Data;
      case '2': return shift2Data;
      case '3': return shift3Data;
      default: return shift1Data;
    }
  };

  const setCurrentShiftData = (newData) => {
    switch (activeShift) {
      case '1': setShift1Data(newData); break;
      case '2': setShift2Data(newData); break;
      case '3': setShift3Data(newData); break;
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setCurrentStep(2);
      const currentDate = dayjs().format('DD/MM/YYYY');
      const nextId = Math.max(...savedForms.map(f => f.id), 0) + 1;
      const stt = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');

      const newForm = {
        id: nextId,
        stt: stt,
        subtitle: `Bảng quản lý sản lượng[${stt}]`,
        created: currentDate,
        updated: currentDate,
        status: 'draft', // 'draft', 'saved', or 'temporary'
        data: {
          line: 'TZ',
          process: 'Lắp Sleeve S/A',
          date: dayjs(date).format('DD/MM/YYYY'),
          actualTT: '8/4',
          shifts: {
            1: [...shift1Data],
            2: [...shift2Data],
            3: [...shift3Data]
          }
        }
      };

      setSavedForms(prev => [newForm, ...prev]);
      setCurrentEditingFormId(nextId);
      setSelectedFormData({
        subtitle: newForm.subtitle,
        created: newForm.created,
        updated: newForm.updated
      });
    } else {
      setCurrentStep(1);
      setSelectedFormData(null);
      setCurrentEditingFormId(null);
    }
  };

  const handleFormSubtitleClick = () => {
    // Tìm form đầu tiên trong danh sách để load
    if (savedForms.length > 0) {
      handleLoadForm(savedForms[0]);
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  // ==========================================
  // REGISTER DATA: Saves to database immediately
  // ==========================================
  const handleRegisterData = async () => {
    if (!currentEditingFormId) return;

    try {
      // Prepare data for API call
      const formData = {
        id: currentEditingFormId,
        stt: savedForms.find(f => f.id === currentEditingFormId)?.stt,
        subtitle: selectedFormData?.subtitle,
        line: currentFormData.line,
        process: currentFormData.process,
        date: currentFormData.date,
        actualTT: currentFormData.actualTT,
        shifts: {
          1: [...shift1Data],
          2: [...shift2Data],
          3: [...shift3Data]
        }
      };

      // TODO: Replace with actual API call
      console.log('Saving to database:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state after successful API call
      const currentDate = dayjs().format('DD/MM/YYYY');
      setSavedForms(prev => prev.map(form =>
        form.id === currentEditingFormId
          ? {
            ...form,
            status: 'saved',
            updated: currentDate,
            data: {
              line: currentFormData.line,
              process: currentFormData.process,
              date: currentFormData.date,
              actualTT: currentFormData.actualTT,
              shifts: {
                1: [...shift1Data],
                2: [...shift2Data],
                3: [...shift3Data]
              }
            }
          }
          : form
      ));

      setShowSuccessPage(true);
    } catch (error) {
      console.error('Error saving to database:', error);
      // TODO: Show error message to user
    }
  };

  // ==========================================
  // SAVE TEMPORARILY: Saves locally only (no database)
  // ==========================================
  const handleSaveTemporarily = () => {
    // Kiểm tra status hiện tại của form
    const currentForm = savedForms.find(form => form.id === currentEditingFormId);
    if (currentForm && currentForm.status === 'saved') {
      // Nếu form đã saved, hiển thị confirmation khác
      setConfirmAction('saved-to-temporary');
      setConfirmModalVisible(true);
    } else {
      // Nếu form chưa saved hoặc là draft/temporary, hiển thị confirmation thông thường
      setConfirmAction('temporary');
      setConfirmModalVisible(true);
    }
  };

  // Function to save data locally only (no database insertion)
  const saveDataLocally = (status) => {
    const currentDate = dayjs().format('DD/MM/YYYY');
    setSavedForms(prev => prev.map(form =>
      form.id === currentEditingFormId
        ? {
          ...form,
          status: status,
          updated: currentDate,
          data: {
            line: currentFormData.line,
            process: currentFormData.process,
            date: currentFormData.date,
            actualTT: currentFormData.actualTT,
            shifts: {
              1: [...shift1Data],
              2: [...shift2Data],
              3: [...shift3Data]
            }
          }
        }
        : form
    ));
  };

  const handleLoadForm = (form) => {
    // Load dữ liệu form đã lưu
    setSelectedFormData({
      subtitle: form.subtitle,
      created: form.created,
      updated: form.updated
    });

    // Load dữ liệu form hiện tại
    setCurrentFormData({
      line: form.data.line,
      process: form.data.process,
      date: form.data.date,
      actualTT: form.data.actualTT
    });

    // Load dữ liệu shifts
    setShift1Data([...form.data.shifts[1]]);
    setShift2Data([...form.data.shifts[2]]);
    setShift3Data([...form.data.shifts[3]]);

    // Set current editing form
    setCurrentEditingFormId(form.id);

    setCurrentStep(3);
  };

  const handleCellClick = (record, dataIndex) => {
    setEditingCell({ record, dataIndex, shift: activeShift });
    setEditValue(record[dataIndex] || (dataIndex === 'downDetails' ? [] : ''));
    setEditModalVisible(true);
  };

  const handleConfirmYes = () => {
    if (confirmAction === 'temporary' || confirmAction === 'saved-to-temporary') {
      if (!currentEditingFormId) return;

      // Save data locally only (no database insertion for temporary saves)
      saveDataLocally('temporary');
      setCurrentStep(2);
    }
    setConfirmModalVisible(false);
    setConfirmAction(null);
  };

  const handleConfirmNo = () => {
    setConfirmModalVisible(false);
    setConfirmAction(null);
  };

  const handleSelectProductionForm = () => {
    setShowSuccessPage(false);
    setCurrentStep(2);
  };

  const handleContinue = () => {
    setShowSuccessPage(false);
  };

  const handleModalOk = () => {
    if (!editingCell) return;

    const { record, dataIndex, shift } = editingCell;
    const updatedRecord = { ...record, [dataIndex]: editValue };

    // Update the appropriate shift data
    const currentShiftData = getCurrentShiftData();
    const updatedShiftData = currentShiftData.map(item =>
      item.key === record.key ? updatedRecord : item
    );

    setCurrentShiftData(updatedShiftData);

    // Close modal and reset state
    setEditModalVisible(false);
    setEditingCell(null);
    setEditValue('');
  };

  const getFieldLabel = (dataIndex) => {
    const labels = {
      loadingTime: 'Thời Gian Nạp',
      targetAmount: 'Số Lượng Sản Xuất Mục Tiêu',
      resultAmount: 'Số Lượng Sản Xuất Kết Quả',
      oee: 'OEE',
      downDetails: 'Chi Tiết Thời Gian Dừng Máy'
    };
    return labels[dataIndex] || dataIndex;
  };

  const formatDownDetails = (downDetails) => {
    if (!Array.isArray(downDetails) || downDetails.length === 0) {
      return '';
    }
    return downDetails.map(detail => detail.type).join('\n');
  };

  const columns = [
    {
      title: 'Thời Gian',
      dataIndex: 'time',
      key: 'time',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (text) => {
        // Tách thời gian thành 2 dòng: "06:00 - 07:00" -> "06:00\n07:00"
        const timeParts = text.split(' - ');
        return (
          <div style={{
            fontWeight: 500,
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '101px',
            height: '101px'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#000000',
              fontWeight: 600,
              paddingBottom: '18px',
              borderBottom: '2px solid #d9d9d9',
              width: '100%',
              textAlign: 'center'
            }}>
              {timeParts[0]}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#000000',
              marginTop: '18px',
              textAlign: 'center'
            }}>
              {timeParts[1]}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Thời Lượng (phút)',
      dataIndex: 'loadingTime',
      key: 'loadingTime',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'loadingTime')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Số Lượng Sản Xuất Mục Tiêu',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'targetAmount')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Số Lượng Sản Xuất Thực Tế',
      dataIndex: 'resultAmount',
      key: 'resultAmount',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'resultAmount')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'OEE',
      dataIndex: 'oee',
      key: 'oee',
      width: 180,
      align: 'center',
      render: (text, record) => {
        const displayText = text || '0%';
        const isLowPerformance = text && parseFloat(text) < 70;
        const isEmpty = !text;

        return (
          <div
            style={{
              cursor: 'pointer',
              padding: '12px 8px',
              minHeight: '101px',
              height: '101px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              fontWeight: displayText ? 600 : 'normal',
              color: (isLowPerformance || isEmpty) ? '#ff4d4f' : '#000000'
            }}
            onClick={() => handleCellClick(record, 'oee')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {displayText}
          </div>
        );
      },
    },
    {
      title: 'Chi Tiết Thời Gian Dừng',
      dataIndex: 'downDetails',
      key: 'downDetails',
      width: 300,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'flex-start',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            fontSize: '13px',
            transition: 'all 0.3s',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'downDetails')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {formatDownDetails(text)}
        </div>
      ),
    },
  ];

  const renderSearchForm = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Nhập Dữ Liệu E-Form
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Chọn biểu mẫu sản xuất để nhập dữ liệu
          </Text>
        </div>

        <div style={{ padding: '40px' }}>
          <Text type="secondary" style={{
            display: 'block',
            marginBottom: '32px',
            fontSize: '15px',
            color: '#6b7280'
          }}>
            Nhập tiêu chí tìm kiếm để tìm biểu mẫu.
          </Text>

          <Form
            form={searchForm}
            layout="vertical"
            initialValues={{
              lineGroup: 'FZ / LGVAP 0143',
              line: 'FZ / LNe5419',
              formType: 'Production Amount (E-form)',
            }}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Dòng</span>}
                  name="line"
                >
                  <Select
                    size="large"
                    placeholder="--Select--"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<span style={{ color: '#6b7280' }}>▼</span>}
                  >
                    <Option value="FZ / LNe5419">FZ / LNe5419</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Loại Biểu Mẫu</span>}
                  name="formType"
                >
                  <Select
                    size="large"
                    placeholder="No options"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<span style={{ color: '#6b7280' }}>▼</span>}
                  >
                    <Option value="Production Amount (E-form)">Production Amount (E-form)</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Ngày</span>}
                  name="date"
                >
                  <DatePicker
                    size="large"
                    format="DD/MM/YYYY"
                    style={{ width: '100%', borderRadius: '8px' }}
                    onChange={handleDateChange}
                    placeholder="09/09/2025"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Tiêu Đề Biểu Mẫu</span>}
                >
                  <Input
                    size="large"
                    value={currentStep >= 2 && selectedFormData ? selectedFormData.subtitle : ''}
                    disabled
                    placeholder="Chọn tất cả các trường ở trên để tạo tiêu đề biểu mẫu"
                    style={{
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* Danh sách các form đã lưu dưới dạng bảng */}
          {savedForms.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <Table
                dataSource={savedForms}
                columns={[
                  {
                    title: 'Ngày Tạo',
                    dataIndex: 'created',
                    key: 'created',
                    width: 150,
                    align: 'center',
                    render: (text) => (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 500 }}>{text}</span>
                      </div>
                    )
                  },
                  {
                    title: 'Ngày Cập Nhật',
                    dataIndex: 'updated',
                    key: 'updated',
                    width: 150,
                    align: 'center',
                    render: (text) => (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 500 }}>{text}</span>
                      </div>
                    )
                  },
                  {
                    title: 'Tiêu Đề Biểu Mẫu',
                    dataIndex: 'subtitle',
                    key: 'subtitle',
                    width: 300,
                    render: (text) => (
                      <div style={{
                        fontWeight: 600,
                        color: '#1e40af'
                      }}>
                        {text}
                      </div>
                    )
                  },
                  {
                    title: 'Trạng Thái',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    align: 'center',
                    render: (status) => (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor:
                          status === 'temporary' ? '#fef3c7' :
                            status === 'saved' ? '#d1fae5' :
                              '#e0f2fe', // draft status
                        color:
                          status === 'temporary' ? '#f59e0b' :
                            status === 'saved' ? '#10b981' :
                              '#0369a1', // draft status
                        fontWeight: 500,
                        fontSize: '13px'
                      }}>
                        {status === 'temporary' ? 'Tạm Thời' : status === 'saved' ? 'Đã Lưu' : 'Bản Nháp'}
                      </div>
                    )
                  },
                  // {
                  //   title: 'Hành Động',
                  //   key: 'action',
                  //   width: 100,
                  //   align: 'center',
                  //   render: (_, record) => (
                  //     <Button
                  //       type="primary"
                  //       size="small"
                  //       onClick={() => handleLoadForm(record)}
                  //       style={{
                  //         background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  //         border: 'none',
                  //         borderRadius: '6px'
                  //       }}
                  //     >
                  //       Xem
                  //     </Button>
                  //   )
                  // }
                ]}
                pagination={false}
                size="middle"
                bordered
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                rowClassName={(record, index) =>
                  index % 2 === 0 ? 'eform-table-row-even' : 'eform-table-row-odd'
                }
                onRow={(record) => ({
                  onClick: () => handleLoadForm(record),
                  style: { cursor: 'pointer' }
                })}
              />
            </div>
          )}

        </div>
      </Card>
    </div>
  );

  const renderProductionForm = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              borderRadius: '8px',
              height: '44px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 10
            }}
            size="large"
          >
            Quay Lại Tìm Kiếm
          </Button>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Nhập Số Lượng Sản Xuất
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Nhập dữ liệu sản xuất cho mỗi khoảng thời gian
          </Text>
        </div>

        <div style={{ padding: '40px', paddingBottom: '120px' }}>
          <Form layout="vertical" form={productionForm}>
            <Row gutter={32}>
              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Tiêu Đề Biểu Mẫu</span>}>
                  <Input
                    value={selectedFormData?.subtitle || "Bảng quản lý sản lượng[04119824]"}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Dòng</span>}>
                  <Input
                    value={currentFormData.line}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Quy Trình</span>}>
                  <Input
                    value={currentFormData.process}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Ngày</span>}>
                  <Input
                    value={currentFormData.date}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>TT Thực Tế</span>}>
                  <Input
                    suffix={<Text type="secondary" style={{ fontSize: '13px' }}>8/4 | Giây</Text>}
                    value={currentFormData.actualTT}
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <div style={{ marginTop: '40px' }}>
            <Tabs
              activeKey={activeShift}
              onChange={setActiveShift}
              size="large"
              className="eform-shift-tabs"
              tabBarStyle={{
                marginBottom: '24px',
                borderBottom: '2px solid #e5e7eb'
              }}
              items={[
                {
                  key: '1',
                  label: (
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: activeShift === '1' ? '#283652' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Ca 1 (06:00 - 14:00)
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: activeShift === '2' ? '#283652' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Ca 2 (14:00 - 22:00)
                    </span>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: activeShift === '3' ? '#283652' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Ca 3 (22:00 - 06:00)
                    </span>
                  ),
                }
              ]}
            />

            <Table
              columns={columns}
              dataSource={getCurrentShiftData()}
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 1200 }}
              style={{
                marginTop: '16px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? 'eform-table-row-even' : 'eform-table-row-odd'
              }
            />
          </div>

          <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: 'auto',
            padding: '20px 40px',
            display: 'flex',
            gap: '16px',
            backgroundColor: 'white',
            justifyContent: 'flex-end',
            zIndex: 1000
          }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '52px',
                flex: 1,
                maxWidth: '300px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 14, 10, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px #283652';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px #334766';
              }}
              onClick={handleRegisterData}
              title="Lưu vào cơ sở dữ liệu vĩnh viễn"
            >
              Đăng Ký Dữ Liệu
            </Button>
            <Button
              size="large"
              style={{
                borderRadius: '8px',
                height: '52px',
                flex: 1,
                maxWidth: '300px',
                fontSize: '16px',
                fontWeight: 500,
                border: '2px solid #d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px #d3d3d3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={handleSaveTemporarily}
              title="Chỉ lưu cục bộ (tạm thời)"
            >
              Lưu Tạm Thời
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSuccessPage = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Đăng Ký Hoàn Thành
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Dữ liệu sản xuất của bạn đã được đăng ký thành công
          </Text>
        </div>

        <div style={{ padding: '80px 40px', textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
            color: '#10b981'
          }}>

          </div>
          <Title level={2} style={{
            color: '#059669',
            marginBottom: '40px',
            fontWeight: 600
          }}>
            Đăng ký hoàn thành thành công
          </Title>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSelectProductionForm}
              style={{
                background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '52px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Chọn Biểu Mẫu Sản Xuất
            </Button>
            <Button
              size="large"
              onClick={handleContinue}
              style={{
                borderRadius: '8px',
                height: '52px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 500,
                border: '2px solid #d1d5db',
                color: '#374151'
              }}
            >
              Tiếp Tục
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="eform-system-root" style={{
      padding: 0,
      margin: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {showSuccessPage ? renderSuccessPage() : currentStep < 3 ? renderSearchForm() : renderProductionForm()}

      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {editingCell?.dataIndex === 'downDetails' ? 'Xem Chi Tiết' : `Chỉnh Sửa ${getFieldLabel(editingCell?.dataIndex)}`}
          </div>
        }
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCell(null);
          setEditValue('');
        }}
        okText={editingCell?.dataIndex === 'downDetails' ? "Đóng" : "Lưu"}
        cancelText="Hủy"
        width={500}
        okButtonProps={{
          size: 'large',
          style: {
            background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500
          }
        }}
        cancelButtonProps={{
          size: 'large',
          style: { borderRadius: '6px' }
        }}
      >
        <Form layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ fontWeight: 500, color: '#374151' }}>{getFieldLabel(editingCell?.dataIndex)}</span>}
          >
            {editingCell?.dataIndex === 'downDetails' ? (
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {Array.isArray(editValue) && editValue.length > 0 ? (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      Chi Tiết Thời Gian Dừng Máy - {editingCell?.record?.time}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {editValue.map((detail, index) => (
                        <div key={index} style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            {detail.type}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            <span>Thời gian: {detail.minutes} phút</span>
                            {detail.type === 'Phế phẩm' && detail.count && (
                              <span>Số lượng: {detail.count}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                    padding: '40px 0'
                  }}>
                    Không có chi tiết thời gian dừng máy được ghi lại
                  </div>
                )}
              </div>
            ) : (
              <Input
                size="large"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Nhập ${getFieldLabel(editingCell?.dataIndex)} (giá trị số)`}
                autoFocus
                style={{ borderRadius: '6px' }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal for Save Temporarily */}
      <Modal
        title={confirmAction === 'saved-to-temporary' ? "Xác Nhận Chỉ Lưu Cục Bộ" : "Xác Nhận Lưu Tạm Thời"}
        visible={confirmModalVisible}
        onCancel={handleConfirmNo}
        footer={[
          <Button key="no" onClick={handleConfirmNo}>
            Không
          </Button>,
          <Button key="yes" type="primary" onClick={handleConfirmYes}>
            Có
          </Button>,
        ]}
      >
        <p>
          {confirmAction === 'saved-to-temporary'
            ? "Biểu mẫu này đã được đăng ký. Lưu tạm thời sẽ thay đổi trạng thái trở lại tạm thời và chỉ lưu cục bộ (không cập nhật cơ sở dữ liệu). Bạn có muốn tiếp tục không?"
            : "Lưu tạm thời sẽ lưu dữ liệu cục bộ chỉ (không chèn cơ sở dữ liệu). Bạn vẫn muốn quay lại màn hình kết quả số lượng sản xuất không?"
          }
        </p>
      </Modal>
    </div>
  );
};

export default EFormSystem;