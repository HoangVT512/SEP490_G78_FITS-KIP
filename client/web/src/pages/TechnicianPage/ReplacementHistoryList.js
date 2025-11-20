import React, { useEffect, useState } from "react";
import { Card, Table, message, Empty, Tag } from "antd";
import dayjs from "dayjs";
import { replacementHistoryService } from "../../services/replacementHistoryService";

const ReplacementHistoryList = ({ equipmentId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

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

  const columns = [
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

  if (!equipmentId) return <Empty description="Không có thiết bị được chọn" />;

  return (
    <Card title={`Lịch sử thay thế - Thiết bị ${equipmentId}`} bordered={false}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(r) => r.replacementID || r.replacementId}
        loading={loading}
        locale={{
          emptyText: <Empty description="Không có bản ghi thay thế" />,
        }}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1200, y: 480 }}
        size="small"
      />
    </Card>
  );
};

export default ReplacementHistoryList;
