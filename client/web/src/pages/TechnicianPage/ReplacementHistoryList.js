import React, { useEffect, useState } from "react";
import { Card, Table, message, Empty, Tag, Grid } from "antd";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const { useBreakpoint } = Grid;

const ReplacementHistoryList = ({ equipmentId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (!equipmentId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await replacementHistoryService.getByEquipmentId(
          equipmentId
        );
        setData(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        console.error("Failed to load replacement history:", err);
        message.error(
          "Không thể tải lịch sử thay thế: " + (err?.message || String(err))
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [equipmentId]);

  // Base columns for all screen sizes
  const baseColumns = [
    {
      title: "Phụ tùng",
      key: "part",
      width: isMobile ? 150 : 220,
      render: (_, record) => (
        <div>
          <div
            style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 500 }}
          >
            {record.partName}
          </div>
          <div
            style={{ fontSize: isMobile ? "11px" : "12px", color: "#8c8c8c" }}
          >
            {record.partNumber}
          </div>
        </div>
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: isMobile ? 50 : 80,
      align: "center",
    },
    {
      title: "Ngày",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: isMobile ? 80 : 140,
      render: (d) =>
        d ? (
          <div>
            <div style={{ fontSize: isMobile ? "11px" : "13px" }}>
              {dayjs(d).format("DD/MM/YY")}
            </div>
            {!isMobile && (
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {dayjs(d).format("HH:mm")}
              </div>
            )}
          </div>
        ) : (
          ""
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: isMobile ? 90 : 120,
      render: (s) => {
        const color =
          s === "Completed" ? "green" : s === "Pending" ? "orange" : "default";
        const label = s === "Completed" ? "Xong" : s === "Pending" ? "Chờ" : s;
        return (
          <Tag color={color} style={{ fontSize: isMobile ? "10px" : "12px" }}>
            {isMobile ? label : s}
          </Tag>
        );
      },
    },
  ];

  // Additional columns for larger screens
  const desktopColumns = [
    {
      title: "ID",
      dataIndex: "replacementID",
      key: "replacementID",
      width: 80,
    },
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      width: 140,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      width: 220,
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 100 },
    {
      title: "Ngày thay thế",
      dataIndex: "replacedDate",
      key: "replacedDate",
      width: 180,
      render: (d) =>
        d ? (
          <div>
            <div style={{ fontSize: "13px" }}>
              {dayjs(d).format("DD/MM/YYYY")}
            </div>
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {dayjs(d).format("HH:mm")}
            </div>
          </div>
        ) : (
          ""
        ),
    },
    {
      title: "Người cấp phát",
      key: "replacedBy",
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {record.replacedByFullName ||
              record.replacedByUserName ||
              "Chưa xác định"}
          </div>
          {record.replacedByEmployeeCode && (
            <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
              {record.replacedByEmployeeCode}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => {
        const color =
          s === "Completed" ? "green" : s === "Pending" ? "orange" : "default";
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  const columns = isMobile ? baseColumns : desktopColumns;

  if (!equipmentId) return <Empty description="Không có thiết bị được chọn" />;

  return (
    <Card
      title={
        isMobile
          ? `Thiết bị ${equipmentId}`
          : `Lịch sử thay thế - Thiết bị ${equipmentId}`
      }
      bordered={false}
      size={isMobile ? "small" : "default"}
      styles={{
        header: {
          fontSize: isMobile ? "14px" : "16px",
          padding: isMobile ? "8px 12px" : "16px 24px",
        },
        body: { padding: isMobile ? "8px" : "24px" },
      }}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(r) => r.replacementID || r.replacementId}
        loading={loading}
        locale={{
          emptyText: <Empty description="Không có bản ghi thay thế" />,
        }}
        pagination={{
          pageSize: isMobile ? 5 : 8,
          size: isMobile ? "small" : "default",
          simple: isMobile,
        }}
        scroll={{ x: isMobile ? 400 : 1200, y: isMobile ? 300 : 480 }}
        size="small"
      />
    </Card>
  );
};

export default ReplacementHistoryList;
