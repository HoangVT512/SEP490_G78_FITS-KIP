import React from "react";
import { Card, Empty } from "antd";

const TransactionHistory = () => {
  return (
    <Card title="Lịch sử giao dịch">
      <Empty
        description="Tính năng đang được phát triển"
        style={{ padding: "50px 0" }}
      />
    </Card>
  );
};

export default TransactionHistory;
