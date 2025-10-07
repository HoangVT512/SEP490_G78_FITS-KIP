import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Badge,
  Descriptions,
  Modal,
  Progress,
  Statistic,
  Row,
  Col,
  Select,
  Tabs,
} from "antd";
import {
  ToolOutlined,
  SearchOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  FilterOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import styles from "../../styles/pages/TeamLeaderEquipment.module.css";

const { Search } = Input;

const TeamLeaderEquipment = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingEquipment, setViewingEquipment] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  // Mock data
  const equipmentList = [
    {
      id: 1,
      code: "CNC-001",
      name: "Máy cắt CNC-001",
      lineName: "Dây chuyền 1",
      stageName: "Công đoạn cắt",
      origin: "Nhật Bản",
      yom: 2020,
      dateUse: "2020-05-15",
      status: "problem",
      issue: "Lỗi động cơ chính",
      uptime: 78.5,
      lastMaintenance: "2025-09-15",
      nextMaintenance: "2025-10-15",
    },
    {
      id: 2,
      code: "WLD-002",
      name: "Máy hàn WLD-002",
      lineName: "Dây chuyền 2",
      stageName: "Công đoạn hàn",
      origin: "Đức",
      yom: 2019,
      dateUse: "2019-08-20",
      status: "maintenance",
      issue: "Bảo trì định kỳ",
      uptime: 85.2,
      lastMaintenance: "2025-09-20",
      nextMaintenance: "2025-10-20",
    },
    {
      id: 3,
      code: "PRS-003",
      name: "Máy ép PRS-003",
      lineName: "Dây chuyền 1",
      stageName: "Công đoạn ép",
      origin: "Hàn Quốc",
      yom: 2021,
      dateUse: "2021-03-10",
      status: "active",
      issue: null,
      uptime: 95.8,
      lastMaintenance: "2025-09-10",
      nextMaintenance: "2025-11-10",
    },
    {
      id: 4,
      code: "QC-001",
      name: "Máy kiểm tra QC-001",
      lineName: "Dây chuyền 3",
      stageName: "Công đoạn kiểm tra",
      origin: "Mỹ",
      yom: 2022,
      dateUse: "2022-01-15",
      status: "active",
      issue: null,
      uptime: 92.3,
      lastMaintenance: "2025-09-05",
      nextMaintenance: "2025-11-05",
    },
    {
      id: 5,
      code: "ASM-001",
      name: "Máy lắp ráp ASM-001",
      lineName: "Dây chuyền 2",
      stageName: "Công đoạn lắp ráp",
      origin: "Đài Loan",
      yom: 2020,
      dateUse: "2020-11-20",
      status: "active",
      issue: null,
      uptime: 88.7,
      lastMaintenance: "2025-08-25",
      nextMaintenance: "2025-10-25",
    },
    {
      id: 6,
      code: "PKG-001",
      name: "Máy đóng gói PKG-001",
      lineName: "Dây chuyền 3",
      stageName: "Công đoạn đóng gói",
      origin: "Trung Quốc",
      yom: 2021,
      dateUse: "2021-07-01",
      status: "inactive",
      issue: "Ngừng hoạt động",
      uptime: 45.2,
      lastMaintenance: "2025-07-15",
      nextMaintenance: "2025-09-15",
    },
  ];

  const maintenanceHistory = [
    {
      id: 1,
      date: "2025-09-15",
      type: "Bảo trì định kỳ",
      description: "Thay dầu nhớt, kiểm tra động cơ",
      technician: "Nguyễn Văn A",
      status: "completed",
    },
    {
      id: 2,
      date: "2025-08-10",
      type: "Sửa chữa",
      description: "Thay thế bạc đạn",
      technician: "Trần Văn B",
      status: "completed",
    },
    {
      id: 3,
      date: "2025-07-05",
      type: "Kiểm tra",
      description: "Kiểm tra an toàn định kỳ",
      technician: "Lê Văn C",
      status: "completed",
    },
  ];

  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "code",
      key: "code",
      width: 120,
      fixed: "left",
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 140,
    },
    {
      title: "Công đoạn",
      dataIndex: "stageName",
      key: "stageName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const statusConfig = {
          active: {
            text: "Hoạt động",
            color: "green",
            icon: <CheckCircleOutlined />,
          },
          inactive: {
            text: "Không hoạt động",
            color: "red",
            icon: <CloseCircleOutlined />,
          },
          maintenance: {
            text: "Bảo trì",
            color: "orange",
            icon: <ToolOutlined />,
          },
          problem: {
            text: "Có vấn đề",
            color: "red",
            icon: <WarningOutlined />,
          },
        };
        const config = statusConfig[status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian hoạt động",
      dataIndex: "uptime",
      key: "uptime",
      width: 180,
      render: (uptime) => (
        <Progress
          percent={uptime}
          size="small"
          status={
            uptime > 90 ? "success" : uptime > 70 ? "normal" : "exception"
          }
        />
      ),
    },
    {
      title: "Bảo trì tiếp theo",
      dataIndex: "nextMaintenance",
      key: "nextMaintenance",
      width: 140,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (equipment) => {
    setViewingEquipment(equipment);
    setIsViewModalVisible(true);
  };

  const filteredEquipments = equipmentList.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchText.toLowerCase()) ||
      equipment.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || equipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const equipmentStats = {
    total: equipmentList.length,
    active: equipmentList.filter((e) => e.status === "active").length,
    inactive: equipmentList.filter((e) => e.status === "inactive").length,
    maintenance: equipmentList.filter((e) => e.status === "maintenance").length,
    problem: equipmentList.filter((e) => e.status === "problem").length,
  };

  return (
    <div className={styles.equipmentPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            <ToolOutlined /> Quản lý thiết bị
          </h1>
          <p className={styles.subtitle}>
            Theo dõi và quản lý tình trạng thiết bị sản xuất
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className={styles.statCard}>
            <Statistic
              title="Tổng thiết bị"
              value={equipmentStats.total}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card className={styles.statCard}>
            <Statistic
              title="Đang hoạt động"
              value={equipmentStats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card className={styles.statCard}>
            <Statistic
              title="Không hoạt động"
              value={equipmentStats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card className={styles.statCard}>
            <Statistic
              title="Đang bảo trì"
              value={equipmentStats.maintenance}
              valueStyle={{ color: "#faad14" }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5}>
          <Card className={styles.statCard}>
            <Statistic
              title="Có vấn đề"
              value={equipmentStats.problem}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm theo mã hoặc tên thiết bị..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ float: "right" }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
                size="large"
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Không hoạt động</Select.Option>
                <Select.Option value="maintenance">Bảo trì</Select.Option>
                <Select.Option value="problem">Có vấn đề</Select.Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={() => setLoading(true)}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredEquipments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thiết bị`,
          }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: "Không có dữ liệu thiết bị" }}
        />
      </Card>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <ToolOutlined />
            <span>Chi tiết thiết bị</span>
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingEquipment && (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: "info",
                label: "Thông tin chung",
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã thiết bị" span={1}>
                      <strong>{viewingEquipment.code}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên thiết bị" span={1}>
                      {viewingEquipment.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dây chuyền" span={1}>
                      {viewingEquipment.lineName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Công đoạn" span={1}>
                      {viewingEquipment.stageName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Xuất xứ" span={1}>
                      {viewingEquipment.origin}
                    </Descriptions.Item>
                    <Descriptions.Item label="Năm sản xuất" span={1}>
                      {viewingEquipment.yom}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đưa vào sử dụng" span={2}>
                      {viewingEquipment.dateUse}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={2}>
                      <Tag
                        color={
                          viewingEquipment.status === "active"
                            ? "green"
                            : viewingEquipment.status === "inactive"
                            ? "red"
                            : "orange"
                        }
                      >
                        {viewingEquipment.status === "active"
                          ? "Hoạt động"
                          : viewingEquipment.status === "inactive"
                          ? "Không hoạt động"
                          : viewingEquipment.status === "maintenance"
                          ? "Bảo trì"
                          : "Có vấn đề"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian hoạt động" span={2}>
                      <Progress percent={viewingEquipment.uptime} />
                    </Descriptions.Item>
                    {viewingEquipment.issue && (
                      <Descriptions.Item label="Vấn đề" span={2}>
                        <Tag color="red">{viewingEquipment.issue}</Tag>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Bảo trì lần cuối" span={1}>
                      {viewingEquipment.lastMaintenance}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bảo trì tiếp theo" span={1}>
                      {viewingEquipment.nextMaintenance}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "history",
                label: (
                  <span>
                    <HistoryOutlined /> Lịch sử bảo trì
                  </span>
                ),
                children: (
                  <Table
                    columns={[
                      {
                        title: "Ngày",
                        dataIndex: "date",
                        key: "date",
                      },
                      {
                        title: "Loại",
                        dataIndex: "type",
                        key: "type",
                        render: (type) => <Tag color="blue">{type}</Tag>,
                      },
                      {
                        title: "Mô tả",
                        dataIndex: "description",
                        key: "description",
                      },
                      {
                        title: "Kỹ thuật viên",
                        dataIndex: "technician",
                        key: "technician",
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        render: (status) => (
                          <Tag color="green">Đã hoàn thành</Tag>
                        ),
                      },
                    ]}
                    dataSource={maintenanceHistory}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default TeamLeaderEquipment;
