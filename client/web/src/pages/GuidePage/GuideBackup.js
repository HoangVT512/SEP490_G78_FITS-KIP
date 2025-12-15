import React, { useState } from 'react';
import { Button, Space, message, Modal, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

/**
 * Guide Backup & Restore Component
 * Allows admin to export/import all guide data
 */
const GuideBackup = () => {
  const [loading, setLoading] = useState(false);

  // Export all guide data to JSON file
  const handleExport = async () => {
    setLoading(true);
    try {
      const allData = await window.storage.getAll();
      
      if (allData.length === 0) {
        message.warning('Không có dữ liệu để export');
        setLoading(false);
        return;
      }

      // Create export object with metadata
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: allData
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `guide-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success('Export thành công!');
    } catch (error) {
      message.error('Lỗi khi export dữ liệu');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Import guide data from JSON file
  const handleImport = (file) => {
    Modal.confirm({
      title: 'Xác nhận import',
      icon: <QuestionCircleOutlined />,
      content: 'Import sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?',
      okText: 'Import',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        const hideLoading = message.loading('Đang import dữ liệu...', 0);

        try {
          const fileReader = new FileReader();

          fileReader.onload = async (e) => {
            try {
              const importData = JSON.parse(e.target.result);
              
              // Validate structure
              if (!importData.data || !Array.isArray(importData.data)) {
                throw new Error('Invalid backup file format');
              }

              // Import each item
              let successCount = 0;
              for (const item of importData.data) {
                if (item.key && item.value) {
                  await window.storage.set(item.key, item.value);
                  successCount++;
                }
              }

              hideLoading();
              message.success(`Import thành công ${successCount} mục dữ liệu!`);
              
              // Reload page to reflect changes
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } catch (error) {
              hideLoading();
              message.error('File backup không hợp lệ');
              console.error('Parse error:', error);
            } finally {
              setLoading(false);
            }
          };

          fileReader.onerror = () => {
            hideLoading();
            message.error('Lỗi khi đọc file');
            setLoading(false);
          };

          fileReader.readAsText(file);
        } catch (error) {
          hideLoading();
          message.error('Lỗi khi import dữ liệu');
          console.error('Import error:', error);
          setLoading(false);
        }
      }
    });

    return false; // Prevent default upload
  };

  // Clear all guide data
  const handleClearAll = () => {
    Modal.confirm({
      title: 'Xóa toàn bộ dữ liệu',
      icon: <QuestionCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu hướng dẫn? Hành động này không thể hoàn tác!',
      okText: 'Xóa tất cả',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          await window.storage.clear();
          message.success('Đã xóa toàn bộ dữ liệu');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          message.error('Lỗi khi xóa dữ liệu');
          console.error('Clear error:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExport}
        loading={loading}
      >
        Export Backup
      </Button>
      
      <Upload
        accept=".json"
        beforeUpload={handleImport}
        showUploadList={false}
      >
        <Button
          icon={<UploadOutlined />}
          loading={loading}
        >
          Import Backup
        </Button>
      </Upload>

      <Button
        danger
        onClick={handleClearAll}
        loading={loading}
      >
        Xóa Tất Cả
      </Button>
    </Space>
  );
};

export default GuideBackup;
