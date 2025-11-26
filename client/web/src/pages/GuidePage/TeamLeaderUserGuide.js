import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Space,
    Spin,
    Empty,
    Button,
    Input,
    Collapse,
    Tag,
    Breadcrumb,
    Affix,
    BackTop,
    Divider
} from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    SearchOutlined,
    RightOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const TeamLeaderUserGuide = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredSections, setFilteredSections] = useState([]);

    useEffect(() => {
        loadGuideData();
    }, []);

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredSections(sections);
        } else {
            const filtered = sections.map(section => {
                const matchingSteps = section.steps.filter(step =>
                    step.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    step.content.toLowerCase().includes(searchText.toLowerCase())
                );

                if (matchingSteps.length > 0 ||
                    section.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    section.description.toLowerCase().includes(searchText.toLowerCase())) {
                    return {
                        ...section,
                        steps: matchingSteps.length > 0 ? matchingSteps : section.steps
                    };
                }
                return null;
            }).filter(Boolean);

            setFilteredSections(filtered);
        }
    }, [searchText, sections]);

    const loadGuideData = async () => {
        setLoading(true);
        try {
            const result = await window.storage.get('team_leader_guide');
            if (result && result.value) {
                const data = JSON.parse(result.value);
                setSections(data.filter(section => section.visible));
                setFilteredSections(data.filter(section => section.visible));
            } else {
                setSections([]);
                setFilteredSections([]);
            }
        } catch (error) {
            console.log('No guide data found');
            setSections([]);
            setFilteredSections([]);
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16, color: '#666' }}>Đang tải hướng dẫn...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Header */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{margin: '0 auto', padding: '16px 24px' }}>
                    {/* <Breadcrumb>
                        <Breadcrumb.Item>
                            <HomeOutlined />
                            <span style={{ marginLeft: 8 }}>Trang chủ</span>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Hướng dẫn sử dụng</Breadcrumb.Item>
                        <Breadcrumb.Item>Team Leader</Breadcrumb.Item>
                    </Breadcrumb> */}

                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0 }}>Hướng dẫn sử dụng</Title>
                                <Text type="secondary">Tổ trưởng - Quản lý dây chuyền sản xuất</Text>
                            </div>
                        </div>

                        {/* <Search
                            placeholder="Tìm kiếm hướng dẫn..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ maxWidth: 600 }}
                        /> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
                    {/* Sidebar Navigation */}
                    <Affix offsetTop={100}>
                        <Card
                            title="Mục lục"
                            size="small"
                            style={{ maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {filteredSections.map((section, index) => (
                                    <Button
                                        key={section.id}
                                        type="text"
                                        block
                                        onClick={() => scrollToSection(section.id)}
                                        style={{
                                            textAlign: 'left',
                                            height: 'auto',
                                            padding: '8px 12px',
                                            whiteSpace: 'normal'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <span style={{ fontSize: 20 }}>{section.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: 14 }}>
                                                    {index + 1}. {section.title}
                                                </div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {section.steps.length} bước
                                                </Text>
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </Space>
                        </Card>
                    </Affix>

                    {/* Main Guide Content */}
                    <div>
                        {filteredSections.length === 0 ? (
                            <Card>
                                <Empty
                                    description={
                                        searchText
                                            ? "Không tìm thấy kết quả phù hợp"
                                            : "Chưa có hướng dẫn nào"
                                    }
                                />
                            </Card>
                        ) : (
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                {filteredSections.map((section, sectionIndex) => (
                                    <Card
                                        key={section.id}
                                        id={`section-${section.id}`}
                                        style={{
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            scrollMarginTop: 100
                                        }}
                                    >
                                        {/* Section Header */}
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                <div style={{
                                                    fontSize: 32,
                                                    width: 48,
                                                    height: 48,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#e6f7ff',
                                                    borderRadius: 8
                                                }}>
                                                    {section.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <Title level={3} style={{ margin: 0 }}>
                                                        {sectionIndex + 1}. {section.title}
                                                    </Title>
                                                    <Text type="secondary" style={{ fontSize: 16 }}>
                                                        {section.description}
                                                    </Text>
                                                </div>
                                                <Tag color="blue">{section.steps.length} bước</Tag>
                                            </div>
                                            <Divider style={{ margin: '16px 0' }} />
                                        </div>

                                        {/* Steps */}
                                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            {section.steps.map((step, stepIndex) => (
                                                <div key={step.id}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 16,
                                                        marginBottom: 16
                                                    }}>
                                                        <div style={{
                                                            minWidth: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            background: '#1890ff',
                                                            color: '#fff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: 14
                                                        }}>
                                                            {stepIndex + 1}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                                                                {step.title}
                                                            </Title>
                                                            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                                                                {step.content}
                                                            </Paragraph>

                                                            {/* Image */}
                                                            {step.image && (
                                                                <div style={{ marginBottom: 16 }}>
                                                                    <img
                                                                        src={step.image}
                                                                        alt={step.title}
                                                                        style={{
                                                                            width: '100%',
                                                                            maxWidth: 800,
                                                                            borderRadius: 8,
                                                                            border: '1px solid #e8e8e8',
                                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Notes */}
                                                            {step.notes && (
                                                                <div style={{
                                                                    background: '#fffbe6',
                                                                    border: '1px solid #ffe58f',
                                                                    borderLeft: '4px solid #faad14',
                                                                    padding: '12px 16px',
                                                                    borderRadius: 4
                                                                }}>
                                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                                        <WarningOutlined style={{ color: '#faad14', fontSize: 16, marginTop: 2 }} />
                                                                        <div style={{ flex: 1 }}>
                                                                            <Text strong style={{ color: '#ad6800', display: 'block', marginBottom: 4 }}>
                                                                                Lưu ý:
                                                                            </Text>
                                                                            <Text style={{ color: '#ad6800' }}>
                                                                                {step.notes}
                                                                            </Text>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {stepIndex < section.steps.length - 1 && (
                                                        <Divider dashed style={{ margin: '24px 0' }} />
                                                    )}
                                                </div>
                                            ))}
                                        </Space>

                                        {/* Section Footer */}
                                        <div style={{
                                            marginTop: 24,
                                            padding: '16px 0',
                                            borderTop: '1px solid #f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                                <Text type="secondary">
                                                    Hoàn thành {section.steps.length} bước hướng dẫn
                                                </Text>
                                            </div>
                                            {sectionIndex < filteredSections.length - 1 && (
                                                <Button
                                                    type="primary"
                                                    icon={<RightOutlined />}
                                                    iconPosition="end"
                                                    onClick={() => scrollToSection(filteredSections[sectionIndex + 1].id)}
                                                >
                                                    Phần tiếp theo
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}

                                {/* Completion Card */}
                                <Card style={{
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                                    border: '2px solid #91d5ff',
                                    textAlign: 'center'
                                }}>
                                    <CheckCircleOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                                    <Title level={3} style={{ color: '#0050b3', margin: 0, marginBottom: 8 }}>
                                        Bạn đã hoàn thành hướng dẫn!
                                    </Title>
                                    <Paragraph style={{ fontSize: 16, color: '#096dd9', marginBottom: 24 }}>
                                        Bạn có thể bắt đầu sử dụng hệ thống FITS-KIP với vai trò Team Leader.
                                    </Paragraph>
                                    <Space>
                                        <Button type="primary" size="large" icon={<HomeOutlined />}>
                                            Về trang chủ
                                        </Button>
                                        <Button size="large" icon={<FileTextOutlined />}>
                                            In hướng dẫn
                                        </Button>
                                    </Space>
                                </Card>
                            </Space>
                        )}
                    </div>
                </div>
            </div>

            {/* Back to Top */}
            <BackTop>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    cursor: 'pointer'
                }}>
                    <ArrowUpOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
            </BackTop>

            {/* Footer */}
            {/* <div style={{
                background: '#001529',
                color: '#fff',
                padding: '24px 0',
                marginTop: 48
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                        © 2024 FITS-KIP. Hệ thống quản lý bảo trì và sản xuất.
                    </Text>
                    <div style={{ marginTop: 8 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                            Nếu cần hỗ trợ, vui lòng liên hệ IT Department
                        </Text>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default TeamLeaderUserGuide;