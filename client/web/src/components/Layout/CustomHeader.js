import React from "react";
import { Layout as AntLayout, Typography } from "antd";
import styles from "../../styles/components/Layout.module.css";

const { Header } = AntLayout;
const { Text } = Typography;

const CustomHeader = () => {
  return (
    <Header className={styles.layoutHeader}>
      <div className={styles.headerContent}>
        <Text className={styles.companyName}>🏭 FITS-KIP Factory Management</Text>
      </div>
    </Header>
  );
};

export default CustomHeader;
