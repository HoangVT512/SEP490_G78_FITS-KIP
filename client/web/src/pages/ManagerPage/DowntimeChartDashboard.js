import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Tabs, Statistic, Progress, Space, Tag, Alert } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area, AreaChart, Scatter, ScatterChart } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, ClockCircleOutlined, DashboardOutlined, LoadingOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { name } from 'dayjs/locale/vi';
import { authService } from '../../services/authService';
import { lineService } from '../../services/lineService';
import { departmentService } from '../../services/departmentService';
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
    const [dataLoaded, setDataLoaded] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('MM/YYYY'));
    const [selectedLines, setSelectedLines] = useState([]);

    // State cho downtime data từ API
    const [downtimeData, setDowntimeData] = useState({});

    // State cho daily downtime data từ API
    const [dailyDowntimeData, setDailyDowntimeData] = useState([]);

    // State cho thông báo khi không có quyền truy cập
    const [notificationMessage, setNotificationMessage] = useState(null);

    // State cho loading khi thay đổi tháng
    const [monthLoading, setMonthLoading] = useState(false);

    // Fetch user và lines data khi component mount
    useEffect(() => {
        const fetchUserAndLines = async () => {
            try {
                setLoading(true);
                setError(null);
                setDataLoaded(false);

                // Lấy thông tin user hiện tại
                let user = authService.getStoredUser();
                if (!user) {
                    setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
                    return;
                }

                // Nếu user không có departmentId, thử lấy từ API
                if (!user.departmentId && user.id) {
                    try {
                        console.log('Người dùng thiếu mã phòng ban, đang lấy thông tin người dùng hiện tại...');
                        const currentUserInfo = await authService.getCurrentUser();
                        if (currentUserInfo && currentUserInfo.departmentId) {
                            user.departmentId = currentUserInfo.departmentId;
                            console.log('Đã lấy mã phòng ban từ API người dùng hiện tại:', user.departmentId);
                        }
                    } catch (deptError) {
                        console.error('Lỗi lấy thông tin người dùng hiện tại:', deptError);
                    }
                }

                setCurrentUser(user);

                // Lấy danh sách lines được phép xem dựa trên quyền
                let allowedLines = [];

                // Debug: log thông tin user
                console.log('Người dùng hiện tại:', user);
                console.log('ID người dùng:', user.id);
                console.log('Vai trò người dùng:', user.roles);
                console.log('Mã phòng ban người dùng:', user.departmentId);

                // Kiểm tra vai trò của user
                console.log('Đang kiểm tra vai trò của user cho quản lý...');
                console.log('user.roles:', user.roles);
                console.log('user.roles loại:', typeof user.roles);
                console.log('user.roles là mảng:', Array.isArray(user.roles));

                const isManager = user.roles && Array.isArray(user.roles) && user.roles.some(role =>
                    role && typeof role === 'string' && role.includes('Quản lý')
                );

                console.log('Là quản lý:', isManager);

                // Luôn lấy lines mà user được assign trước
                let userAssignedLines = [];
                try {
                    console.log('Đang lấy dây chuyền được phân công cho người dùng...');
                    const userLinesResponse = await lineService.getLinesByUser(user.id);
                    // Handle both wrapped and direct responses
                    userAssignedLines = userLinesResponse.success ? userLinesResponse.data : (Array.isArray(userLinesResponse) ? userLinesResponse : []);
                    console.log('Dây chuyền được phân công cho người dùng:', userAssignedLines);
                } catch (lineError) {
                    console.error('Lỗi lấy danh sách dây chuyền của người dùng:', lineError);
                    userAssignedLines = [];
                }

                // Nếu là quản lý, lấy thêm tất cả lines trong phòng ban của họ
                let departmentLines = [];
                if (isManager) {
                    try {
                        console.log('Đang kiểm tra quyền quản lý phòng ban...');
                        // Lấy danh sách tất cả departments để kiểm tra managerId
                        const departments = await departmentService.getActiveDepartments();
                        console.log('Phòng ban:', departments);

                        // Tìm department mà user là manager
                        const managedDepartment = departments.find(dept => dept.managerId === user.id);
                        console.log('Phòng ban quản lý:', managedDepartment);

                        if (managedDepartment) {
                            console.log('Đang lấy danh sách dây chuyền theo phòng ban quản lý...');
                            // Sử dụng API endpoint để lấy lines theo department
                            const departmentLinesResponse = await lineService.getLinesByDepartment(managedDepartment.departmentId);
                            console.log('Dây chuyền theo phòng ban quản lý:', departmentLinesResponse);
                            // Handle both wrapped and direct responses
                            departmentLines = departmentLinesResponse.success ? departmentLinesResponse.data : (Array.isArray(departmentLinesResponse) ? departmentLinesResponse : []);
                        } else {
                            console.log('Quản lý không được phân công quản lý phòng ban nào.');
                        }
                    } catch (lineError) {
                        console.error('Lỗi lấy danh sách dây chuyền theo phòng ban:', lineError);
                        departmentLines = [];
                    }
                }

                // Merge user assigned lines và department lines, loại bỏ duplicate
                const allLineIds = new Set();
                const mergedLines = [];

                // Thêm user assigned lines trước
                userAssignedLines.forEach(line => {
                    if (!allLineIds.has(line.lineId)) {
                        allLineIds.add(line.lineId);
                        mergedLines.push(line);
                    }
                });

                // Thêm department lines
                departmentLines.forEach(line => {
                    if (!allLineIds.has(line.lineId)) {
                        allLineIds.add(line.lineId);
                        mergedLines.push(line);
                    }
                });

                allowedLines = mergedLines;

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

                // Set thông báo dựa trên quyền truy cập
                if (transformedLines.length === 0) {
                    if (userAssignedLines.length === 0) {
                        setNotificationMessage({
                            type: 'user-no-lines',
                            title: 'Chưa được phân công dây chuyền',
                            message: 'Bạn chưa được phân công giám sát dây chuyền sản xuất nào. Vui lòng liên hệ quản lý phòng ban để được phân công.',
                            icon: 'SettingOutlined'
                        });
                    } else if (isManager && departmentLines.length === 0) {
                        setNotificationMessage({
                            type: 'manager-no-department',
                            title: 'Chưa được phân công quản lý phòng ban',
                            message: 'Bạn có vai trò quản lý nhưng chưa được phân công quản lý phòng ban nào. Vui lòng liên hệ quản trị viên hệ thống để được phân công phòng ban.',
                            icon: 'UserOutlined'
                        });
                    } else {
                        setNotificationMessage({
                            type: 'no-lines',
                            title: 'Không có dây chuyền nào',
                            message: 'Không tìm thấy dây chuyền nào để hiển thị.',
                            icon: 'ExclamationCircleOutlined'
                        });
                    }
                } else {
                    setNotificationMessage(null);
                }

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

                // Check if we have actual data to display
                if (transformedLines.length > 0) {
                    setDataLoaded(true);
                }

            } catch (error) {
                console.error('Lỗi lấy dữ liệu:', error);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndLines();
    }, []);

    // Set loading khi thay đổi tháng
    useEffect(() => {
        if (dataLoaded) {
            setMonthLoading(true);
        }
    }, [selectedMonth]);

    // Fetch downtime data khi selectedMonth hoặc selectedLines thay đổi
    useEffect(() => {
        const fetchDowntimeData = async () => {
            if (!selectedLines.length || !dataLoaded) return;

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
                console.error('Lỗi lấy dữ liệu dừng máy:', error);
            } finally {
                setMonthLoading(false);
            }
        };

        fetchDowntimeData();
    }, [selectedMonth, selectedLines, dataLoaded]);

    // Fetch daily downtime data khi selectedMonth hoặc selectedLines thay đổi
    useEffect(() => {
        const fetchDailyDowntimeData = async () => {
            if (!selectedLines.length || !dataLoaded) return;

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
            } finally {
                setMonthLoading(false);
            }
        };

        fetchDailyDowntimeData();
    }, [selectedMonth, selectedLines, dataLoaded]);

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
                            tyLeMat: stat.totalLoss,
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

            // Tính tổng % của các stop types (theo đúng thứ tự legend)
            const stopTypes = ['dungNgan', 'dungDai', 'phaPham', 'dauCuoiCa', 'doiMa'];
            let totalStopPercentage = 0;
            if (dailyStat) {
                const detailKeyMap = {
                    'dungNgan': 'dungNgan',
                    'dungDai': 'dungDai',
                    'phaPham': 'phePham',
                    'dauCuoiCa': 'veSinhDauCuoiCa',
                    'doiMa': 'doiMa'
                };
                stopTypes.forEach(key => {
                    const detailKey = detailKeyMap[key];
                    if (dailyStat.downDetails[detailKey]) {
                        totalStopPercentage += dailyStat.downDetails[detailKey].percentage || 0;
                    }
                });
            }

            return (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.97)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    minWidth: '320px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Tiêu đề ngày */}
                    <div style={{
                        marginBottom: '16px',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        borderBottom: '2px solid rgba(59, 130, 246, 0.5)',
                        paddingBottom: '10px',
                        color: '#60a5fa',
                        letterSpacing: '0.5px'
                    }}>
                        📅 {currentDate}
                    </div>

                    {payload
                        .slice()
                        .sort((a, b) => {
                            const order = [
                                'dungNgan',
                                'dungDai',
                                'phaPham',
                                'dauCuoiCa',
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
                                    'dauCuoiCa': 'veSinhDauCuoiCa',
                                    'doiMa': 'doiMa'
                                };
                                const detailKey = detailKeyMap[item.dataKey];
                                if (detailKey && dailyStat.downDetails[detailKey]) {
                                    details = dailyStat.downDetails[detailKey];
                                }
                            }

                            return (
                                <div key={index} style={{ marginBottom: '10px' }}>
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
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: item.color,
                                                    marginRight: '12px',
                                                    borderRadius: item.dataKey === 'tyLeMat' ? '50%' : '3px',
                                                    border:
                                                        item.dataKey === 'oee'
                                                            ? '2px solid white'
                                                            : item.dataKey === 'mucTieu'
                                                                ? '2px dashed #aaa'
                                                                : 'none',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            ></div>
                                            <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</span>
                                        </div>

                                        {isMainMetric && (
                                            <span
                                                style={{
                                                    fontWeight: 'bold',
                                                    marginLeft: '12px',
                                                    minWidth: '70px',
                                                    textAlign: 'right',
                                                    fontSize: '13px',
                                                    color: item.dataKey === 'oee' ? '#4ade80' : (item.dataKey === 'tyLeMat' ? '#f87171' : '#fbbf24')
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
                                                marginLeft: '28px',
                                                fontSize: '11px',
                                                lineHeight: '1.5',
                                                marginTop: '6px',
                                                padding: '6px 10px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '6px',
                                                borderLeft: '3px solid ' + item.color
                                            }}
                                        >
                                            {details.percentage > 0
                                                ? ` ${details.percentage.toFixed(2)}% | ${(details.totalDuration || details.duration).toFixed(2)} phút |  ${details.occurrences} lần`
                                                : ' 0% | 0 phút |  0 lần'}
                                        </div>
                                    )}

                                    {/* Fallback cho dữ liệu cũ nếu không có dailyStat */}
                                    {!details && !isMainMetric && (
                                        <div
                                            style={{
                                                marginLeft: '28px',
                                                fontSize: '11px',
                                                lineHeight: '1.4',
                                                marginTop: '4px',
                                                color: 'rgba(255, 255, 255, 0.7)'
                                            }}
                                        >
                                            {isNaN(item.value)
                                                ? '—'
                                                : `${item.value.toFixed(2)}%`}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    {/* Dòng tổng stop types */}
                    {dailyStat && (
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '12px',
                            borderTop: '2px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <span style={{
                                fontWeight: 'bold',
                                fontSize: '13px',
                                color: '#fca5a5'
                            }}>
                                Tổng tỷ lệ dừng
                            </span>
                            <span style={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                color: '#f87171'
                            }}>
                                {totalStopPercentage.toFixed(2)}%
                            </span>
                        </div>
                    )}

                    {/* So sánh với tỷ lệ mất mát */}
                    {dailyStat && dailyStat.totalLoss > 0 && (
                        <div style={{
                            marginTop: '8px',
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontStyle: 'italic',
                            textAlign: 'center'
                        }}>
                            {Math.abs(totalStopPercentage - dailyStat.totalLoss) < 0.01
                                ? '✓ Tổng dừng khớp với tỷ lệ mất mát'
                                : `Chênh lệch: ${Math.abs(totalStopPercentage - dailyStat.totalLoss).toFixed(2)}%`
                            }
                        </div>
                    )}
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
            const totalLoss = lineDailyData.dailyStats.reduce((sum, stat) => sum + stat.totalLoss, 0);
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
                {/* Header Cards cho từng dây chuyền - Enhanced Industrial Design */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    {/* Card OEE - Premium Design */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '160px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{
                                padding: '24px',
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%'
                            }}></div>
                            <div style={{ color: '#000000ff' }}>
                                <div style={{
                                    fontSize: '14px',
                                    marginBottom: '8px',
                                    opacity: 0.9,
                                    fontWeight: '500',
                                    letterSpacing: '0.5px'
                                }}>
                                    OEE
                                </div>
                                <div style={{
                                    fontSize: '42px',
                                    fontWeight: '800',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    marginBottom: '4px'
                                }}>
                                    {avgOEE}%
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Card Thời gian hoạt động - Green Theme */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '160px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{
                                padding: '24px',
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-20px',
                                left: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%'
                            }}></div>
                            <div style={{ color: '#000000ff' }}>
                                <div style={{
                                    fontSize: '14px',
                                    marginBottom: '8px',
                                    opacity: 0.9,
                                    fontWeight: '500',
                                    letterSpacing: '0.5px'
                                }}>
                                    Hiệu suất hoạt động
                                </div>
                                <div style={{
                                    fontSize: '42px',
                                    fontWeight: '800',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    marginBottom: '4px'
                                }}>
                                    {productivity}%
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Card Tỷ lệ mất mát - Red Theme */}
                    <Col xs={24} sm={8} md={8}>
                        <Card
                            style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                height: '160px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{
                                padding: '24px',
                                textAlign: 'center',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                right: '-30px',
                                width: '120px',
                                height: '120px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                transform: 'translateY(-50%)'
                            }}></div>
                            <div style={{ color: '#000000ff' }}>
                                <div style={{
                                    fontSize: '14px',
                                    marginBottom: '8px',
                                    opacity: 0.9,
                                    fontWeight: '500',
                                    letterSpacing: '0.5px'
                                }}>
                                    Tỷ lệ mất mát
                                </div>
                                <div style={{
                                    fontSize: '42px',
                                    fontWeight: '800',
                                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    marginBottom: '4px'
                                }}>
                                    {avgLoss}%
                                </div>
                            </div>
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
                                        yAxisId="left"
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
                                                        {payload.oee.toFixed(2)}%
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
                                                        {payload.tyLeMat.toFixed(2)}%
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
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 50%, #fff3e0 100%)',
            minHeight: '100vh',
            position: 'relative'
        }}>
            {/* Background pattern for factory theme */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, #000 35px, #000 36px)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header Dashboard - Enhanced Industrial Design */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #1a365d 100%)',
                    padding: '40px 32px',
                    borderRadius: '20px',
                    marginBottom: '32px',
                    boxShadow: '0 12px 40px rgba(30, 58, 95, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '-30px',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}></div>

                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} lg={12}>
                            <div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    marginBottom: '16px',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <SettingOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>Hệ thống giám sát sản xuất</span>
                                </div>
                                <h1 style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    margin: '0 0 12px 0',
                                    color: 'white',
                                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                                    letterSpacing: '-0.5px'
                                }}>
                                    Biểu Đồ Thời Gian Dừng Máy
                                </h1>
                                <p style={{
                                    fontSize: '16px',
                                    margin: '0',
                                    opacity: 0.95,
                                    fontWeight: '400',
                                    lineHeight: '1.5'
                                }}>
                                    Theo dõi hiệu suất và phân tích chi tiết các dây chuyền sản xuất<br />
                                    <span style={{ fontSize: '14px', opacity: 0.8 }}>
                                        Cập nhật theo thời gian thực • Dữ liệu chính xác • Phân tích toàn diện
                                    </span>
                                </p>
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Row gutter={16} justify="end">
                                <Col xs={24} sm={12} md={11}>
                                    <div style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }}>
                                        <div style={{
                                            marginBottom: '10px',
                                            fontSize: '13px',
                                            opacity: 0.9,
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            � Chọn tháng
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
                                    </div>
                                </Col>
                                <Col xs={24} sm={12} md={11}>
                                    <div style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }}>
                                        <div style={{
                                            marginBottom: '10px',
                                            fontSize: '13px',
                                            opacity: 0.9,
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            Chọn dây chuyền
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
                                    </div>
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
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minHeight: '400px'
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            {/* Bánh răng lớn */}
                            <SettingOutlined
                                style={{
                                    fontSize: '80px',
                                    color: '#1890ff',
                                    animation: 'spin-clockwise 2s linear infinite'
                                }}
                            />
                            {/* Bánh răng nhỏ */}
                            <SettingOutlined
                                style={{
                                    fontSize: '40px',
                                    color: '#52c41a',
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    animation: 'spin-counterclockwise 1.5s linear infinite'
                                }}
                            />
                            {/* Icon loading ở giữa */}
                            <LoadingOutlined
                                style={{
                                    fontSize: '24px',
                                    color: '#fff',
                                    position: 'absolute',
                                    animation: 'pulse 1s ease-in-out infinite'
                                }}
                            />
                        </div>

                        <div style={{
                            textAlign: 'center',
                            color: '#334766',
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '12px'
                        }}>
                            🏭 Đang tải dữ liệu sản xuất...
                        </div>

                        <div style={{
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            maxWidth: '400px'
                        }}>
                            Hệ thống đang thu thập và phân tích dữ liệu hiệu suất từ các dây chuyền sản xuất.
                            Vui lòng đợi trong giây lát...
                        </div>
                    </div>
                )}

                {monthLoading && !loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minHeight: '400px'
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            {/* Bánh răng lớn */}
                            <SettingOutlined
                                style={{
                                    fontSize: '80px',
                                    color: '#1890ff',
                                    animation: 'spin-clockwise 2s linear infinite'
                                }}
                            />
                            {/* Bánh răng nhỏ */}
                            <SettingOutlined
                                style={{
                                    fontSize: '40px',
                                    color: '#52c41a',
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    animation: 'spin-counterclockwise 1.5s linear infinite'
                                }}
                            />
                            {/* Icon loading ở giữa */}
                            <LoadingOutlined
                                style={{
                                    fontSize: '24px',
                                    color: '#fff',
                                    position: 'absolute',
                                    animation: 'pulse 1s ease-in-out infinite'
                                }}
                            />
                        </div>

                        <div style={{
                            textAlign: 'center',
                            color: '#334766',
                            fontSize: '18px',
                            fontWeight: '600',
                            marginBottom: '12px'
                        }}>
                            📊 Đang tải dữ liệu tháng {selectedMonth}...
                        </div>

                        <div style={{
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            maxWidth: '400px'
                        }}>
                            Hệ thống đang tải dữ liệu hiệu suất sản xuất cho tháng đã chọn.
                            Vui lòng đợi trong giây lát...
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                        <div>{error}</div>
                    </div>
                )}

                {/* Thông báo khi không có quyền truy cập */}
                {!loading && !monthLoading && !error && notificationMessage && (
                    <div style={{ marginBottom: '24px' }}>
                        <Alert
                            message={notificationMessage.title}
                            description={notificationMessage.message}
                            type={notificationMessage.type === 'manager-no-department' ? 'warning' : 'info'}
                            showIcon
                            style={{
                                borderRadius: '12px',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                )}

                {!loading && !monthLoading && !error && productionLines
                    .filter(line => selectedLines.includes(line.id))
                    .map(line => renderLineCard(line))}

                {/* Global CSS for animations */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin-clockwise {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes spin-counterclockwise {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(1.1); }
                    }
                `
                }} />
            </div>
        </div>
    );
};

export default DowntimeChartDashboard;