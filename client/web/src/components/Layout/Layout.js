import React from "react";
import { Layout as AntLayout, Typography } from "antd";
import { layoutContainer, footerStyle, contentStyle } from "./layout.style";
import CustomHeader from "./CustomHeader";

const { Footer, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <AntLayout css={layoutContainer}>
      {showHeader && <CustomHeader />}

      <Content css={contentStyle}>{children}</Content>

      {showFooter && (
        <Footer css={footerStyle}>
          <Text>
            © 2024 FITS-KIP Management System. Hệ thống quản lý bảo trì nhà máy.
          </Text>
        </Footer>
      )}
    </AntLayout>
  );
};

export default Layout;
