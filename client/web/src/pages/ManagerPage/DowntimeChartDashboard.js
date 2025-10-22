import React, { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Tabs, Statistic, Progress, Space, Tag } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, ClockCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

// Danh sách dây chuyền
const productionLines = [
    { id: 'S15K', name: 'Dây chuyền S15K', status: 'active', oee: 89.2 },
    { id: 'S16K', name: 'Dây chuyền S16K', status: 'active', oee: 92.5 },
    { id: 'S17K', name: 'Dây chuyền S17K', status: 'warning', oee: 78.3 },
    { id: 'S18K', name: 'Dây chuyền S18K', status: 'active', oee: 91.8 }
];

const DowntimeChartDashboard = () => {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1; // dayjs().month() trả về 0-11, cần +1 để thành 1-12
    
    // Tạo mảng tháng từ 01 đến tháng hiện tại của năm hiện tại
    const months = [];
    for (let month = 1; month <= currentMonth; month++) {
        months.push(`${month.toString().padStart(2, '0')}/${currentYear}`);
    }

    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MM/YYYY'));
    const [selectedLines, setSelectedLines] = useState(productionLines.map(line => line.id));

    // State để control visibility của các bar series cho từng dây chuyền
    const [barVisibility, setBarVisibility] = useState(() => {
        const initial = {};
        productionLines.forEach(line => {
            initial[line.id] = {
                dungNgan: true,
                dungDai: true,
                phaPham: true,
                dauCuoiCa: true,
                doiMayThayDao: true,
                tacDoThaoTac: true,
                ngoaiRa: true,
                oee: true,
                mucTieu: true,
                tyLeMat: true
            };
        });
        return initial;
    });

    const [pieVisibility, setPieVisibility] = useState(() => {
        const initial = {};
        productionLines.forEach(line => {
            initial[line.id] = {
                'Thời gian hoạt động': true,
                'Dừng ngắn': true,
                'Dừng dài': true,
                'Phá phẩm': true,
                'Đầu cuối ca': true,
                'Đổi mã thay dao': true,
                'Tác độ thao tác': true,
                'Ngoại ra': true
            };
        });
        return initial;
    });

    // Hàm toggle visibility của legend items
    const toggleLegendItem = (key, lineId) => {
        setBarVisibility(prev => ({
            ...prev,
            [lineId]: {
                ...prev[lineId],
                [key]: !prev[lineId][key]
            }
        }));
    };

    const togglePieLegendItem = (name, lineId) => {
        setPieVisibility(prev => ({
            ...prev,
            [lineId]: {
                ...prev[lineId],
                [name]: !prev[lineId][name]
            }
        }));
    };

    // Custom Legend Component
    const CustomLegend = ({ lineId }) => {
        const legendItems = [
            { key: 'dungNgan', name: 'Dừng ngắn', color: '#1890ff' },
            { key: 'dungDai', name: 'Dừng dài', color: '#0050b3' },
            { key: 'phaPham', name: 'Phá phẩm', color: '#8c8c8c' },
            { key: 'dauCuoiCa', name: 'Đầu cuối ca', color: '#fa8c16' },
            { key: 'doiMayThayDao', name: 'Đổi mã thay dao', color: '#e8e8e8' },
            { key: 'tacDoThaoTac', name: 'Tác độ thao tác', color: '#95de64' },
            { key: 'ngoaiRa', name: 'Ngoại ra', color: '#b37feb' },
            { key: 'oee', name: 'OEE', color: 'white', border: '2px solid #000' },
            { key: 'mucTieu', name: 'Mục tiêu', color: 'transparent', border: '3px dashed #000' },
            { key: 'tyLeMat', name: 'Tỷ lệ mất mát', color: '#ff4d4f' }
        ];

        return (
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <Row gutter={[8, 8]} style={{ fontSize: '13px' }}>
                    <Col span={24}>
                        <Space wrap size={[16, 12]}>
                            {legendItems.map((item) => (
                                <div 
                                    key={item.key} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        cursor: 'pointer',
                                        opacity: barVisibility[lineId][item.key] ? 1 : 0.4
                                    }}
                                    onClick={() => toggleLegendItem(item.key, lineId)}
                                >
                                    <div style={{ 
                                        width: '40px', 
                                        height: item.key === 'mucTieu' ? '3px' : '14px', 
                                        backgroundColor: item.color,
                                        borderRadius: item.key === 'mucTieu' ? '0' : '2px',
                                        border: item.border || 'none',
                                        borderTop: item.key === 'mucTieu' ? '3px dashed #000' : item.border
                                    }}></div>
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </Space>
                    </Col>
                </Row>
            </div>
        );
    };

    // Custom Pie Legend Component
    const CustomPieLegend = ({ pieData, lineId }) => {
        const allLegendItems = [
            ...pieData.map(item => ({ name: item.name, color: item.color })),
            { name: 'Đổi mã thay dao', color: '#e8e8e8' },
            { name: 'Tác độ thao tác', color: '#95de64' },
            { name: 'Ngoại ra', color: '#b37feb' }
        ];

        return (
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                <Row gutter={[8, 8]} style={{ fontSize: '13px' }}>
                    <Col span={24}>
                        <Space wrap size={[16, 12]}>
                            {allLegendItems.map((item) => (
                                <div
                                    key={item.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        opacity: pieVisibility[lineId][item.name] ? 1 : 0.4
                                    }}
                                    onClick={() => togglePieLegendItem(item.name, lineId)}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '14px',
                                        backgroundColor: item.color,
                                        borderRadius: '2px',
                                        border: item.color === '#e8e8e8' ? '1px solid #d9d9d9' : 'none'
                                    }}></div>
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </Space>
                    </Col>
                </Row>
            </div>
        );
    };

    const generatePieData = (lineId) => {
        const baseData = [
            { name: 'Thời gian hoạt động', value: 83.7, color: '#52c41a' },
            { name: 'Dừng ngắn', value: 7.8, color: '#1890ff' },
            { name: 'Dừng dài', value: 3.3, color: '#0050b3' },
            { name: 'Phá phẩm', value: 1.6, color: '#8c8c8c' },
            { name: 'Đầu cuối ca', value: 3.6, color: '#fa8c16' }
        ];

        // Thay đổi nhẹ dữ liệu cho mỗi dây chuyền
        const variance = lineId.charCodeAt(lineId.length - 2) % 10;
        return baseData.map(item => ({
            ...item,
            value: item.value + (Math.random() - 0.5) * variance
        }));
    };

    // Hàm tạo dữ liệu cho biểu đồ cột
    const generateBarData = (lineId, month) => {
        const daysInMonth = 31; // Có thể tính động dựa trên tháng
        const barData = [];
        const [monthNum, year] = month.split('/');

        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${i.toString().padStart(2, '0')}/${monthNum}/${year}`;
            const variance = (lineId.charCodeAt(lineId.length - 2) + i) % 5;

            barData.push({
                date: date,
                dungNgan: 8 + Math.random() * 7 + variance,
                dungDai: 6 + Math.random() * 6 + variance,
                phaPham: 3 + Math.random() * 7 + variance,
                dauCuoiCa: 2 + Math.random() * 6 + variance,
                doiMayThayDao: 1 + Math.random() * 4 + variance,
                tacDoThaoTac: 0.5 + Math.random() * 2.5 + variance,
                ngoaiRa: 0.3 + Math.random() * 1.7 + variance,
                oee: 85 + Math.random() * 10 + (variance - 2),
                tyLeMat: 8 + Math.random() * 7 + variance,
                mucTieu: 90
            });
        }
        return barData;
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    minWidth: '220px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
                        {payload[0].payload.date}
                    </div>
                    {payload.map((item, index) => {
                        if (item.dataKey !== 'mucTieu') {
                            return (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: item.color,
                                            marginRight: '10px',
                                            borderRadius: '2px',
                                            border: item.dataKey === 'oee' ? '2px solid white' : 'none'
                                        }}></div>
                                        <span>{item.name}:</span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', marginLeft: '12px' }}>
                                        {item.value.toFixed(item.dataKey === 'oee' || item.dataKey === 'tyLeMat' ? 2 : 1)}%
                                    </span>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{payload[0].name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: payload[0].payload.color }}>
                        {payload[0].value.toFixed(1)}%
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Hiển thị label cho tất cả segments có phần trăm > 0
        if (percent <= 0) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="15px"
                fontWeight="600"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    const renderLineCard = (line) => {
        const pieData = generatePieData(line.id);
        const barData = generateBarData(line.id, selectedMonth);

        const avgOEE = (barData.reduce((sum, d) => sum + d.oee, 0) / barData.length).toFixed(1);
        const avgLoss = (barData.reduce((sum, d) => sum + d.tyLeMat, 0) / barData.length).toFixed(1);
        const productivity = pieData.find(d => d.name === 'Thời gian hoạt động')?.value || 0;

        // Lọc dữ liệu pie chart dựa trên visibility
        const filteredPieData = pieData.filter(item => pieVisibility[line.id][item.name]);
        // Tính toán lại phần trăm cho dữ liệu đã lọc
        const totalFilteredValue = filteredPieData.reduce((sum, item) => sum + item.value, 0);
        const normalizedPieData = filteredPieData.map(item => ({
            ...item,
            value: totalFilteredValue > 0 ? item.value : 0
        }));

        return (
            <div key={line.id} style={{ marginBottom: '32px' }}>
                {/* Header Cards cho từng dây chuyền */}
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    {/* Card OEE */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '140px'
                            }}
                            bodyStyle={{ padding: '20px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <div style={{ color: '#000' }}>
                                <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.7 }}>
                                    {/* <DashboardOutlined style={{ marginRight: '8px' }} /> */}
                                    {line.name}
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {avgOEE}%
                                    <span style={{ fontSize: '14px', marginLeft: '8px', opacity: 0.8 }}>OEE</span>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Card Thời gian hoạt động */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '140px'
                            }}
                            bodyStyle={{ padding: '20px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Statistic
                                title={<span style={{ color: '#000', opacity: 0.7, fontSize: '16px' }}>Thời gian hoạt động</span>}
                                value={productivity.toFixed(1)}
                                suffix="%"
                                valueStyle={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}
                                //prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Card>
                    </Col>

                    {/* Card Tỷ lệ mất mát */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '140px'
                            }}
                            bodyStyle={{ padding: '20px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Statistic
                                title={<span style={{ color: '#000', opacity: 0.7, fontSize: '16px' }}>Tỷ lệ mất mát TB</span>}
                                value={avgLoss}
                                suffix="%"
                                valueStyle={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}
                                //prefix={avgLoss < 10 ? <ArrowDownOutlined style={{ color: '#52c41a' }} /> : <ArrowUpOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ tròn - Full Width */}
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                        <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                        Phân bổ thời gian - {line.name}
                                    </span>
                                </div>
                            }
                            style={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #f0f0f0'
                            }}
                            bodyStyle={{ padding: '32px' }}
                        >
                            <Row>
                                <Col span={24}>
                                    <ResponsiveContainer width="100%" height={500}>
                                        <PieChart>
                                            <Pie
                                                data={normalizedPieData}
                                                cx="50%"
                                                cy="45%"
                                                labelLine={false}
                                                label={renderCustomizedLabel}
                                                outerRadius={180}
                                                innerRadius={110}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {normalizedPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: '32px' }}>
                                <Col span={24}>
                                    <CustomPieLegend pieData={pieData} lineId={line.id} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ cột - Full Width */}
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col span={24}>
                        <Card
                            title={
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>
                                    Chi tiết hiệu suất theo ngày - {selectedMonth}
                                </span>
                            }
                            style={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #f0f0f0'
                            }}
                            bodyStyle={{ padding: '32px' }}
                        >
                            <CustomLegend lineId={line.id} />
                            <ResponsiveContainer width="100%" height={600}>
                                <ComposedChart
                                    data={barData}
                                    margin={{ top: 20, right: 40, left: 20, bottom: 10 }}
                                    barCategoryGap="15%"
                                >
                                    <defs>
                                        <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        angle={-45}
                                        textAnchor="end"
                                        height={90}
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        label={{ value: 'Hiệu suất (%)', angle: -90, position: 'insideLeft', style: { fontSize: 13 } }}
                                        domain={[0, 100]}
                                        tick={{ fontSize: 11 }}
                                        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        label={{ value: 'Mất mát (dừng) (%)', angle: 90, position: 'insideRight', style: { fontSize: 13 } }}
                                        domain={[0, 100]}
                                        tick={{ fontSize: 11 }}
                                        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    {barVisibility[line.id].dungNgan && <Bar yAxisId="left" dataKey="dungNgan" stackId="a" fill="#1890ff" name="Dừng ngắn" radius={[0, 0, 0, 0]} barSize={20} />}
                                    {barVisibility[line.id].dungDai && <Bar yAxisId="left" dataKey="dungDai" stackId="a" fill="#0050b3" name="Dừng dài" barSize={20} />}
                                    {barVisibility[line.id].phaPham && <Bar yAxisId="left" dataKey="phaPham" stackId="a" fill="#8c8c8c" name="Phá phẩm" barSize={20} />}
                                    {barVisibility[line.id].dauCuoiCa && <Bar yAxisId="left" dataKey="dauCuoiCa" stackId="a" fill="#fa8c16" name="Đầu cuối ca" barSize={20} />}
                                    {barVisibility[line.id].doiMayThayDao && <Bar yAxisId="left" dataKey="doiMayThayDao" stackId="a" fill="#e8e8e8" name="Đổi mã thay dao" barSize={20} />}
                                    {barVisibility[line.id].tacDoThaoTac && <Bar yAxisId="left" dataKey="tacDoThaoTac" stackId="a" fill="#95de64" name="Tác độ thao tác" barSize={20} />}
                                    {barVisibility[line.id].ngoaiRa && <Bar yAxisId="left" dataKey="ngoaiRa" stackId="a" fill="#b37feb" name="Ngoại ra" radius={[4, 4, 0, 0]} barSize={20} />}
                                    {barVisibility[line.id].oee && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="oee"
                                        stroke="#000"
                                        strokeWidth={3}
                                        dot={{ fill: '#fff', stroke: '#000', strokeWidth: 2, r: 5 }}
                                        name="OEE"
                                    />}
                                    {barVisibility[line.id].mucTieu && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="mucTieu"
                                        stroke="#ff0000ff"
                                        strokeWidth={2.5}
                                        strokeDasharray="6 6"
                                        dot={false}
                                        name="Mục tiêu"
                                    />}
                                    {barVisibility[line.id].tyLeMat && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="tyLeMat"
                                        stroke="#ff4d4f"
                                        strokeWidth={1.5}
                                        dot={{ fill: '#ff4d4f', r: 4 }}
                                        name="Tỷ lệ mất mát"
                                    />}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <div style={{
            padding: '24px',
            background: 'linear-gradient(180deg, #f0f2f5 0%, #ffffff 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Dashboard */}
            <div style={{
                background: 'linear-gradient(135deg, #334766 0%, #0861c1ff 100%)',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(24, 144, 255, 0.25)',
                color: 'white'
            }}>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={12}>
                        <div>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                margin: 0,
                                color: 'white',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                Biểu đồ biểu thị thời gian dừng máy
                            </h1>
                            <p style={{
                                fontSize: '16px',
                                margin: '8px 0 0 0',
                                opacity: 0.95,
                                fontWeight: '400'
                            }}>
                                Theo dõi hiệu suất và phân tích chi tiết các dây chuyền sản xuất
                            </p>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Row gutter={16} justify="end">
                            <Col xs={24} sm={12} md={10}>
                                <div style={{ marginBottom: '8px', fontSize: '13px', opacity: 0.9 }}>
                                    🗓️ Chọn tháng
                                </div>
                                <Select
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    style={{ width: '100%' }}
                                    size="large"
                                >
                                    {months.map(month => (
                                        <Option key={month} value={month}>{month}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={10}>
                                <div style={{ marginBottom: '8px', fontSize: '13px', opacity: 0.9 }}>
                                    🏭 Chọn dây chuyền
                                </div>
                                <Select
                                    mode="multiple"
                                    value={selectedLines}
                                    onChange={setSelectedLines}
                                    style={{ width: '100%' }}
                                    size="large"
                                    placeholder="Chọn dây chuyền"
                                    maxTagCount={2}
                                >
                                    {productionLines.map(line => (
                                        <Option key={line.id} value={line.id}>
                                            {line.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            {/* Tổng quan nhanh */}
            {/* <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {productionLines
          .filter(line => selectedLines.includes(line.id))
          .map(line => (
            <Col xs={24} sm={12} lg={6} key={line.id}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  background: line.status === 'active' 
                    ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                    : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {line.name}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}>
                  {line.oee}%
                </div>
                <Progress 
                  percent={line.oee} 
                  strokeColor={line.status === 'active' ? '#52c41a' : '#faad14'}
                  showInfo={false}
                  style={{ marginTop: '12px' }}
                />
              </Card>
            </Col>
          ))}
      </Row> */}

            {/* Render các dây chuyền được chọn */}
            {productionLines
                .filter(line => selectedLines.includes(line.id))
                .map(line => renderLineCard(line))}
        </div>
    );
};

export default DowntimeChartDashboard;