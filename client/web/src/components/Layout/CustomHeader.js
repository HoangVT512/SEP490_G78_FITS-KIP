import React from "react";
import { Layout as AntLayout, Typography } from "antd";

const { Header } = AntLayout;
const { Text } = Typography;

const CustomHeader = () => {
  return (
    <Header className="layout-header">
      <div className="header-content">
        <Text className="company-name">🏭 FITS-KIP Factory Management</Text>
      </div>
    </Header>
  );
};

export default CustomHeader;
