import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Button, 
  Input, 
  Card, 
  Upload, 
  message, 
  Modal, 
  Tooltip, 
  Space, 
  Typography,
  Spin,
  Progress
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  CloseOutlined,
  UserOutlined,
  BarChartOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  ShopOutlined,
  SettingOutlined,
  SafetyOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { compressImage, validateImage, formatBytes } from '../../utils/imageUtils';
import GuideBackup from './GuideBackup';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

const AdminGuidePanel = () => {
  const [activeTab, setActiveTab] = useState('team-leader');
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roles = [
    {
      id: 'team-leader',
      name: 'Tổ Trưởng',
      subtitle: 'Tổ trưởng',
      icon: UserOutlined,
      color: '#1890ff',
      storageKey: 'team_leader_guide'
    },
    {
      id: 'technical-manager',
      name: 'Quản Lý Kỹ Thuật',
      subtitle: 'Quản lý kỹ thuật',
      icon: ToolOutlined,
      color: '#52c41a',
      storageKey: 'technical_manager_guide'
    },
    {
      id: 'warehouse-manager',
      name: 'Quản Lý Kho',
      subtitle: 'Quản lý kho',
      icon: ShopOutlined,
      color: '#faad14',
      storageKey: 'warehouse_manager_guide'
    },
    {
      id: 'manager',
      name: 'Quản Lý',
      subtitle: 'Quản lý',
      icon: BarChartOutlined,
      color: '#722ed1',
      storageKey: 'manager_guide'
    },
    {
      id: 'technician',
      name: 'Kỹ Thuật Viên',
      subtitle: 'Kỹ thuật viên',
      icon: SettingOutlined,
      color: '#eb2f96',
      storageKey: 'technician_guide'
    }
  ];

  useEffect(() => {
    loadAllGuides();
  }, []);

  const loadAllGuides = async () => {
    setLoading(true);
    const allSections = {};
    
    for (const role of roles) {
      try {
        const result = await window.storage.get(role.storageKey);
        if (result && result.value) {
          allSections[role.id] = JSON.parse(result.value);
        } else {
          allSections[role.id] = getDefaultSections(role.id);
        }
      } catch (error) {
        console.log(`No existing data for ${role.id}, using defaults`);
        allSections[role.id] = getDefaultSections(role.id);
      }
    }
    
    setSections(allSections);
    setLoading(false);
  };

  const getDefaultSections = (roleId) => {
    const defaults = {
      'team-leader': [
        {
          id: '1',
          title: 'Đăng nhập và Dashboard',
          description: 'Hướng dẫn đăng nhập vào hệ thống và sử dụng Dashboard',
          steps: [
            {
              id: '1-1',
              title: 'Bước 1: Truy cập hệ thống',
              content: 'Mở trình duyệt và truy cập URL hệ thống FITS-KIP. Nhập tên đăng nhập và mật khẩu của bạn.',
              image: null,
              notes: 'Liên hệ IT nếu quên mật khẩu'
            }
          ],
          icon: '🏠',
          visible: true
        },
        {
          id: '2',
          title: 'Báo cáo sự cố',
          description: 'Cách báo cáo sự cố khi phát hiện vấn đề trên dây chuyền',
          steps: [
            {
              id: '2-1',
              title: 'Bước 1: Mở form báo cáo',
              content: 'Nhấp vào menu "Sự cố" > "Báo cáo sự cố mới"',
              image: null,
              notes: 'Có thể sử dụng shortcut Ctrl+N'
            }
          ],
          icon: '⚠️',
          visible: true
        }
      ],
      'technical-manager': [
        {
          id: '1',
          title: 'Quản lý kế hoạch bảo trì',
          description: 'Hướng dẫn tạo và quản lý kế hoạch bảo trì định kỳ',
          steps: [
            {
              id: '1-1',
              title: 'Bước 1: Tạo kế hoạch bảo trì',
              content: 'Vào menu "Bảo trì" > "Kế hoạch bảo trì" > "Tạo mới"',
              image: null,
              notes: 'Lên kế hoạch trước 1 tuần'
            }
          ],
          icon: '🔧',
          visible: true
        }
      ],
      'warehouse-manager': [
        {
          id: '1',
          title: 'Quản lý tồn kho',
          description: 'Hướng dẫn theo dõi và quản lý tồn kho linh kiện',
          steps: [
            {
              id: '1-1',
              title: 'Bước 1: Xem tồn kho',
              content: 'Vào menu "Kho" > "Tồn kho" để xem danh sách linh kiện',
              image: null,
              notes: 'Kiểm tra cảnh báo tồn kho thấp'
            }
          ],
          icon: '📦',
          visible: true
        }
      ],
      'manager': [
        {
          id: '1',
          title: 'Dashboard tổng quan',
          description: 'Hướng dẫn xem và phân tích báo cáo tổng quan',
          steps: [
            {
              id: '1-1',
              title: 'Bước 1: Xem Dashboard',
              content: 'Dashboard hiển thị các chỉ số OEE, dừng máy, sự cố',
              image: null,
              notes: 'Cập nhật real-time'
            }
          ],
          icon: '📊',
          visible: true
        }
      ],
      'technician': [
        {
          id: '1',
          title: 'Xử lý sự cố',
          description: 'Hướng dẫn nhận và xử lý sự cố được giao',
          steps: [
            {
              id: '1-1',
              title: 'Bước 1: Nhận sự cố',
              content: 'Vào menu "Sự cố" > "Danh sách sự cố được giao"',
              image: null,
              notes: 'Ưu tiên sự cố Critical'
            }
          ],
          icon: '🔨',
          visible: true
        }
      ]
    };

    return defaults[roleId] || [];
  };

  const saveGuideData = async () => {
    setSaving(true);
    try {
      const currentRole = roles.find(r => r.id === activeTab);
      await window.storage.set(currentRole.storageKey, JSON.stringify(sections[activeTab]));
      message.success('Lưu thành công!');
    } catch (error) {
      message.error('Lỗi khi lưu dữ liệu');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (stepId, file) => {
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }

    // Show loading message
    const hideLoading = message.loading('Đang nén và upload hình ảnh...', 0);

    try {
      // Compress image before storing
      const compressedBase64 = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85
      });

      // Update state with compressed image
      updateSectionsForActiveTab(prevSections =>
        prevSections.map(section => ({
          ...section,
          steps: section.steps.map(step =>
            step.id === stepId ? { ...step, image: compressedBase64 } : step
          )
        }))
      );

      hideLoading();
      message.success('Upload hình ảnh thành công');
    } catch (error) {
      hideLoading();
      message.error('Lỗi khi xử lý hình ảnh');
      console.error('Image upload error:', error);
    }

    return false; // Prevent default upload behavior
  };

  const removeImage = (stepId) => {
    updateSectionsForActiveTab(prevSections =>
      prevSections.map(section => ({
        ...section,
        steps: section.steps.map(step =>
          step.id === stepId ? { ...step, image: null } : step
        )
      }))
    );
    message.success('Đã xóa hình ảnh');
  };

  const updateStepContent = (stepId, field, value) => {
    updateSectionsForActiveTab(prevSections =>
      prevSections.map(section => ({
        ...section,
        steps: section.steps.map(step =>
          step.id === stepId ? { ...step, [field]: value } : step
        )
      }))
    );
  };

  const addNewStep = (sectionId) => {
    updateSectionsForActiveTab(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              steps: [
                ...section.steps,
                {
                  id: `${sectionId}-${Date.now()}`,
                  title: 'Bước mới',
                  content: 'Nội dung hướng dẫn...',
                  image: null,
                  notes: ''
                }
              ]
            }
          : section
      )
    );
  };

  const deleteStep = (sectionId, stepId) => {
    confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bước này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk() {
        updateSectionsForActiveTab(prevSections =>
          prevSections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  steps: section.steps.filter(step => step.id !== stepId)
                }
              : section
          )
        );
        message.success('Đã xóa bước');
      }
    });
  };

  const addNewSection = () => {
    updateSectionsForActiveTab(prevSections => [
      ...prevSections,
      {
        id: Date.now().toString(),
        title: 'Phần mới',
        description: 'Mô tả phần hướng dẫn...',
        steps: [],
        icon: '📝',
        visible: true
      }
    ]);
    showAddSectionSuccessMessage();
  };

  const deleteSection = (sectionId) => {
    confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phần này và tất cả các bước bên trong?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk() {
        updateSectionsForActiveTab(prevSections =>
          prevSections.filter(section => section.id !== sectionId)
        );
        message.success('Đã xóa phần');
      }
    });
  };

  // ham hien thi mesage da tehm phan moi thanh cong
  const showAddSectionSuccessMessage = () => {
    message.success('Đã thêm phần mới thành công');
  };

  const toggleSectionVisibility = (sectionId) => {
    updateSectionsForActiveTab(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      )
    );
  };

  const updateSection = (sectionId, field, value) => {
    updateSectionsForActiveTab(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
  };

  const updateSectionsForActiveTab = (updateFn) => {
    setSections(prev => ({
      ...prev,
      [activeTab]: updateFn(prev[activeTab] || [])
    }));
  };

  const getStats = (roleId) => {
    const roleSections = sections[roleId] || [];
    return {
      sections: roleSections.length,
      steps: roleSections.reduce((acc, s) => acc + s.steps.length, 0),
      images: roleSections.reduce((acc, s) => acc + s.steps.filter(st => st.image).length, 0)
    };
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
          <p style={{ marginTop: 16, color: '#666' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const currentSections = sections[activeTab] || [];
  const currentRole = roles.find(r => r.id === activeTab);

  const tabItems = roles.map((role) => {
    const IconComponent = role.icon;
    const stats = getStats(role.id);
    
    return {
      key: role.id,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: `${role.color}20`
          }}>
            <IconComponent style={{ fontSize: 18, color: role.color }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{role.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {stats.sections} phần • {stats.steps} bước • {stats.images} ảnh
            </div>
          </div>
        </div>
      )
    };
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8', 
        position: 'sticky', 
        top: 0, 
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* <Button type="text" icon={<ArrowLeftOutlined />}> */}
                {/* Quay lại */}
              {/* </Button> */}
              <div style={{ width: 1, height: 24, background: '#d9d9d9' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', 
                  borderRadius: 8, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <SafetyOutlined style={{ fontSize: 24, color: '#fff' }} />
                </div>
                <div>
                  {/* <Title level={4} style={{ margin: 0 }}>Admin Guide Management</Title> */}
                  <Text type="secondary" style={{ fontSize: 14 }}>Quản lý hướng dẫn cho tất cả vai trò</Text>
                </div>
              </div>
            </div>
            
            <Space>
              <GuideBackup />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addNewSection}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Thêm Phần
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={saveGuideData}
                loading={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8', 
        position: 'sticky', 
        top: 73, 
        zIndex: 30 
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{margin: '0 auto', padding: '32px 24px' }}>
        {/* Current Role Info */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderLeft: `4px solid ${currentRole.color}` 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: `${currentRole.color}20`
              }}>
                {React.createElement(currentRole.icon, { 
                  style: { fontSize: 28, color: currentRole.color }
                })}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>{currentRole.name}</Title>
                <Text type="secondary">{currentRole.subtitle}</Text>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: currentRole.color }}>
                {getStats(activeTab).sections}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Phần hướng dẫn</Text>
            </div>
          </div>
        </Card>

        {/* Sections */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {currentSections.map((section) => (
            <Card key={section.id} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {/* Section Header */}
              <div style={{ 
                padding: 24,
                margin: -24,
                marginBottom: 24,
                background: `linear-gradient(135deg, ${currentRole.color} 0%, ${currentRole.color}dd 100%)`
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Tiêu đề phần..."
                      style={{ 
                        fontSize: 24, 
                        fontWeight: 'bold',
                        color: '#fff',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.4)',
                        marginBottom: 8,
                        borderRadius: 0
                      }}
                    />
                    <TextArea
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Mô tả ngắn gọn..."
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: 0
                      }}
                    />
                  </div>
                  <Space style={{ marginLeft: 16 }}>
                    <Tooltip title={section.visible ? "Ẩn phần" : "Hiện phần"}>
                      <Button
                        type="primary"
                        ghost
                        icon={section.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={() => toggleSectionVisibility(section.id)}
                        style={{ color: '#fff', borderColor: '#fff' }}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa phần">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteSection(section.id)}
                      />
                    </Tooltip>
                  </Space>
                </div>
              </div>

              {/* Steps */}
              {section.visible && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {section.steps.map((step) => (
                    <Card 
                      key={step.id} 
                      size="small" 
                      style={{ 
                        border: '1px solid #e8e8e8',
                        transition: 'border-color 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1890ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Input
                          value={step.title}
                          onChange={(e) => updateStepContent(step.id, 'title', e.target.value)}
                          placeholder="Tiêu đề bước..."
                          style={{ fontSize: 18, fontWeight: 'bold', flex: 1 }}
                          bordered={false}
                        />
                        <Tooltip title="Xóa bước">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteStep(section.id, step.id)}
                          />
                        </Tooltip>
                      </div>

                      <TextArea
                        value={step.content}
                        onChange={(e) => updateStepContent(step.id, 'content', e.target.value)}
                        rows={3}
                        placeholder="Nội dung hướng dẫn chi tiết..."
                        style={{ marginBottom: 16 }}
                      />

                      {/* Image Section */}
                      <div style={{ marginBottom: 16 }}>
                        {step.image ? (
                          <div style={{ position: 'relative' }} className="image-container">
                            <img
                              src={step.image}
                              alt={step.title}
                              style={{ width: '100%', borderRadius: 8, border: '2px solid #e8e8e8' }}
                            />
                            <Button
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => removeImage(step.id)}
                              style={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8,
                                opacity: 0,
                                transition: 'opacity 0.3s'
                              }}
                              className="delete-image-btn"
                            />
                            <style>{`
                              .image-container:hover .delete-image-btn {
                                opacity: 1;
                              }
                            `}</style>
                          </div>
                        ) : (
                          <Upload
                            beforeUpload={(file) => handleImageUpload(step.id, file)}
                            showUploadList={false}
                            accept="image/*"
                            style={{ width: '100%' }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '100%',
                              height: 192,
                              border: '2px dashed #d9d9d9',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#1890ff';
                              e.currentTarget.style.background = '#e6f7ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#d9d9d9';
                              e.currentTarget.style.background = 'transparent';
                            }}
                            >
                              <PictureOutlined style={{ fontSize: 48, color: '#bfbfbf', marginBottom: 8 }} />
                              <Text style={{ fontSize: 14, color: '#666' }}>Click để upload hình ảnh</Text>
                              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG (tối đa 5MB)</Text>
                            </div>
                          </Upload>
                        )}
                      </div>

                      {/* Notes */}
                      <div style={{ 
                        background: '#fffbe6', 
                        borderLeft: '4px solid #faad14', 
                        padding: 16, 
                        borderRadius: '0 8px 8px 0' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <WarningOutlined style={{ fontSize: 20, color: '#d48806', marginTop: 2 }} />
                          <Input
                            value={step.notes}
                            onChange={(e) => updateStepContent(step.id, 'notes', e.target.value)}
                            placeholder="Ghi chú quan trọng..."
                            bordered={false}
                            style={{ background: 'transparent', color: '#ad6800', flex: 1 }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Add Step Button */}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => addNewStep(section.id)}
                    style={{ height: 48 }}
                  >
                    Thêm bước mới
                  </Button>
                </Space>
              )}
            </Card>
          ))}

          {currentSections.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ color: '#bfbfbf' }}>
                <UnorderedListOutlined style={{ fontSize: 64, marginBottom: 8 }} />
                <Title level={4} type="secondary">Chưa có phần hướng dẫn nào</Title>
                <Text type="secondary">Nhấn "Thêm phần" để bắt đầu</Text>
              </div>
            </Card>
          )}
        </Space>
      </div>
    </div>
  );
};

export default AdminGuidePanel;