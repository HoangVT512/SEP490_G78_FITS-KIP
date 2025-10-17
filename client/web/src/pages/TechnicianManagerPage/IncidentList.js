import React from "react";
import { Empty, Card } from "antd";

const IncidentList = () => {
  return (
    <Card title="Quản lý sự cố" bordered={false} style={{ minHeight: 200 }}>
      <Empty description="Chưa có dữ liệu sự cố (placeholder)" />
    </Card>
  );
};

export default IncidentList;
