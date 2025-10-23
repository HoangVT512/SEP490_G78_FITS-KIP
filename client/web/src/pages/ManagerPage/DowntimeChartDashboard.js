import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Tabs, Statistic, Progress, Space, Tag } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area, AreaChart, Scatter, ScatterChart } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, ClockCircleOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { name } from 'dayjs/locale/vi';
import { authService } from '../../services/authService';
import { lineService } from '../../services/lineService';
import { userService } from '../../services/userService';
import { dashboardService } from '../../services/dashboardService';

const { Option } = Select;
const { TabPane } = Tabs;

const DowntimeChartDashboard = () => {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1; // dayjs().month() trả về 0-11, cần +1 để thành 1-12

    // Tạo mảng tháng từ 01 đến tháng hiện tại của năm hiện tại
    const months = [];
    for (let month = 1; month <= currentMonth; month++) {
        months.push(`${month.toString().padStart(2, '0')}/${currentYear}`);
    }

    // State cho dữ liệu user và lines
    const [currentUser, setCurrentUser] = useState(null);
    const [productionLines, setProductionLines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MM/YYYY'));
    const [selectedLines, setSelectedLines] = useState([]);

    // State cho downtime data từ API
    const [downtimeData, setDowntimeData] = useState({});

    // State cho daily downtime data từ API
    const [dailyDowntimeData, setDailyDowntimeData] = useState([]);

    // Fetch user và lines data khi component mount
    useEffect(() => {
        const fetchUserAndLines = async () => {
            try {
                setLoading(true);
                setError(null);

                // Lấy thông tin user hiện tại
                let user = authService.getStoredUser();
                if (!user) {
                    setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
                    return;
                }

                // Nếu user không có departmentId, thử lấy từ API
                if (!user.departmentId && user.id) {
                    try {
                        console.log('User missing departmentId, fetching current user info...');
                        const currentUserInfo = await authService.getCurrentUser();
                        if (currentUserInfo && currentUserInfo.departmentId) {
                            user.departmentId = currentUserInfo.departmentId;
                            console.log('Got departmentId from current user API:', user.departmentId);
                        }
                    } catch (deptError) {
                        console.error('Error fetching current user info:', deptError);
                    }
                }

                setCurrentUser(user);

                // Lấy danh sách lines được phép xem dựa trên quyền
                let allowedLines = [];

                // Debug: log thông tin user
                console.log('Current user:', user);
                console.log('User roles:', user.roles);
                console.log('User departmentId:', user.departmentId);

                // Kiểm tra vai trò của user
                console.log('Checking user roles for manager...');
                console.log('user.roles:', user.roles);
                console.log('user.roles type:', typeof user.roles);
                console.log('user.roles is array:', Array.isArray(user.roles));

                const isManager = user.roles && Array.isArray(user.roles) && user.roles.some(role => 
                    role && typeof role === 'string' && role.includes('Quản lý')
                );

                console.log('Is manager:', isManager);

                if (isManager) {
                    // Nếu là quản lý, lấy tất cả lines trong phòng ban của họ
                    // Giả sử user có departmentId, lấy lines theo department
                    if (user.departmentId) {
                        try {
                            console.log('Getting lines by department for manager...');
                            // Sử dụng API endpoint để lấy lines theo department
                            const departmentLines = await lineService.getLinesByDepartment(user.departmentId);
                            console.log('Department lines for manager:', departmentLines);
                            allowedLines = departmentLines;
                        } catch (lineError) {
                            console.error('Lỗi lấy dánh sách dây chuyền theo phòng ban:', lineError);
                            // Fallback: lấy tất cả lines active
                            allowedLines = await lineService.getActiveLines();
                        }
                    } else {
                        console.log('Manager has no departmentId, getting all active lines as fallback');
                        // Nếu không có departmentId, lấy tất cả lines active
                        allowedLines = await lineService.getActiveLines();
                    }
                } else {
                    // Nếu không phải quản lý, chỉ lấy lines mà user được phân công
                    try {
                        console.log('Getting user-specific lines...');
                        const userLines = await lineService.getLinesByUser(user.id);
                        allowedLines = userLines || [];
                        console.log('User lines:', allowedLines);
                    } catch (lineError) {
                        console.error('Lỗi lấy danh sách người dùng với dây chuyền:', lineError);
                        allowedLines = [];
                    }
                }

                // Transform data để phù hợp với format hiện tại
                const transformedLines = allowedLines.map(line => ({
                    id: line.lineId.toString(),
                    name: line.lineName,
                    status: line.isActive ? 'active' : 'inactive',
                    oee: 85 + Math.random() * 10, // Giá trị OEE giả lập
                    departmentId: line.departmentId,
                    departmentName: line.departmentName
                }));

                setProductionLines(transformedLines);

                // Set selectedLines mặc định là tất cả lines được phép
                const lineIds = transformedLines.map(line => line.id);
                setSelectedLines(lineIds);

                // Cập nhật barVisibility và pieVisibility dựa trên các dây chuyền được phép
                const barInitial = {};
                const pieInitial = {};
                transformedLines.forEach(line => {
                    barInitial[line.id] = {
                        dungNgan: true,
                        dungDai: true,
                        phaPham: true,
                        dauCuoiCa: true,
                        doiMa: true,
                        oee: true,
                        mucTieu: true,
                        tyLeMat: true
                    };
                    pieInitial[line.id] = {
                        'Thời gian hoạt động': true,
                        'Dừng ngắn': true,
                        'Dừng Dài': true,
                        'Phế phẩm': true,
                        'Vệ sinh đầu/cuối ca': true,
                        'Đổi mã': true
                    };
                });
                setBarVisibility(barInitial);
                setPieVisibility(pieInitial);

            } catch (error) {
                console.error('Lỗi lấy dữ liệu:', error);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndLines();
    }, []);

    // Fetch downtime data khi selectedMonth hoặc selectedLines thay đổi
    useEffect(() => {
        const fetchDowntimeData = async () => {
            if (!selectedLines.length) return;

            try {
                const [monthNum, year] = selectedMonth.split('/');
                const newDowntimeData = {};

                // Fetch data cho từng line được chọn
                for (const lineId of selectedLines) {
                    try {
                        const response = await dashboardService.getDowntimeStats(
                            parseInt(monthNum),
                            parseInt(year),
                            parseInt(lineId)
                        );

                        if (response.success) {
                            newDowntimeData[lineId] = response.data;
                        }
                    } catch (error) {
                        console.error(`Error fetching downtime data for line ${lineId}:`, error);
                        // Set dữ liệu mặc định nếu API lỗi
                        newDowntimeData[lineId] = {
                            totalOperatingMinutes: 0,
                            operatingTimePercentage: 0,
                            totalDowntime: 0,
                            downtimeByType: []
                        };
                    }
                }

                setDowntimeData(newDowntimeData);
            } catch (error) {
                console.error('Error fetching downtime data:', error);
            }
        };

        fetchDowntimeData();
    }, [selectedMonth, selectedLines]);

    // Fetch daily downtime data khi selectedMonth hoặc selectedLines thay đổi
    useEffect(() => {
        const fetchDailyDowntimeData = async () => {
            if (!selectedLines.length) return;

            try {
                const [monthNum, year] = selectedMonth.split('/');
                const response = await dashboardService.getDailyDowntimeStats(
                    parseInt(monthNum),
                    parseInt(year)
                );

                if (response.success) {
                    setDailyDowntimeData(response.data);
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu dừng máy hàng ngày:', error);
                setDailyDowntimeData([]);
            }
        };

        fetchDailyDowntimeData();
    }, [selectedMonth, selectedLines]);

    // State để control visibility của các bar series cho từng dây chuyền
    const [barVisibility, setBarVisibility] = useState({});

    const [pieVisibility, setPieVisibility] = useState({});

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
            { key: 'dungDai', name: 'Dừng Dài', color: '#0050b3' },
            { key: 'phaPham', name: 'Phế phẩm', color: '#8c8c8c' },
            { key: 'dauCuoiCa', name: 'Vệ sinh đầu/cuối ca', color: '#fa8c16' },
            { key: 'doiMa', name: 'Đổi mã', color: '#e8e8e8' },
            { key: 'oee', name: 'OEE', color: '#28170aff', border: 'none' },
            { key: 'mucTieu', name: 'Mục tiêu', border: '3px dashed #ff0000ff' },
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
                                        width: item.key === 'tyLeMat' ? '10px' : '40px',  
                                        height: item.key === 'mucTieu' ? '3px' : (item.key === 'tyLeMat' ? '10px' : '14px'),  
                                        backgroundColor: item.color,
                                        borderRadius: item.key === 'tyLeMat' ? '50%' : (item.key === 'mucTieu' ? '0' : '2px'),
                                        border: item.border || 'none',
                                        //borderTop: item.key === 'mucTieu' ? '3px dashed #000' : item.border
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
            { name: 'Thời gian hoạt động', color: '#52c41a' },
            { name: 'Dừng ngắn', color: '#1890ff' },
            { name: 'Dừng Dài', color: '#0050b3' },
            { name: 'Phế phẩm', color: '#8c8c8c' },
            { name: 'Vệ sinh đầu/cuối ca', color: '#fa8c16' },
            { name: 'Đổi mã', color: '#e8e8e8' }
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
        const apiData = downtimeData[lineId];

        if (!apiData || !apiData.downtimeByType) {
            // Return dữ liệu mặc định nếu chưa có dữ liệu từ API
            return [
                { name: 'Thời gian hoạt động', value: 0, color: '#52c41a' },
                { name: 'Dừng ngắn', value: 0, color: '#1890ff' },
                { name: 'Dừng Dài', value: 0, color: '#0050b3' },
                { name: 'Phế phẩm', value: 0, color: '#8c8c8c' },
                { name: 'Vệ sinh đầu/cuối ca', value: 0, color: '#fa8c16' },
                { name: 'Đổi mã', value: 0, color: '#e8e8e8' }
            ];
        }

        // Debug: log dữ liệu API
        console.log('API Data for line', lineId, ':', apiData);

        // Map dữ liệu từ API sang format cho pie chart
        const colorMap = {
            0: '#52c41a', // Thời gian hoạt động
            1: '#1890ff', // Dừng ngắn
            2: '#0050b3', // Dừng dài
            3: '#8c8c8c', // Phế phẩm
            4: '#fa8c16', // Vệ sinh đầu/cuối ca
            5: '#e8e8e8'  // Đổi mã
        };

        const typeNameMap = {
            0: 'Thời gian hoạt động',
            1: 'Dừng ngắn',
            2: 'Dừng Dài',
            3: 'Phế phẩm',
            4: 'Vệ sinh đầu/cuối ca',
            5: 'Đổi mã'
        };

        const mappedData = apiData.downtimeByType.map(item => {
            const mappedItem = {
                name: typeNameMap[item.typeId] || item.typeName,
                value: item.percentage,
                color: colorMap[item.typeId] || '#cccccc'
            };
            console.log('Mapping item:', item, 'to:', mappedItem);
            return mappedItem;
        });

        // Debug: log dữ liệu đã map
        console.log('Mapped pie data for line', lineId, ':', mappedData);

        return mappedData;
    };

    // Hàm tạo dữ liệu cho biểu đồ cột
    const generateBarData = (lineId, month) => {
        // Lấy số ngày trong tháng
        const [monthNum, year] = month.split('/');
        const daysInMonth = dayjs(`${year}-${monthNum}-01`).daysInMonth();

        // Tạo dữ liệu mặc định cho tất cả các ngày trong tháng
        const barData = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${i.toString().padStart(2, '0')}/${monthNum}/${year}`;
            barData.push({
                date: date,
                dungNgan: 0,
                dungDai: 0,
                phaPham: 0,
                dauCuoiCa: 0,
                doiMa: 0,
                oee: null, // Mặc định null để không nối line
                tyLeMat: 0,
                mucTieu: 90
            });
        }

        // Tìm dữ liệu daily cho line này và cập nhật vào barData
        const lineDailyData = dailyDowntimeData.find(line => line.lineId.toString() === lineId.toString());

        if (lineDailyData && lineDailyData.dailyStats) {
            // Map dữ liệu thực từ API vào các ngày tương ứng
            lineDailyData.dailyStats.forEach(stat => {
                const statDate = dayjs(stat.date);
                const dayOfMonth = statDate.date();
                const statMonth = statDate.month() + 1; // dayjs month is 0-based
                const statYear = statDate.year();

                // Chỉ cập nhật nếu cùng tháng và năm
                if (statMonth === parseInt(monthNum) && statYear === parseInt(year) && dayOfMonth <= daysInMonth) {
                    const index = dayOfMonth - 1; // Array index starts from 0
                    if (barData[index]) {
                        barData[index] = {
                            ...barData[index],
                            dungNgan: stat.downDetails.dungNgan.percentage,
                            dungDai: stat.downDetails.dungDai.percentage,
                            phaPham: stat.downDetails.phePham.percentage,
                            dauCuoiCa: stat.downDetails.veSinhDauCuoiCa.percentage,
                            doiMa: stat.downDetails.doiMa.percentage,
                            oee: stat.oee > 0 ? stat.oee : null, // Chỉ set OEE nếu > 0, ngược lại null để không nối line
                            tyLeMat: stat.lossPercentage,
                            mucTieu: 90
                        };
                    }
                }
            });
        }

        return barData;
    };

    const CustomTooltip = ({ active, payload, barData, lineId }) => {
        if (active && payload && payload.length && barData && lineId) {
            // Tìm dữ liệu daily cho line và date này
            const lineDailyData = dailyDowntimeData.find(line => line.lineId.toString() === lineId.toString());
            const currentDate = payload[0]?.payload?.date;

            let dailyStat = null;
            if (lineDailyData && lineDailyData.dailyStats) {
                // Parse date để so sánh
                const [day, month, year] = currentDate.split('/');
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                dailyStat = lineDailyData.dailyStats.find(stat => stat.date === formattedDate);
            }

            return (
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    minWidth: '280px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    {/* Tiêu đề ngày */}
                    <div style={{
                        marginBottom: '12px',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        paddingBottom: '8px'
                    }}>
                        {currentDate}
                    </div>

                    {payload
                        .slice()
                        .sort((a, b) => {
                            const order = [
                                'dungNgan',
                                'dungDai',
                                'phePham',
                                'veSinhDauCuoiCa',
                                'doiMa',
                                'oee',
                                'mucTieu',
                                'tyLeMat'
                            ];
                            return order.indexOf(a.dataKey) - order.indexOf(b.dataKey);
                        })
                        .map((item, index) => {
                            const isMainMetric = ['oee', 'mucTieu', 'tyLeMat'].includes(item.dataKey);

                            // Lấy thông tin chi tiết từ dailyStat nếu có
                            let details = null;
                            if (dailyStat && !isMainMetric) {
                                const detailKeyMap = {
                                    'dungNgan': 'dungNgan',
                                    'dungDai': 'dungDai',
                                    'phaPham': 'phePham',
                                    'veSinhDauCuoiCa': 'veSinhDauCuoiCa',
                                    'doiMa': 'doiMa'
                                };
                                const detailKey = detailKeyMap[item.dataKey];
                                if (detailKey && dailyStat.downDetails[detailKey]) {
                                    details = dailyStat.downDetails[detailKey];
                                }
                            }

                            return (
                                <div key={index} style={{ marginBottom: '8px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    backgroundColor: item.color,
                                                    marginRight: '10px',
                                                    borderRadius: '2px',
                                                    border:
                                                        item.dataKey === 'oee'
                                                            ? '2px solid white'
                                                            : item.dataKey === 'mucTieu'
                                                                ? '2px dashed #aaa'
                                                                : 'none',
                                                }}
                                            ></div>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                        </div>

                                        {isMainMetric && (
                                            <span
                                                style={{
                                                    fontWeight: 'bold',
                                                    marginLeft: '8px',
                                                    minWidth: '60px',
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {isNaN(item.value)
                                                    ? '—'
                                                    : `${item.value.toFixed(2)}%`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Chi tiết cho nhóm phụ */}
                                    {details && !isMainMetric && (
                                        <div
                                            style={{
                                                marginLeft: '24px',
                                                fontSize: '11px',
                                                lineHeight: '1.4',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {details.percentage > 0
                                                ? `${details.percentage.toFixed(1)}% | Thời lượng: ${details.duration} phút | Số lần: ${details.occurrences}`
                                                : '0% | Thời lượng: 0 phút | Số lần: 0'}
                                        </div>
                                    )}

                                    {/* Fallback cho dữ liệu cũ nếu không có dailyStat */}
                                    {!details && !isMainMetric && (
                                        <div
                                            style={{
                                                marginLeft: '24px',
                                                fontSize: '11px',
                                                lineHeight: '1.4',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {isNaN(item.value)
                                                ? '—'
                                                : `${item.value.toFixed(1)}%`}
                                        </div>
                                    )}
                                </div>
                            );
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
                        {payload[0].value}%
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Hiển thị label cho tất cả segments có phần trăm >= 0
        if (value < 0) return null;

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
                {`${value}%`}
            </text>
        );
    };

    const renderLineCard = (line) => {
        const pieData = generatePieData(line.id);
        const barData = generateBarData(line.id, selectedMonth);

        // Debug: log pieData để kiểm tra
        console.log('Pie data for line', line.id, ':', pieData);

        // Tính toán các giá trị từ API data hoặc dữ liệu mặc định
        const apiData = downtimeData[line.id];
        const operatingTimePercentage = apiData?.operatingTimePercentage || 0;
        const totalDowntime = apiData?.totalDowntime || 0;
        const totalOperatingMinutes = apiData?.totalOperatingMinutes || 0;

        // Tính toán trung bình OEE từ dữ liệu thực (chỉ từ các ngày có OEE > 0)
        let avgOEE = 0;
        const lineDailyData = dailyDowntimeData.find(l => l.lineId.toString() === line.id.toString());
        if (lineDailyData && lineDailyData.dailyStats && lineDailyData.dailyStats.length > 0) {
            const validOeeStats = lineDailyData.dailyStats.filter(stat => stat.oee > 0);
            if (validOeeStats.length > 0) {
                const totalOEE = validOeeStats.reduce((sum, stat) => sum + stat.oee, 0);
                avgOEE = (totalOEE / validOeeStats.length).toFixed(2);
            } else {
                avgOEE = '0.00';
            }
        } else {
            // Fallback: tính từ barData nếu chưa có dữ liệu thực (chỉ từ các ngày có OEE > 0)
            const validOeeData = barData.filter(d => d.oee !== null && d.oee > 0);
            if (validOeeData.length > 0) {
                avgOEE = (validOeeData.reduce((sum, d) => sum + d.oee, 0) / validOeeData.length).toFixed(2);
            } else {
                avgOEE = '0.00';
            }
        }

        // Sử dụng operating time percentage từ API với 2 số thập phân
        const productivity = operatingTimePercentage.toFixed(2);

        // Tính toán tỷ lệ mất mát từ dữ liệu thực
        let avgLoss = '0.00';
        if (lineDailyData && lineDailyData.dailyStats && lineDailyData.dailyStats.length > 0) {
            const totalLoss = lineDailyData.dailyStats.reduce((sum, stat) => sum + stat.lossPercentage, 0);
            avgLoss = (totalLoss / lineDailyData.dailyStats.length).toFixed(2);
        }

        // Không filter pie data theo visibility - hiển thị tất cả data từ API
        // Visibility chỉ dùng cho legend toggle
        const normalizedPieData = pieData
            .filter(item => item.value > 0 && pieVisibility[line.id][item.name]) // Chỉ hiển thị item có value > 0 và được chọn trong legend
            .map(item => ({
                ...item,
                // Đảm bảo value không âm
                value: Math.max(0, item.value)
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
                                value={productivity}
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
                                    margin={{ top: 40, right: 60, left: 20, bottom: 10 }}
                                    barCategoryGap="15%"
                                >
                                    <defs>
                                        <linearGradient id={`colorOee${line.id}`} x1="0" y1="0" x2="0" y2="1">
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
                                    <Tooltip content={<CustomTooltip barData={barData} lineId={line.id} />} />
                                    {barVisibility[line.id].dungNgan && <Bar yAxisId="left" dataKey="dungNgan" stackId="a" fill="#1890ff" name="Dừng ngắn" radius={[0, 0, 0, 0]} barSize={20} />}
                                    {barVisibility[line.id].dungDai && <Bar yAxisId="left" dataKey="dungDai" stackId="a" fill="#0050b3" name="Dừng dài" barSize={20} />}
                                    {barVisibility[line.id].phaPham && <Bar yAxisId="left" dataKey="phaPham" stackId="a" fill="#8c8c8c" name="Phế phẩm" barSize={20} />}
                                    {barVisibility[line.id].dauCuoiCa && <Bar yAxisId="left" dataKey="dauCuoiCa" stackId="a" fill="#fa8c16" name="Vệ sinh dầu/cuối ca" barSize={20} />}
                                    {barVisibility[line.id].doiMa && <Bar yAxisId="left" dataKey="doiMa" stackId="a" fill="#e8e8e8" name="Đổi mã" radius={[4, 4, 0, 0]} barSize={20} />}
                                    {barVisibility[line.id].oee && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="oee"
                                        stroke="#28170aff"
                                        strokeWidth={2.5}
                                        connectNulls={false}
                                        dot={(props) => {
                                            const { cx, cy, payload } = props;
                                            if (!payload || payload.oee === null || payload.oee === 0) return null;
                                            return (
                                                <g>
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={6}
                                                        fill="#28170aff"
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    />
                                                    <text
                                                        x={cx}
                                                        y={cy - 12}
                                                        textAnchor="middle"
                                                        fontSize="11"
                                                        fontWeight="bold"
                                                        fill="#28170aff"
                                                        style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.8)' }}
                                                    >
                                                        {payload.oee.toFixed(1)}%
                                                    </text>
                                                </g>
                                            );
                                        }}
                                        activeDot={false}
                                        name="OEE"
                                    />}
                                    {barVisibility[line.id].mucTieu && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="mucTieu"
                                        stroke="#ff7875"
                                        strokeWidth={2}
                                        strokeDasharray="8 4"
                                        dot={false}
                                        activeDot={false}
                                        name="Mục tiêu"
                                    />}
                                    {barVisibility[line.id].tyLeMat && <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="tyLeMat"
                                        stroke="none"
                                        dot={(props) => {
                                            const { cx, cy, payload } = props;
                                            if (!payload || payload.tyLeMat === 0) return null;
                                            return (
                                                <g>
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={5}
                                                        fill="#ff4d4f"
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    />
                                                    <text
                                                        x={cx}
                                                        y={cy - 12}
                                                        textAnchor="middle"
                                                        fontSize="10"
                                                        fontWeight="bold"
                                                        fill="#ff4d4f"
                                                        style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.8)' }}
                                                    >
                                                        {payload.tyLeMat.toFixed(1)}%
                                                    </text>
                                                </g>
                                            );
                                        }}
                                        activeDot={false}
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
            {loading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div>Đang tải dữ liệu...</div>
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                    <div>{error}</div>
                </div>
            )}

            {!loading && !error && productionLines
                .filter(line => selectedLines.includes(line.id))
                .map(line => renderLineCard(line))}
        </div>
    );
};

export default DowntimeChartDashboard;