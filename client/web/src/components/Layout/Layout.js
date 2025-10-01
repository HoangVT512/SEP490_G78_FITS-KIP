import React from "react";
import { Layout as AntLayout, Typography } from "antd";
import styles from "../../styles/components/Layout.module.css";
import CustomHeader from "./CustomHeader";

const { Footer, Content } = AntLayout;
const { Text } = Typography;

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <AntLayout className={styles.layoutContainer}>
      {showHeader && <CustomHeader />}

      <Content className={styles.layoutContent}>{children}</Content>

      {showFooter && (
        <Footer className={styles.layoutFooter}>
          <Text>
            © FITS-KIP Management System. Hệ thống quản lý bảo trì nhà máy.
          </Text>
        </Footer>
      )}
    </AntLayout>
  );
};

export default Layout;
