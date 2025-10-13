import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Progress,
  Tag,
  DatePicker,
  Select,
  Modal,
  Descriptions,
} from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "../../styles/pages/ProductionManagement.module.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

const ProductionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(7, "day")]);
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock production data
  const [productionData, setProductionData] = useState([
    {
      id: 1,
      planDate: "2025-01-10",
      lineId: "LINE-A",
      lineName: "Dây chuyền A",
      productName: "Sản phẩm X",
      targetQuantity: 1000,
      actualQuantity: 850,
      defectQuantity: 15,
      efficiency: 85,
      status: "In Progress",
      startTime: "07:00",
      endTime: "19:00",
      shift: "Ca 1",
    },
    {
      id: 2,
      planDate: "2025-01-10",
      lineId: "LINE-B",
      lineName: "Dây chuyền B",
      productName: "Sản phẩm Y",
      targetQuantity: 800,
      actualQuantity: 800,
      defectQuantity: 8,
      efficiency: 100,
      status: "Completed",
      startTime: "07:00",
      endTime: "15:30",
      shift: "Ca 1",
    },
    {
      id: 3,
      planDate: "2025-01-11",
      lineId: "LINE-A",
      lineName: "Dây chuyền A",
      productName: "Sản phẩm Z",
      targetQuantity: 1200,
      actualQuantity: 0,
      defectQuantity: 0,
      efficiency: 0,
      status: "Planned",
      startTime: "07:00",
      endTime: "19:00",
      shift: "Ca 1",
    },
  ]);

  const columns = [
    {
      title: "Ngày SX",
      dataIndex: "planDate",
      key: "planDate",
      width: 110,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Dây chuyền",
      dataIndex: "lineId",
      key: "lineId",
      width: 120,
    },
    {
      title: "Tên dây chuyền",
      dataIndex: "lineName",
      key: "lineName",
      width: 150,
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 150,
    },
    {
      title: "Ca",
      dataIndex: "shift",
      key: "shift",
      width: 80,
    },
    {
      title: "Mục tiêu",
      dataIndex: "targetQuantity",
      key: "targetQuantity",
      width: 100,
      align: "center",
    },
    {
      title: "Thực tế",
      dataIndex: "actualQuantity",
      key: "actualQuantity",
      width: 100,
      align: "center",
      render: (actual, record) => (
        <span
          style={{
            color:
              actual >= record.targetQuantity
                ? "#52c41a"
                : actual > 0
                ? "#faad14"
                : "#8c8c8c",
            fontWeight: "bold",
          }}
        >
          {actual}
        </span>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "defectQuantity",
      key: "defectQuantity",
      width: 80,
      align: "center",
      render: (defects) => (
        <span style={{ color: defects > 0 ? "#ff4d4f" : "#52c41a" }}>
          {defects}
        </span>
      ),
    },
    {
      title: "Hiệu suất",
      dataIndex: "efficiency",
      key: "efficiency",
      width: 150,
      render: (efficiency) => (
        <Progress
          percent={efficiency}
          size="small"
          status={
            efficiency >= 90
              ? "success"
              : efficiency >= 70
              ? "normal"
              : efficiency === 0
              ? "normal"
              : "exception"
          }
          strokeColor={efficiency === 0 ? "#d9d9d9" : undefined}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;
        if (status === "Completed") {
          color = "success";
          text = "Hoàn thành";
        } else if (status === "In Progress") {
          color = "processing";
          text = "Đang SX";
        } else if (status === "Planned") {
          color = "default";
          text = "Kế hoạch";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedProduction(record);
    setDetailModalVisible(true);
  };

  const filteredData = productionData.filter((item) => {
    const matchDate = dayjs(item.planDate).isBetween(
      dateRange[0],
      dateRange[1],
      "day",
      "[]"
    );
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    return matchDate && matchStatus;
  });

  // Calculate summary statistics
  const totalTarget = filteredData.reduce(
    (sum, item) => sum + item.targetQuantity,
    0
  );
  const totalActual = filteredData.reduce(
    (sum, item) => sum + item.actualQuantity,
    0
  );
  const totalDefects = filteredData.reduce(
    (sum, item) => sum + item.defectQuantity,
    0
  );
  const avgEfficiency =
    filteredData.length > 0
      ? filteredData.reduce((sum, item) => sum + item.efficiency, 0) /
        filteredData.length
      : 0;

  return (
    <div className={styles.container}>
      <Card
        title="Quản lý sản xuất"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm kế hoạch
          </Button>
        }
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: 280 }}
            />
            <Select
              style={{ width: 200 }}
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Planned">Kế hoạch</Option>
              <Option value="In Progress">Đang sản xuất</Option>
              <Option value="Completed">Hoàn thành</Option>
            </Select>
          </Space>

          <div
            style={{
              display: "flex",
              gap: "32px",
              padding: "16px",
              background: "#fafafa",
              borderRadius: "8px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                Mục tiêu tổng
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {totalTarget.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                Sản lượng thực tế
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {totalActual.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>Lỗi</div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                }}
              >
                {totalDefects}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                Hiệu suất TB
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: avgEfficiency >= 85 ? "#52c41a" : "#faad14",
                }}
              >
                {avgEfficiency.toFixed(1)}%
              </div>
            </div>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kế hoạch`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết sản xuất - ${selectedProduction?.lineId}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedProduction && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Ngày sản xuất" span={2}>
              {dayjs(selectedProduction.planDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Dây chuyền" span={1}>
              {selectedProduction.lineId}
            </Descriptions.Item>
            <Descriptions.Item label="Tên dây chuyền" span={1}>
              {selectedProduction.lineName}
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm" span={2}>
              {selectedProduction.productName}
            </Descriptions.Item>
            <Descriptions.Item label="Ca làm việc" span={1}>
              {selectedProduction.shift}
            </Descriptions.Item>
            <Descriptions.Item label="Giờ làm việc" span={1}>
              {selectedProduction.startTime} - {selectedProduction.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="Mục tiêu" span={1}>
              {selectedProduction.targetQuantity.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Thực tế" span={1}>
              <span
                style={{
                  color:
                    selectedProduction.actualQuantity >=
                    selectedProduction.targetQuantity
                      ? "#52c41a"
                      : "#faad14",
                  fontWeight: "bold",
                }}
              >
                {selectedProduction.actualQuantity.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm lỗi" span={1}>
              <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                {selectedProduction.defectQuantity}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Hiệu suất" span={1}>
              <Progress
                percent={selectedProduction.efficiency}
                status={
                  selectedProduction.efficiency >= 90
                    ? "success"
                    : selectedProduction.efficiency >= 70
                    ? "normal"
                    : "exception"
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag
                color={
                  selectedProduction.status === "Completed"
                    ? "success"
                    : selectedProduction.status === "In Progress"
                    ? "processing"
                    : "default"
                }
              >
                {selectedProduction.status === "Completed"
                  ? "Hoàn thành"
                  : selectedProduction.status === "In Progress"
                  ? "Đang sản xuất"
                  : "Kế hoạch"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProductionManagement;
