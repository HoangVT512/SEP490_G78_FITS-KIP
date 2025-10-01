import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message,
  Upload,
  InputNumber,
  TimePicker,
  ColorPicker,
  Alert,
  Badge,
  Tabs,
} from "antd";
import {
  SettingOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  BellOutlined,
  PictureOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  UploadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import Layout from "../../components/Layout/Layout";
import dayjs from "dayjs";
import styles from "../../styles/pages/SystemSettings.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SystemSettings = ({ showHeader = true }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock system configuration
  const [systemConfig, setSystemConfig] = useState({
    // General Settings
    systemName: "FITS-KIP Factory Management",
    systemDescription: "Hệ thống quản lý nhà máy thông minh",
    companyName: "FITS-KIP Corporation",
    timeZone: "Asia/Ho_Chi_Minh",
    language: "vi-VN",
    dateFormat: "DD/MM/YYYY",

    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordComplexity: true,
    twoFactorAuth: false,
    ipWhitelist: "",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    maintenanceNotifications: true,
    notificationRetentionDays: 30,

    // Database Settings
    backupEnabled: true,
    backupSchedule: "02:00",
    backupRetentionDays: 30,
    databaseOptimization: true,

    // Theme & UI
    primaryColor: "#334766",
    logo: null,
    favicon: null,
    darkMode: false,
    compactMode: false,

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "Hệ thống đang bảo trì, vui lòng quay lại sau.",
  });

  const handleSave = async (section) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success(`Đã lưu cài đặt ${section} thành công`);
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (section) => {
    message.info(`Đã reset cài đặt ${section} về mặc định`);
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(systemConfig, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `fitskip-config-${dayjs().format(
      "YYYY-MM-DD"
    )}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    message.success("Đã xuất cấu hình hệ thống");
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ được upload file hình ảnh!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Hình ảnh phải nhỏ hơn 2MB!");
      }
      return isImage && isLt2M;
    },
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
  };

  const contentStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "calc(100vh - 70px)",
  };

  const tabItems = [
    {
      key: "general",
      label: (
        <span>
          <SettingOutlined />
          Cài đặt chung
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Thông tin hệ thống" size="small">
              <Form layout="vertical">
                <Form.Item label="Tên hệ thống">
                  <Input
                    value={systemConfig.systemName}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        systemName: e.target.value,
                      })
                    }
                  />
                </Form.Item>
                <Form.Item label="Mô tả hệ thống">
                  <TextArea
                    rows={3}
                    value={systemConfig.systemDescription}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        systemDescription: e.target.value,
                      })
                    }
                  />
                </Form.Item>
                <Form.Item label="Tên công ty">
                  <Input
                    value={systemConfig.companyName}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        companyName: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Cài đặt khu vực" size="small">
              <Form layout="vertical">
                <Form.Item label="Múi giờ">
                  <Select value={systemConfig.timeZone}>
                    <Option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</Option>
                    <Option value="Asia/Tokyo">Nhật Bản (GMT+9)</Option>
                    <Option value="UTC">UTC (GMT+0)</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Ngôn ngữ">
                  <Select value={systemConfig.language}>
                    <Option value="vi-VN">Tiếng Việt</Option>
                    <Option value="en-US">English</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Định dạng ngày tháng">
                  <Select value={systemConfig.dateFormat}>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "security",
      label: (
        <span>
          <SecurityScanOutlined />
          Bảo mật
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Cài đặt phiên đăng nhập" size="small">
              <Form layout="vertical">
                <Form.Item label="Thời gian timeout (phút)">
                  <InputNumber
                    min={5}
                    max={480}
                    value={systemConfig.sessionTimeout}
                    onChange={(value) =>
                      setSystemConfig({
                        ...systemConfig,
                        sessionTimeout: value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Số lần đăng nhập sai tối đa">
                  <InputNumber
                    min={3}
                    max={10}
                    value={systemConfig.maxLoginAttempts}
                    onChange={(value) =>
                      setSystemConfig({
                        ...systemConfig,
                        maxLoginAttempts: value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Thời gian khóa tài khoản (phút)">
                  <InputNumber
                    min={5}
                    max={1440}
                    value={systemConfig.lockoutDuration}
                    onChange={(value) =>
                      setSystemConfig({
                        ...systemConfig,
                        lockoutDuration: value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Chính sách bảo mật" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Yêu cầu mật khẩu phức tạp</Text>
                  <Switch
                    checked={systemConfig.passwordComplexity}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        passwordComplexity: checked,
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Xác thực 2 bước</Text>
                  <Switch
                    checked={systemConfig.twoFactorAuth}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>
                <Form.Item label="Danh sách IP được phép (phân cách bằng dấu phẩy)">
                  <TextArea
                    rows={3}
                    placeholder="192.168.1.0/24, 10.0.0.0/8"
                    value={systemConfig.ipWhitelist}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        ipWhitelist: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined />
          Thông báo
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Kênh thông báo" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Thông báo qua Email</Text>
                  <Switch
                    checked={systemConfig.emailNotifications}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Thông báo qua SMS</Text>
                  <Switch
                    checked={systemConfig.smsNotifications}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Cảnh báo hệ thống</Text>
                  <Switch
                    checked={systemConfig.systemAlerts}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        systemAlerts: checked,
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Thông báo bảo trì</Text>
                  <Switch
                    checked={systemConfig.maintenanceNotifications}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        maintenanceNotifications: checked,
                      })
                    }
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Cài đặt lưu trữ" size="small">
              <Form layout="vertical">
                <Form.Item label="Thời gian lưu thông báo (ngày)">
                  <InputNumber
                    min={1}
                    max={365}
                    value={systemConfig.notificationRetentionDays}
                    onChange={(value) =>
                      setSystemConfig({
                        ...systemConfig,
                        notificationRetentionDays: value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "database",
      label: (
        <span>
          <DatabaseOutlined />
          Cơ sở dữ liệu
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Sao lưu tự động" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Bật sao lưu tự động</Text>
                  <Switch
                    checked={systemConfig.backupEnabled}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        backupEnabled: checked,
                      })
                    }
                  />
                </div>
                <Form.Item label="Thời gian sao lưu hàng ngày">
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(systemConfig.backupSchedule, "HH:mm")}
                    onChange={(time) =>
                      setSystemConfig({
                        ...systemConfig,
                        backupSchedule: time?.format("HH:mm"),
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Thời gian lưu trữ backup (ngày)">
                  <InputNumber
                    min={1}
                    max={365}
                    value={systemConfig.backupRetentionDays}
                    onChange={(value) =>
                      setSystemConfig({
                        ...systemConfig,
                        backupRetentionDays: value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Tối ưu hóa" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Tự động tối ưu hóa database</Text>
                  <Switch
                    checked={systemConfig.databaseOptimization}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        databaseOptimization: checked,
                      })
                    }
                  />
                </div>
                <Divider />
                <Space>
                  <Button icon={<DownloadOutlined />}>Sao lưu ngay</Button>
                  <Button icon={<UploadOutlined />}>Khôi phục</Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "appearance",
      label: (
        <span>
          <PictureOutlined />
          Giao diện
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Màu sắc & Theme" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item label="Màu chủ đạo">
                  <ColorPicker
                    value={systemConfig.primaryColor}
                    onChange={(color) =>
                      setSystemConfig({
                        ...systemConfig,
                        primaryColor: color.toHexString(),
                      })
                    }
                  />
                </Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Chế độ tối</Text>
                  <Switch
                    checked={systemConfig.darkMode}
                    onChange={(checked) =>
                      setSystemConfig({ ...systemConfig, darkMode: checked })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text>Giao diện compact</Text>
                  <Switch
                    checked={systemConfig.compactMode}
                    onChange={(checked) =>
                      setSystemConfig({ ...systemConfig, compactMode: checked })
                    }
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Logo & Favicon" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item label="Logo hệ thống">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Chọn logo</Button>
                  </Upload>
                </Form.Item>
                <Form.Item label="Favicon">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Chọn favicon</Button>
                  </Upload>
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "maintenance",
      label: (
        <span>
          <SafetyOutlined />
          Bảo trì
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Alert
              message="Chế độ bảo trì"
              description="Khi bật chế độ bảo trì, chỉ Admin mới có thể truy cập hệ thống. Tất cả người dùng khác sẽ thấy thông báo bảo trì."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="Cài đặt bảo trì" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>Chế độ bảo trì</Text>
                  <Badge
                    status={systemConfig.maintenanceMode ? "error" : "success"}
                    text={
                      systemConfig.maintenanceMode
                        ? "Đang bảo trì"
                        : "Hoạt động bình thường"
                    }
                  />
                  <Switch
                    checked={systemConfig.maintenanceMode}
                    onChange={(checked) =>
                      setSystemConfig({
                        ...systemConfig,
                        maintenanceMode: checked,
                      })
                    }
                  />
                </div>
                <Form.Item label="Thông báo bảo trì">
                  <TextArea
                    rows={4}
                    value={systemConfig.maintenanceMessage}
                    onChange={(e) =>
                      setSystemConfig({
                        ...systemConfig,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    placeholder="Thông báo sẽ hiển thị cho người dùng khi hệ thống bảo trì"
                  />
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  const content = (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          <SettingOutlined className={styles.titleIcon} />
          Cài đặt hệ thống
        </Title>
        <Text type="secondary">
          Quản lý các cài đặt và cấu hình hệ thống FITS-KIP
        </Text>
      </div>

      <Card className={styles.card}>
        <div style={{ marginBottom: "24px" }}>
          <Space>
            <Button
              style={{ backgroundColor: "#334766", borderColor: "#334766", color: "#fff" }}
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => handleSave("tất cả")}
            >
              Lưu tất cả
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => handleReset("tất cả")}
            >
              Reset về mặc định
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExportConfig}>
              Xuất cấu hình
            </Button>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const config = JSON.parse(e.target.result);
                    setSystemConfig(config);
                    message.success("Đã nhập cấu hình thành công");
                  } catch (error) {
                    message.error("File cấu hình không hợp lệ");
                  }
                };
                reader.readAsText(file);
                return false;
              }}
            >
              <Button icon={<ImportOutlined />}>Nhập cấu hình</Button>
            </Upload>
          </Space>
        </div>

        <Tabs
          type="card"
          items={tabItems}
          onChange={(key) => console.log("Active tab:", key)}
        />
      </Card>
    </div>
  );

  return showHeader ? <Layout>{content}</Layout> : content;
};

export default SystemSettings;
