import React, { useState } from "react";
import {
  Card,
  Table,
  DatePicker,
  Select,
  Space,
  Button,
  Input,
  Tag,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import styles from "../../styles/pages/ReplacementHistory.module.css";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const ReplacementHistory = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(90, "day"),
    dayjs(),
  ]);
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [searchText, setSearchText] = useState("");

  // Mock data
  const replacementHistory = [
    {
      id: 1,
      replacementDate: "2025-01-10",
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      componentName: "Motor điện 5HP",
      partNumber: "PT001",
      quantity: 1,
      cost: 5000000,
      technicianName: "Nguyễn Văn A",
      reason: "Motor hỏng, không hoạt động",
      downtime: 4,
      status: "Hoàn thành",
    },
    {
      id: 2,
      replacementDate: "2025-01-08",
      equipmentId: "EQ002",
      equipmentName: "Máy cắt CNC",
      componentName: "Ổ bi SKF 6205",
      partNumber: "PT003",
      quantity: 2,
      cost: 300000,
      technicianName: "Trần Thị B",
      reason: "Ổ bi mòn, tiếng kêu bất thường",
      downtime: 2,
      status: "Hoàn thành",
    },
    {
      id: 3,
      replacementDate: "2025-01-05",
      equipmentId: "EQ003",
      equipmentName: "Băng tải B",
      componentName: "Băng tải 10m",
      partNumber: "PT002",
      quantity: 1,
      cost: 8000000,
      technicianName: "Phạm Văn C",
      reason: "Băng tải rách, cần thay mới",
      downtime: 6,
      status: "Hoàn thành",
    },
    {
      id: 4,
      replacementDate: "2025-01-03",
      equipmentId: "EQ001",
      equipmentName: "Máy dập 01",
      componentName: "Van điện từ",
      partNumber: "PT004",
      quantity: 1,
      cost: 1200000,
      technicianName: "Nguyễn Văn A",
      reason: "Van bị rò rỉ dầu",
      downtime: 3,
      status: "Hoàn thành",
    },
  ];

  const columns = [
    {
      title: "Ngày thay",
      dataIndex: "replacementDate",
      key: "replacementDate",
      width: 110,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        dayjs(a.replacementDate).unix() - dayjs(b.replacementDate).unix(),
    },
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentId",
      key: "equipmentId",
      width: 120,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 150,
    },
    {
      title: "Linh kiện thay",
      dataIndex: "componentName",
      key: "componentName",
      width: 180,
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 120,
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: 60,
      align: "center",
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      width: 130,
      render: (cost) => `${cost.toLocaleString()} đ`,
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technicianName",
      key: "technicianName",
      width: 150,
    },
    {
      title: "Lý do thay",
      dataIndex: "reason",
      key: "reason",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Thời gian chết (h)",
      dataIndex: "downtime",
      key: "downtime",
      width: 150,
      align: "center",
      render: (hours) => <span>{hours}h</span>,
      sorter: (a, b) => a.downtime - b.downtime,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Hoàn thành" ? "success" : "warning"}>
          {status}
        </Tag>
      ),
    },
  ];

  const filteredData = replacementHistory.filter((item) => {
    const matchSearch =
      item.equipmentId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.equipmentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.componentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchText.toLowerCase());

    const matchEquipment =
      selectedEquipment === "all" || item.equipmentId === selectedEquipment;

    const matchDate = dayjs(item.replacementDate).isBetween(
      dateRange[0],
      dateRange[1],
      "day",
      "[]"
    );

    return matchSearch && matchEquipment && matchDate;
  });

  const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
  const totalDowntime = filteredData.reduce(
    (sum, item) => sum + item.downtime,
    0
  );

  const handleExport = () => {
    console.log("Exporting replacement history...");
  };

  return (
    <div className={styles.container}>
      <Card
        title="Lịch sử thay thế linh kiện"
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất Excel
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
              placeholder="Chọn thiết bị"
              value={selectedEquipment}
              onChange={setSelectedEquipment}
            >
              <Option value="all">Tất cả thiết bị</Option>
              <Option value="EQ001">EQ001 - Máy dập 01</Option>
              <Option value="EQ002">EQ002 - Máy cắt CNC</Option>
              <Option value="EQ003">EQ003 - Băng tải B</Option>
            </Select>
            <Search
              placeholder="Tìm theo thiết bị, linh kiện, mã phụ tùng"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 320 }}
            />
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
                Tổng số lần thay
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {filteredData.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                Tổng chi phí
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {totalCost.toLocaleString()} đ
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
                Tổng thời gian chết
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                }}
              >
                {totalDowntime}h
              </div>
            </div>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} lần thay thế`,
          }}
        />
      </Card>
    </div>
  );
};

export default ReplacementHistory;
