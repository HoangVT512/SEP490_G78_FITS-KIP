import React, { useState } from "react";
import { Card, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReplacementReturnModal from "./ReplacementReturnModal";

const ReplacementReturnPage = () => {
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Card
      title="Quản lý trả lại linh kiện thừa"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => setReturnModalVisible(true)}
          >
            Xem danh sách
          </Button>
        </Space>
      }
    >
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>
          Nhấn "Xem danh sách" để xác nhận trả lại linh kiện thừa từ kỹ thuật
          viên.
        </p>
      </div>

      <ReplacementReturnModal
        key={refreshKey}
        visible={returnModalVisible}
        onClose={() => setReturnModalVisible(false)}
        onSuccess={handleRefresh}
      />
    </Card>
  );
};

export default ReplacementReturnPage;
