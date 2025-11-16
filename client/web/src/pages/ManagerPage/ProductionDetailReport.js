import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Radio,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Row,
  Col,
  Table,
  Typography,
  Divider,
  Tag,
  message,
  Spin
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { lineService } from '../../services/lineService';
import { dashboardService } from '../../services/dashboardService';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProductionDetailReport = () => {
  const [searchParams, setSearchParams] = useState({
    productionLine: undefined,
    searchType: 'day',
    shift: '1',
    selectedDate: dayjs(),
    dateRange: null,
    timeRange: null
  });

  const [showResults, setShowResults] = useState(false);
  const [productionLines, setProductionLines] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linesLoading, setLinesLoading] = useState(true);

  // Fetch danh sách production lines khi component mount
  useEffect(() => {
    const fetchLines = async () => {
      try {
        setLinesLoading(true);
        const lines = await lineService.getLines();
        setProductionLines(lines || []);
      } catch (error) {
        console.error('Lỗi lấy danh sách dây chuyền:', error);
        message.error('Không thể tải danh sách dây chuyền');
      } finally {
        setLinesLoading(false);
      }
    };
    fetchLines();
  }, []);

  const getDataBySearchType = () => {
    return apiData;
  };

  const chartData = getDataBySearchType();

  // Calculate statistics
  const calculateStats = () => {
    if (!chartData || chartData.length === 0) {
      return { totalTarget: 0, totalActual: 0, avgOEE: '0.0', achievement: '0.0' };
    }
    const totalTarget = chartData.reduce((sum, d) => sum + (d.target || 0), 0);
    const totalActual = chartData.reduce((sum, d) => sum + (d.actual || 0), 0);
    const avgOEE = chartData.reduce((sum, d) => sum + (d.oee || 0), 0) / chartData.length;
    const achievement = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : '0.0';

    return { totalTarget, totalActual, avgOEE: avgOEE.toFixed(1), achievement };
  };

  const getTableColumns = () => {
    const columns = [
      {
        title: 'Chỉ số',
        dataIndex: 'metric',
        key: 'metric',
        fixed: 'left',
        width: 100,
        render: (text) => (
          <span style={{
            fontWeight: 600,
            color: '#283652',
            fontSize: 13
          }}>
            {text}
          </span>
        )
      }
    ];

    chartData.forEach((item, idx) => {
      columns.push({
        title: item.time,
        dataIndex: `value${idx}`,
        key: `value${idx}`,
        width: 130,
        align: 'center'
      });
    });

    return columns;
  };

  const getTableData = () => {
    const metrics = [
      { name: 'Sản lượng mục tiêu', getData: (d) => (d.target || 0).toLocaleString() },
      { name: 'Sản lượng thực tế', getData: (d) => (d.actual || 0).toLocaleString() },
      { name: 'Thời gian kế hoạch (phút)', getData: (d) => (d.plannedTime || 0).toFixed(1) },
      { name: 'Tổng thời gian ngừng (phút)', getData: (d) => (d.totalDowntime || 0).toFixed(1) },
      { name: '--- OEE & Thành phần ---', getData: () => '', isHeader: true },
      { name: 'OEE (%)', getData: (d) => (d.oee || 0).toFixed(2), highlight: true },
      { name: 'Tính khả dụng - A (%)', getData: (d) => (d.availability || 0).toFixed(2) },
      { name: 'Hiệu suất - P (%)', getData: (d) => (d.performance || 0).toFixed(2) },
      { name: 'Chất lượng - Q (%)', getData: (d) => (d.quality || 0).toFixed(2) },
      { name: '--- Tỷ lệ tổn thất ---', getData: () => '', isHeader: true },
      { name: 'Tổng tỷ lệ tổn thất (%)', getData: (d) => (d.totalLoss || 0).toFixed(2), highlight: true },
      { name: 'Tổn thất khả dụng - A Loss (%)', getData: (d) => (d.aLoss || 0).toFixed(2) },
      { name: 'Tổn thất hiệu suất - P Loss (%)', getData: (d) => (d.pLoss || 0).toFixed(2) },
      { name: 'Tổn thất chất lượng - Q Loss (%)', getData: (d) => (d.qLoss || 0).toFixed(2) },
      { name: '--- Thời gian ngừng máy ---', getData: () => '', isHeader: true },
      { name: 'Setup/Điều chỉnh (phút)', getData: (d) => (d.setupDowntime || 0).toFixed(1) },
      { name: 'Hư hỏng máy móc (phút)', getData: (d) => (d.breakdownDowntime || 0).toFixed(1) },
      { name: 'Sản phẩm lỗi (phút)', getData: (d) => (d.defects || 0).toFixed(1) },
      { name: '--- Tổng kết ---', getData: () => '', isHeader: true },
      { name: 'Tỷ lệ đạt mục tiêu (%)', getData: (d) => (d.achievement || 0).toFixed(2), highlight: true }
    ];

    return metrics.map((metric, idx) => {
      const row = {
        key: idx,
        metric: metric.name,
        highlight: metric.highlight,
        isSum: metric.isSum,
        isHeader: metric.isHeader
      };

      chartData.forEach((dataPoint, dataIdx) => {
        row[`value${dataIdx}`] = metric.getData(dataPoint);
      });

      return row;
    });
  };

  const handleSearch = async () => {
    if (!searchParams.productionLine) {
      message.warning('Vui lòng chọn dây chuyền sản xuất');
      return;
    }
    
    try {
      setLoading(true);
      setShowResults(false);
      
      let response;
      const lineId = searchParams.productionLine;
      
      if (searchParams.searchType === 'day' && searchParams.dateRange) {
        // Gọi API cho từng ngày trong khoảng thời gian
        const [startDate, endDate] = searchParams.dateRange;
        const days = [];
        let currentDate = startDate.clone();
        
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
          const dateStr = currentDate.format('DD/MM/YYYY');
          const month = currentDate.month() + 1;
          const year = currentDate.year();
          
          const dayResponse = await dashboardService.getDailyDowntimeStats(month, year, lineId, dateStr);
          
          if (dayResponse.success && dayResponse.data && dayResponse.data.length > 0) {
            const lineData = dayResponse.data[0];
            
            // Data is inside dailyStats array
            if (lineData.dailyStats && lineData.dailyStats.length > 0) {
              const dayData = lineData.dailyStats[0];
              
              days.push({
                time: currentDate.format('DD/MM'),
                target: dayData.targetAmount || 0,
                actual: dayData.resultAmount || 0,
                oee: dayData.oee || 0,
                achievement: dayData.achievement || 0,
                availability: dayData.availability || 0,
                performance: dayData.performance || 0,
                quality: dayData.quality || 0,
                plannedTime: dayData.plannedProductionTime || 0,
                totalDowntime: dayData.totalDowntime || 0,
                setupDowntime: dayData.setupAdjustmentDowntime?.duration || 0,
                breakdownDowntime: dayData.breakdownDowntime?.duration || 0,
                defects: dayData.defects?.duration || 0,
                totalLoss: dayData.totalLoss || 0,
                aLoss: dayData.aLoss || 0,
                pLoss: dayData.pLoss || 0,
                qLoss: dayData.qLoss || 0
              });
            }
          }
          currentDate = currentDate.add(1, 'day');
        }
        setApiData(days);
      } else {
        // Shift và Hour tự động dùng ngày hôm nay
        const today = dayjs();
        const dateStr = today.format('DD/MM/YYYY');
        const month = today.month() + 1;
        const year = today.year();
        
        response = await dashboardService.getDailyDowntimeStats(month, year, lineId, dateStr);
        
        if (response.success && response.data && response.data.length > 0) {
          const lineData = response.data[0];
          
          // Data is inside dailyStats array
          if (lineData.dailyStats && lineData.dailyStats.length > 0) {
            const dayData = lineData.dailyStats[0];
            
            // Tạo dữ liệu cho shift/hour view (vì API chỉ trả về dữ liệu theo ngày)
            const formattedData = [{
              time: dayData.date || today.format('DD/MM/YYYY'),
              target: dayData.targetAmount || 0,
              actual: dayData.resultAmount || 0,
              oee: dayData.oee || 0,
              achievement: dayData.achievement || 0,
              availability: dayData.availability || 0,
              performance: dayData.performance || 0,
              quality: dayData.quality || 0,
              plannedTime: dayData.plannedProductionTime || 0,
              totalDowntime: dayData.totalDowntime || 0,
              setupDowntime: dayData.setupAdjustmentDowntime?.duration || 0,
              breakdownDowntime: dayData.breakdownDowntime?.duration || 0,
              defects: dayData.defects?.duration || 0,
              totalLoss: dayData.totalLoss || 0,
              aLoss: dayData.aLoss || 0,
              pLoss: dayData.pLoss || 0,
              qLoss: dayData.qLoss || 0
            }];
            setApiData(formattedData);
          } else {
            setApiData([]);
          }
        } else {
          setApiData([]);
        }
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const data = getTableData();
    const columns = getTableColumns();
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = columns.map(col => col.title);
    csvContent += headers.join(",") + "\n";
    data.forEach(row => {
      const values = columns.map(col => row[col.dataIndex] || '');
      csvContent += values.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `production_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSearchParams({
      productionLine: undefined,
      searchType: 'day',
      shift: '1',
      selectedDate: dayjs(),
      dateRange: null,
      timeRange: null
    });
    setShowResults(false);
  };

  const stats = showResults ? calculateStats() : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      padding: '24px'
    }}>
      {/* Page Header */}
      <div style={{
        background: '#fff',
        borderRadius: '2px',
        padding: '24px 32px',
        marginBottom: '24px',
        borderLeft: '4px solid #283652'
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ 
                margin: 0, 
                color: '#283652',
                fontWeight: 600,
                fontSize: '24px'
              }}>
                Báo cáo sản lượng sản xuất
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                {dayjs().format('dddd, D MMMM, YYYY')}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="processing" style={{ padding: '4px 12px', fontSize: '13px' }}>
                Dữ liệu thời gian thực
              </Tag>
              <Tag color="default" style={{ padding: '4px 12px', fontSize: '13px' }}>
                {dayjs().format('HH:mm:ss')}
              </Tag>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Search Panel */}
      <Card
        title={
          <Space>
            <SettingOutlined style={{ color: '#283652' }} />
            <span style={{ color: '#283652', fontWeight: 600 }}>Tham số tìm kiếm</span>
          </Space>
        }
        style={{
          marginBottom: '24px',
          borderRadius: '2px',
          border: '1px solid #e8e8e8'
        }}
        headStyle={{
          background: '#fafafa',
          borderBottom: '1px solid #e8e8e8',
          padding: '12px 24px'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Spin spinning={linesLoading}>
          <Row gutter={[24, 20]}>
            {/* Production Line */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong style={{ color: '#283652', fontSize: '13px' }}>
                  Dây chuyền sản xuất <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Select
                  placeholder="Chọn dây chuyền"
                  value={searchParams.productionLine}
                  onChange={(value) => setSearchParams({ ...searchParams, productionLine: value })}
                  style={{ width: '100%' }}
                  size="large"
                  loading={linesLoading}
                >
                  {productionLines.map(line => (
                    <Option key={line.lineId} value={line.lineId}>
                      {line.lineName}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>

            {/* Search Type */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong style={{ color: '#283652', fontSize: '13px' }}>
                  Loại báo cáo <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <Radio.Group
                  value={searchParams.searchType}
                  onChange={(e) => setSearchParams({ ...searchParams, searchType: e.target.value })}
                  style={{ width: '100%' }}
                  size="large"
                  buttonStyle="solid"
                >
                  <Radio.Button value="hour" style={{ width: '33.33%', textAlign: 'center' }}>
                    <ClockCircleOutlined /> Theo giờ
                  </Radio.Button>
                  <Radio.Button value="shift" style={{ width: '33.33%', textAlign: 'center' }}>
                    <ClockCircleOutlined /> Theo ca
                  </Radio.Button>
                  <Radio.Button value="day" style={{ width: '33.33%', textAlign: 'center' }}>
                    <CalendarOutlined /> Theo ngày
                  </Radio.Button>
                </Radio.Group>
              </Space>
            </Col>

            {/* Conditional Inputs */}
            {searchParams.searchType === 'hour' && (
              <Col xs={24} lg={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong style={{ color: '#283652', fontSize: '13px' }}>
                    Khoảng thời gian (Hôm nay: {dayjs().format('DD/MM/YYYY')})
                  </Text>
                  <TimePicker.RangePicker
                    value={searchParams.timeRange}
                    onChange={(time) => setSearchParams({ ...searchParams, timeRange: time })}
                    style={{ width: '100%' }}
                    size="large"
                    format="HH:mm"
                    placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
                  />
                </Space>
              </Col>
            )}

            {searchParams.searchType === 'shift' && (
              <Col xs={24} lg={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong style={{ color: '#283652', fontSize: '13px' }}>
                    Ca làm việc (Hôm nay: {dayjs().format('DD/MM/YYYY')})
                  </Text>
                  <Select
                    value={searchParams.shift}
                    onChange={(value) => setSearchParams({ ...searchParams, shift: value })}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Option value="1">Ca 1: 07:00 - 15:00</Option>
                    <Option value="2">Ca 2: 15:00 - 23:00</Option>
                    <Option value="3">Ca 3: 23:00 - 07:00</Option>
                  </Select>
                </Space>
              </Col>
            )}

            {searchParams.searchType === 'day' && (
              <Col xs={24} lg={12}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong style={{ color: '#283652', fontSize: '13px' }}>
                    Khoảng thời gian
                  </Text>
                  <RangePicker
                    value={searchParams.dateRange}
                    onChange={(dates) => setSearchParams({ ...searchParams, dateRange: dates })}
                    style={{ width: '100%' }}
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  />
                </Space>
              </Col>
            )}

            {/* Action Buttons */}
            <Col span={24}>
              <Divider style={{ margin: '8px 0 16px 0' }} />
              <Row gutter={12}>
                <Col flex="auto">
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    size="large"
                    block
                    loading={loading}
                    style={{
                      height: 48,
                      background: '#283652',
                      borderColor: '#283652',
                      fontWeight: 600
                    }}
                  >
                    Tạo báo cáo
                  </Button>
                </Col>
                <Col>
                  <Button
                    onClick={handleReset}
                    size="large"
                    disabled={loading}
                    style={{
                      height: 48,
                      width: 120
                    }}
                  >
                    Đặt lại
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Spin>
      </Card>

      {/* Results Section */}
      {showResults && (
        <Spin spinning={loading}>
          <div>
            {/* Summary Stats */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card bodyStyle={{ padding: '20px' }} style={{ borderLeft: '3px solid #52c41a' }}>
                  <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                    Sản lượng mục tiêu
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#283652' }}>
                    {stats.totalTarget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    sản phẩm
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bodyStyle={{ padding: '20px' }} style={{ borderLeft: '3px solid #1890ff' }}>
                  <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                    Sản lượng thực tế
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#283652' }}>
                    {stats.totalActual.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    sản phẩm
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bodyStyle={{ padding: '20px' }} style={{ borderLeft: '3px solid #faad14' }}>
                  <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                    OEE trung bình
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#283652' }}>
                    {stats.avgOEE}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    hiệu suất
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bodyStyle={{ padding: '20px' }} style={{ borderLeft: '3px solid #722ed1' }}>
                  <div style={{ fontSize: '13px', color: '#8c8c8c', marginBottom: '8px' }}>
                    Tỷ lệ đạt được
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: '#283652' }}>
                    {stats.achievement}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    so với mục tiêu
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Export Button */}
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                size="large"
                style={{
                  background: '#283652',
                  color: '#fff',
                  borderColor: '#283652'
                }}
              >
                Xuất CSV
              </Button>
            </div>

            {/* Chart Card */}
            <Card
              title={
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#283652' }}>
                  Phân tích sản xuất
                </span>
              }
              style={{
                marginBottom: '24px',
                border: '1px solid #d9d9d9'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <ResponsiveContainer width="100%" height={420}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#8c8c8c"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#8c8c8c"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#8c8c8c"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="target" fill="#3b82f6" name="Mục tiêu" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="left" dataKey="actual" fill="#10b981" name="Thực tế" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="oee" stroke="#f59e0b" strokeWidth={3} name="OEE (%)" />
                  <Line yAxisId="right" type="monotone" dataKey="availability" stroke="#06b6d4" strokeWidth={2} name="Khả dụng A (%)" strokeDasharray="5 5" />
                  <Line yAxisId="right" type="monotone" dataKey="performance" stroke="#8b5cf6" strokeWidth={2} name="Hiệu suất P (%)" strokeDasharray="5 5" />
                  <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#ec4899" strokeWidth={2} name="Chất lượng Q (%)" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Table Card */}
            <Card
              title={
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#283652' }}>
                  Dữ liệu chi tiết sản xuất
                </span>
              }
              style={{
                border: '1px solid #d9d9d9'
              }}
              bodyStyle={{ padding: 0 }}
            >
            <Table
              columns={getTableColumns()}
              dataSource={getTableData()}
              pagination={false}
              scroll={{ x: 'max-content' }}
              size="middle"
              bordered
              rowClassName={(record) => {
                if (record.isHeader) return 'header-row';
                if (record.highlight) return 'highlighted-row';
                if (record.isSum) return 'sum-row';
                return '';
              }}
              style={{
                '--highlighted-bg': '#eff6ff',
                '--highlighted-color': '#2563eb'
              }}
            />
            <style>{`
              .ant-table-thead > tr > th {
                background: #1e3a8a !important;
                color: white !important;
                font-weight: 600;
                border-right: 1px solid #1e40af;
                padding: 14px 8px;
                font-size: 13px;
              }
              .ant-table-tbody > tr:nth-child(even) {
                background: #f8fafc;
              }
              .ant-table-tbody > tr:hover {
                background: #eff6ff !important;
              }
              .ant-table-tbody > tr.highlighted-row {
                background: #eff6ff !important;
              }
              .ant-table-tbody > tr.highlighted-row > td {
                color: #2563eb;
                font-weight: 600;
              }
              .ant-table-tbody > tr.sum-row > td {
                font-weight: 700;
                background: #f1f5f9;
              }
              .ant-table-tbody > tr.header-row {
                background: #e0e7ff !important;
              }
              .ant-table-tbody > tr.header-row > td {
                font-weight: 700;
                color: #3730a3;
                font-size: 12px;
                text-align: center !important;
                background: #e0e7ff;
              }
              .ant-table-tbody > tr > td {
                border-right: 1px solid #e2e8f0;
                padding: 12px 8px;
                font-size: 13px;
              }
            `}</style>
          </Card>
        </div>
      </Spin>
      )}
    </div>
  );
};

export default ProductionDetailReport;