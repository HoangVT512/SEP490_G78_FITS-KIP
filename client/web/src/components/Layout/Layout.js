import React from "react";
import { Layout as AntLayout, Typography } from "antd";
import "../../styles/components/Layout.css";
import CustomHeader from "./CustomHeader";

const { Footer, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <AntLayout className="layout-container">
      {showHeader && <CustomHeader />}

      <Content className="layout-content">{children}</Content>

      {showFooter && (
        <Footer className="layout-footer">
          <Text>
            © FITS-KIP Management System. Hệ thống quản lý bảo trì nhà máy.
          </Text>
        </Footer>
      )}
    </AntLayout>
  );
};

export default Layout;
