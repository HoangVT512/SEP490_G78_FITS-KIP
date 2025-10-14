import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Badge,
  Dropdown,
  message,
  Tooltip,
  Descriptions,
  Select,
  DatePicker,
  Tag,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ToolOutlined,
  DownOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ArchiveIcon } from "../../assets/icons";
import Layout from "../../components/Layout/Layout";
import { equipmentService } from "../../services/equipmentService";
import { stageService } from "../../services/stageService";
import dayjs from "dayjs";
import QRCode from "qrcode";

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const EquipmentManagement = ({ showHeader = true }) => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [viewingEquipment, setViewingEquipment] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageActive, setStageActive] = useState([]);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [form] = Form.useForm();

  const [showArchive, setShowArchive] = useState(() => {
    const saved = localStorage.getItem("equipmentArchiveView");
    return saved === "true";
  });

  useEffect(() => {
    loadEquipments();
    loadStages();
    loadActiveStages();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "equipmentArchiveView",
      showArchive ? "true" : "false"
    );
  }, [showArchive]);

  useEffect(() => {
    if (viewingEquipment?.qrcode) {
      QRCode.toDataURL(viewingEquipment.qrcode)
        .then((url) => setQrImageUrl(url))
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setQrImageUrl(null);
        });
    } else {
      setQrImageUrl(null);
    }
  }, [viewingEquipment]);

  const handleAction = async (action, equipment) => {
    switch (action) {
      case "view":
        try {
          setLoading(true);
          const equipmentDetail = await equipmentService.getEquipment(
            equipment.equipmentId
          );
          setViewingEquipment(equipmentDetail);
          setIsViewModalVisible(true);
        } catch (error) {
          console.error("Error loading equipment detail:", error);
          message.error("Không thể tải thông tin chi tiết thiết bị");
        } finally {
          setLoading(false);
        }
        break;
      case "edit":
        setEditingEquipment(equipment);
        form.setFieldsValue({
          equipmentCode: equipment.equipmentCode,
          equipmentName: equipment.equipmentName,
          origin: equipment.origin,
          yom: equipment.yom,
          dateUse: equipment.dateUse ? dayjs(equipment.dateUse) : null,
          stageId: equipment.stageId,
          issue: equipment.issue,
        });
        setIsModalVisible(true);
        break;
      case "activate":
        try {
          setLoading(true);
          await equipmentService.toggleEquipmentStatus(equipment.equipmentId);
          message.success("Đã kích hoạt thiết bị thành công");
          loadEquipments();
        } catch (error) {
          console.error("Error activating equipment:", error);
          message.error("Không thể kích hoạt thiết bị");
        } finally {
          setLoading(false);
        }
        break;
      case "deactivate":
        Modal.confirm({
          title: "Xác nhận vô hiệu hóa thiết bị",
          content: `Bạn có chắc chắn muốn vô hiệu hóa thiết bị "${equipment.equipmentName}"?`,
          okText: "Vô hiệu hóa",
          cancelText: "Hủy",
          okType: "danger",
          okButtonProps: {
            style: {
              backgroundColor: "#334766",
              borderColor: "#334766",
              color: "#fff",
            },
          },
          onOk: async () => {
            try {
              setLoading(true);
              await equipmentService.toggleEquipmentStatus(
                equipment.equipmentId
              );
              message.success("Đã vô hiệu hóa thiết bị thành công");
              loadEquipments();
            } catch (error) {
              console.error("Error deactivating equipment:", error);
              message.error("Không thể vô hiệu hóa thiết bị");
            } finally {
              setLoading(false);
            }
          },
        });
        break;
      default:
        break;
    }
  };

  // const handlePrintEquipmentCard = (equipment) => {
  //   // Create a new window for printing
  //   const printWindow = window.open('', '_blank');

  //   // Generate QR code data URL
  //   QRCode.toDataURL(equipment.qrcode || equipment.equipmentCode)
  //     .then((qrCodeUrl) => {
  //       const printContent = `
  //         <!DOCTYPE html>
  //         <html>
  //         <head>
  //           <title>Thẻ thiết bị - ${equipment.equipmentName}</title>
  //           <style>
  //             body {
  //               font-family: Arial, sans-serif;
  //               margin: 0;
  //               padding: 20px;
  //               display: flex;
  //               justify-content: center;
  //               align-items: center;
  //               min-height: 100vh;
  //               background-color: #f5f5f5;
  //             }
  //             .card {
  //               width: 400px;
  //               background: white;
  //               border-radius: 10px;
  //               box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  //               padding: 30px;
  //               text-align: center;
  //               border: 2px solid #334766;
  //             }
  //             .header {
  //               border-bottom: 2px solid #334766;
  //               padding-bottom: 15px;
  //               margin-bottom: 20px;
  //             }
  //             .title {
  //               font-size: 24px;
  //               font-weight: bold;
  //               color: #334766;
  //               margin: 0;
  //             }
  //             .code {
  //               font-size: 18px;
  //               color: #666;
  //               margin: 5px 0;
  //             }
  //             .qr-code {
  //               margin: 20px 0;
  //             }
  //             .qr-code img {
  //               width: 150px;
  //               height: 150px;
  //             }
  //             .info {
  //               text-align: left;
  //               margin-top: 20px;
  //             }
  //             .info-row {
  //               display: flex;
  //               justify-content: space-between;
  //               margin-bottom: 8px;
  //               padding: 5px 0;
  //               border-bottom: 1px solid #eee;
  //             }
  //             .label {
  //               font-weight: bold;
  //               color: #334766;
  //             }
  //             .value {
  //               color: #333;
  //             }
  //             .status {
  //               margin-top: 15px;
  //               padding: 8px;
  //               border-radius: 5px;
  //               font-weight: bold;
  //             }
  //             .status.active {
  //               background-color: #f6ffed;
  //               border: 1px solid #b7eb8f;
  //               color: #52c41a;
  //             }
  //             .status.inactive {
  //               background-color: #fff2f0;
  //               border: 1px solid #ffccc7;
  //               color: #ff4d4f;
  //             }
  //             @media print {
  //               body {
  //                 background: white;
  //               }
  //               .card {
  //                 box-shadow: none;
  //                 border: 1px solid #ddd;
  //               }
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="card">
  //             <div class="header">
  //               <h1 class="title">THẺ THIẾT BỊ</h1>
  //               <div class="code">Mã: ${equipment.equipmentCode}</div>
  //             </div>

  //             <div class="qr-code">
  //               <img src="${qrCodeUrl}" alt="QR Code" />
  //             </div>

  //             <div class="info">
  //               <div class="info-row">
  //                 <span class="label">Tên thiết bị:</span>
  //                 <span class="value">${equipment.equipmentName}</span>
  //               </div>
  //               <div class="info-row">
  //                 <span class="label">Xuất xứ:</span>
  //                 <span class="value">${equipment.origin || 'N/A'}</span>
  //               </div>
  //               <div class="info-row">
  //                 <span class="label">Năm sản xuất:</span>
  //                 <span class="value">${equipment.yom || 'N/A'}</span>
  //               </div>
  //               <div class="info-row">
  //                 <span class="label">Ngày sử dụng:</span>
  //                 <span class="value">${equipment.dateUse ? dayjs(equipment.dateUse).format('DD/MM/YYYY') : 'N/A'}</span>
  //               </div>
  //             </div>
  //           </div>

  //           <script>
  //             window.onload = function() {
  //               window.print();
  //               setTimeout(function() {
  //                 window.close();
  //               }, 1000);
  //             };
  //           </script>
  //         </body>
  //         </html>
  //       `;

  //       printWindow.document.write(printContent);
  //       printWindow.document.close();
  //     })
  //     .catch((error) => {
  //       console.error('Error generating QR code for print:', error);
  //       message.error('Không thể tạo mã QR cho in ấn');
  //     });
  // };

  const handlePrintEquipmentCard = (equipment) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Calculate minimum width based on equipment name length
    const nameLength = equipment.equipmentName?.length || 0;
    let cardWidth = 180; // Base width in mm

    // Adjust width based on name length
    if (nameLength > 30) {
      cardWidth = Math.min(280, 180 + (nameLength - 30) * 2);
    }

    // Generate QR code data URL
    QRCode.toDataURL(equipment.qrcode || equipment.equipmentCode)
      .then((qrCodeUrl) => {
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thẻ thiết bị - ${equipment.equipmentName}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .card {
              width: ${cardWidth}mm;
              height: 75mm;
              border: 2px solid #000;
              display: flex;
              background: white;
              box-sizing: border-box;
            }
            
            .left-section {
              width: 50mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 4mm 2mm;
              justify-content: flex-start;
            }
            
            .logo-container {
              width: 100%;
              text-align: center;
              margin-bottom: 0mm;
            }
            
            .logo {
              width: 30mm;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-top: 0mm;
            }
            
            .qr-code {
              width: 46mm;
              height: 46mm;
              padding: 2mm;
              background: white;
            }
            
            .qr-code img {
              width: 100%;
              height: 100%;
              display: block;
            }
            
            .qr-label {
              font-size: 16pt;
              font-weight: bold;
              color: #000;
              text-align: center;
              margin-top: -6mm;
            }
            
            .right-section {
              flex: 1;
              padding: 6mm 2mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .info-row {
              display: flex;
              align-items: baseline;
              margin-bottom: 3mm;
              font-size: 16pt;
              line-height: 1.5;
            }
            
            .label {
              font-weight: normal;
              color: #000;
              min-width: 40mm;
              flex-shrink: 0;
            }
            
            .value {
              font-weight: bold;
              color: #000;
              flex: 1;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
              
              .card {
                page-break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="left-section">
              <div class="logo-container">
                <img src="/assets/images/logo_kip.jpg" alt="KIP Logo" class="logo" onerror="this.style.display='none'">
              </div>
              
              <div class="qr-container">
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="QR Code" />
                </div>
                <div class="qr-label">QR-Code</div>
              </div>
            </div>
            
            <div class="right-section">
              <div class="info-row">
                <span class="label">Mã thiết bị:</span>
                <span class="value">${equipment.equipmentCode}</span>
              </div>
              <div class="info-row">
                <span class="label">Tên thiết bị:</span>
                <span class="value">${equipment.equipmentName}</span>
              </div>
              <div class="info-row">
                <span class="label">Xuất xứ:</span>
                <span class="value">${equipment.origin || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Năm SX:</span>
                <span class="value">${equipment.yom || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày SD:</span>
                <span class="value">${equipment.dateUse ? dayjs(equipment.dateUse).format('DD/MM/YYYY') : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

        printWindow.document.write(printContent);
        printWindow.document.close();
      })
      .catch((error) => {
        console.error('Error generating QR code for print:', error);
        message.error('Không thể tạo mã QR cho in ấn');
      });
  };

  const handlePrintAllEquipmentCards = async () => {
    const printWindow = window.open('', '_blank');
    const equipmentsToPrint = filteredEquipments; // Sử dụng danh sách đã lọc và sắp xếp

    let cardsHtml = '';

    for (const equipment of equipmentsToPrint) {
      try {
        const qrCodeUrl = await QRCode.toDataURL(equipment.qrcode || equipment.equipmentCode);

        // Tính toán độ rộng dựa trên tên thiết bị
        const nameLength = equipment.equipmentName?.length || 0;
        let cardWidth = 180; // Base width in mm

        if (nameLength > 30) {
          cardWidth = Math.min(280, 180 + (nameLength - 30) * 2);
        }

        cardsHtml += `
          <div class="card">
            <div class="left-section">
              <div class="logo-container">
                <img src="/assets/images/logo_kip.jpg" alt="KIP Logo" class="logo" onerror="this.style.display='none'">
              </div>
              
              <div class="qr-container">
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="QR Code" />
                </div>
                <div class="qr-label">QR-Code</div>
              </div>
            </div>
            
            <div class="right-section">
              <div class="info-row">
                <span class="label">Mã thiết bị:</span>
                <span class="value">${equipment.equipmentCode}</span>
              </div>
              <div class="info-row">
                <span class="label">Tên thiết bị:</span>
                <span class="value">${equipment.equipmentName}</span>
              </div>
              <div class="info-row">
                <span class="label">Xuất xứ:</span>
                <span class="value">${equipment.origin || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Năm SX:</span>
                <span class="value">${equipment.yom || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày SD:</span>
                <span class="value">${equipment.dateUse ? dayjs(equipment.dateUse).format('DD/MM/YYYY') : 'N/A'}</span>
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        console.error('Error generating QR for equipment:', equipment.equipmentCode, error);
      }
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Danh sách card thiết bị</title>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 10mm;
            size: A4 landscape;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            margin: 0;
            padding: 10mm;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-content: flex-start;
            gap: 5mm;
          }
          
          .card {
            width: calc(50% - 3.5mm);
            height: 50mm;
            border: 2px solid #000;
            display: flex;
            background: white;
            box-sizing: border-box;
            page-break-inside: avoid;
            transform-origin: top left;
          }
          
          .left-section {
            width: 32mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3mm 1mm;
            justify-content: flex-start;
          }
          
          .logo-container {
            width: 100%;
            text-align: center;
            margin-bottom: 0mm;
          }
          
          .logo {
            width: 20mm;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 0mm;
          }
          
          .qr-code {
            width: 31mm;
            height: 31mm;
            padding: 1mm;
            background: white;
          }
          
          .qr-code img {
            width: 100%;
            height: 100%;
            display: block;
          }
          
          .qr-label {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
            text-align: center;
            margin-top: -3mm;
          }
          
          .right-section {
            flex: 1;
            padding: 6mm 4mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 2mm;
            font-size: 11pt;
            line-height: 1.5;
          }
          
          .label {
            font-weight: normal;
            color: #000;
            width: 25mm;
            flex-shrink: 0;
          }
          
          .value {
            font-weight: bold;
            color: #000;
            flex: 1;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 10mm;
              background: white;
            }
            
            .card {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${cardsHtml}
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const data = await equipmentService.getEquipments();
      setEquipments(data);
    } catch (error) {
      console.error("Error loading equipments:", error);
      message.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const loadStages = async () => {
    try {
      const response = await stageService.getActiveStages();
      // Đảm bảo data là array
      const data = response.data || response;
      setStages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading stages:", error);
      message.error("Không thể tải danh sách công đoạn");
      setStages([]); // Set về empty array nếu có lỗi
    }
  };

  const loadActiveStages = async () => {
    try {
      const response = await stageService.getActiveStages();
      const data = response.data || response;
      setStageActive(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading active stages:", error);
      message.error("Không thể tải danh sách công đoạn đang hoạt động");
      setStageActive([]); // Set về empty array nếu có lỗi
    }
  };

  const getColumnSearchProps = (dataIndex, placeholderText) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`${placeholderText}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => { }, 100);
        }
      },
    },
  });

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const equipmentData = {
        ...values,
        dateUse: values.dateUse ? values.dateUse.format("YYYY-MM-DD") : null,
      };

      if (editingEquipment) {
        await equipmentService.updateEquipment(
          editingEquipment.equipmentId,
          equipmentData
        );
        message.success("Cập nhật thiết bị thành công");
      } else {
        await equipmentService.createEquipment(equipmentData);
        message.success("Thêm thiết bị mới thành công");
      }

      setIsModalVisible(false);
      setEditingEquipment(null);
      form.resetFields();
      loadEquipments();
    } catch (error) {
      console.error("Lỗi đang lưu thiết bị:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        // Set inline validation errors
        const fieldErrors = Object.keys(error.response.data.errors).map(key => ({
          name: key,
          errors: [error.response.data.errors[key]]
        }));
        form.setFields(fieldErrors);
      } else {
        // Parse error message to set inline for specific fields
        const errorMessage = error.message || "Không thể lưu thông tin thiết bị";
        const messages = errorMessage.split(/[.\n]/).filter(msg => msg.trim());
        const fieldErrors = [];

        messages.forEach(msg => {
          const trimmedMsg = msg.trim();
          if (trimmedMsg.toLowerCase().includes("mã thiết bị") || trimmedMsg.toLowerCase().includes("equipment code")) {
            fieldErrors.push({ name: 'equipmentCode', errors: [trimmedMsg] });
          }
          if (trimmedMsg.toLowerCase().includes("tên thiết bị") || trimmedMsg.toLowerCase().includes("equipment name")) {
            fieldErrors.push({ name: 'equipmentName', errors: [trimmedMsg] });
          }
          if (trimmedMsg.toLowerCase().includes("năm sản xuất") || trimmedMsg.toLowerCase().includes("year")) {
            fieldErrors.push({ name: 'yom', errors: [trimmedMsg] });
          }
          if (trimmedMsg.toLowerCase().includes("ghi chú") || trimmedMsg.toLowerCase().includes("issue")) {
            fieldErrors.push({ name: 'issue', errors: [trimmedMsg] });
          }
        });

        if (fieldErrors.length > 0) {
          form.setFields(fieldErrors);
        } else {
          message.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEquipment(null);
    form.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingEquipment(null);
  };

  const getActionMenuItems = (equipment) => {
    const items = [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "Xem chi tiết",
      },
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Chỉnh sửa",
      },
    ];

    if (equipment.isActive) {
      items.push({
        key: "deactivate",
        icon: <LockOutlined />,
        label: "Vô hiệu hóa",
        danger: true,
      });
    } else {
      items.push({
        key: "activate",
        icon: <UnlockOutlined />,
        label: "Kích hoạt",
      });
    }

    return items;
  };

  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "equipmentCode",
      key: "equipmentCode",
      width: 120,
      ...getColumnSearchProps("equipmentCode", "Tìm kiếm mã thiết bị"),
      render: (text) => <Text strong>{text || "N/A"}</Text>,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "equipmentName",
      key: "equipmentName",
      width: 200,
      align: "left",
      ...getColumnSearchProps("equipmentName", "Tìm kiếm tên thiết bị"),
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Công đoạn",
      dataIndex: "stageId",
      key: "stageId",
      width: 150,
      filters: Array.isArray(stages)
        ? stages.map((stage) => ({
          text: stage.stageName,
          value: stage.stageId,
        }))
        : [],
      onFilter: (value, record) => record.stageId === value,
      render: (stageId) => {
        const stage = Array.isArray(stages)
          ? stages.find((s) => s.stageId === stageId)
          : null;
        return stage ? (
          <Tag color="blue">{stage.stageName}</Tag>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        );
      },
    },
    {
      title: "Xuất xứ",
      dataIndex: "origin",
      key: "origin",
      width: 120,
      align: "left",
      ...getColumnSearchProps("origin", "Tìm kiếm xuất xứ"),
      render: (text) => <Text>{text || "N/A"}</Text>,
    },
    {
      title: "Năm sản xuất",
      dataIndex: "yom",
      key: "yom",
      width: 120,
      align: "left",
      ...getColumnSearchProps("yom", "Tìm kiếm năm sản xuất"),
      render: (yom) => <Text>{yom || "N/A"}</Text>,
    },
    {
      title: "Ngày đưa vào sử dụng",
      dataIndex: "dateUse",
      key: "dateUse",
      width: 150,
      align: "left",
      render: (date) => (
        <Text>{date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      align: "center",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Hoạt động" : "Không hoạt động"}
        />
      ),
    },
    // {
    //   title: "Vấn đề",
    //   dataIndex: "issue",
    //   key: "issue",
    //   width: 200,
    //   ...getColumnSearchProps("issue", "Tìm kiếm vấn đề"),
    //   render: (issue) =>
    //     issue ? (
    //       <Tooltip title={issue}>
    //         <Tag icon={<WarningOutlined />} color="warning">
    //           Có vấn đề
    //         </Tag>
    //       </Tooltip>
    //     ) : (
    //       <Tag icon={<CheckCircleOutlined />} color="success">
    //         Bình thường
    //       </Tag>
    //     ),
    // },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<DownOutlined />}></Button>
        </Dropdown>
      ),
    },
  ];

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesArchive = showArchive
      ? !equipment.isActive
      : equipment.isActive;
    const matchesSearch =
      !searchText ||
      equipment.equipmentCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      equipment.equipmentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      equipment.origin?.toLowerCase().includes(searchText.toLowerCase()) ||
      (equipment.yom && equipment.yom.toString().includes(searchText)) ||
      (equipment.issue && equipment.issue.toLowerCase().includes(searchText.toLowerCase()));
    return matchesArchive && matchesSearch;
  });

  const stats = {
    total: equipments.length,
    active: equipments.filter((e) => e.isActive).length,
    inactive: equipments.filter((e) => !e.isActive).length,
    hasIssue: equipments.filter((e) => e.issue && e.issue.trim() !== "").length,
  };

  return (
    <Layout showHeader={false} showFooter={false}>
      {showHeader && (
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <ToolOutlined /> Quản lý thiết bị
          </Title>
        </div>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng thiết bị"
              value={stats.total}
              valueStyle={{ color: "#334766" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={stats.inactive}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có vấn đề"
              value={stats.hasIssue}
              valueStyle={{ color: "#faad14" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo mã, tên, xuất xứ..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6} md={4}></Col>
          <Col xs={24} sm={6} md={12}>
            <Space style={{ float: "right" }}>
              <Button
                type={showArchive ? "primary" : "dashed"}
                icon={showArchive ? <EyeOutlined /> : <ArchiveIcon />}
                onClick={() => setShowArchive(!showArchive)}
                style={
                  showArchive
                    ? { backgroundColor: "#334766", borderColor: "#334766" }
                    : {}
                }
              >
                {showArchive
                  ? "Hiển thị (Hoạt động)"
                  : "Lưu trữ (Ngừng hoạt động)"}
              </Button>
              <Button
                type="default"
                icon={<PrinterOutlined />}
                onClick={handlePrintAllEquipmentCards}
                style={{
                  borderColor: "#334766",
                  color: "#334766",
                }}
              >
                In mã tất cả
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingEquipment(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
                style={{
                  backgroundColor: "#334766",
                  borderColor: "#334766",
                }}
              >
                Thêm thiết bị
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredEquipments}
          rowKey="equipmentId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thiết bị`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: "Không có dữ liệu thiết bị",
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <ToolOutlined />
            {editingEquipment ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={1400}
        centered
        okText={editingEquipment ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        onOk={() => form.submit()}
        okButtonProps={{
          style: {
            backgroundColor: "#334766",
            borderColor: "#334766",
            height: "40px",
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "120px",
          },
        }}
        cancelButtonProps={{
          style: {
            height: "40px",
            fontSize: "16px",
            minWidth: "120px",
          },
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Mã thiết bị
                  </span>
                }
                name="equipmentCode"
                rules={[
                  {
                    required: true,
                    validator: (_, value) => {
                      if (!value || value.trim() === '') {
                        return Promise.reject(new Error("Vui lòng nhập mã thiết bị"));
                      }
                      if (value.length > 50) {
                        return Promise.reject(new Error("Mã thiết bị không được vượt quá 50 ký tự"));
                      }
                      if (value && value !== value.trim()) {
                        return Promise.reject(new Error("Mã thiết bị không được có khoảng trắng đầu hoặc cuối"));
                      }
                      const exists = equipments.some(
                        (e) =>
                          e.equipmentCode.toLowerCase() === value.toLowerCase() &&
                          e.equipmentId !== editingEquipment?.equipmentId
                      );
                      if (exists) {
                        return Promise.reject(new Error("Mã thiết bị đã tồn tại"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                normalize={(value) => value?.trim()}
              >
                <Input placeholder="Nhập mã thiết bị" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Tên thiết bị
                  </span>
                }
                name="equipmentName"
                rules={[
                  {
                    required: true,
                    validator: (_, value) => {
                      if (!value || value.trim() === '') {
                        return Promise.reject(new Error("Vui lòng nhập tên thiết bị"));
                      }
                      if (value.length > 200) {
                        return Promise.reject(new Error("Tên thiết bị không được vượt quá 200 ký tự"));
                      }
                      if (value && value !== value.trim()) {
                        return Promise.reject(new Error("Tên thiết bị không được có khoảng trắng đầu hoặc cuối"));
                      }
                      const exists = equipments.some(
                        (e) =>
                          e.equipmentName.toLowerCase() === value.toLowerCase() &&
                          e.equipmentId !== editingEquipment?.equipmentId
                      );
                      if (exists) {
                        return Promise.reject(new Error("Tên thiết bị đã tồn tại"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                normalize={(value) => value?.trim()}
              >
                <Input placeholder="Nhập tên thiết bị" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Xuất xứ
                  </span>
                }
                name="origin"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value.length > 100) {
                        return Promise.reject(new Error("Xuất xứ không được vượt quá 100 ký tự"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập xuất xứ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Năm sản xuất
                  </span>
                }
                name="yom"
                rules={[
                  {
                    type: 'number',
                    min: 1900,
                    max: dayjs().year(),
                    message: 'Năm sản xuất phải từ 1900 đến năm hiện tại',
                    transform: (value) => value ? Number(value) : value,
                  },
                ]}
              >
                <Input type="number" placeholder="Nhập năm sản xuất" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Ngày đưa vào sử dụng
                  </span>
                }
                name="dateUse"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve(); // Không bắt buộc
                      }
                      
                      const selectedYear = value.year();
                      const currentYear = dayjs().year();
                      
                      // Lấy giá trị năm sản xuất từ form
                      const yomValue = form.getFieldValue('yom');
                      
                      if (yomValue) {
                        if (selectedYear < yomValue) {
                          return Promise.reject(new Error("Ngày đưa vào sử dụng phải sau năm sản xuất"));
                        }
                      }
                      
                      if (selectedYear > currentYear) {
                        return Promise.reject(new Error("Ngày đưa vào sử dụng phải trước năm hiện tại"));
                      }
                      
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Công đoạn
                  </span>
                }
                name="stageId"
              >
                <Select
                  placeholder="Chọn công đoạn"
                  loading={stageActive.length === 0}
                  notFoundContent={
                    stageActive.length === 0
                      ? "Đang tải..."
                      : "Không có công đoạn nào"
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  size="large"
                >
                  {stageActive.map((stage) => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Vấn đề/Ghi chú
              </span>
            }
            name="issue"
            rules={[
              {
                max: 500,
                message: 'Ghi chú không được vượt quá 500 ký tự',
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập vấn đề hoặc ghi chú về thiết bị"
            />
          </Form.Item> */}
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ToolOutlined />
            Chi tiết thiết bị
          </Space>
        }
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsViewModalVisible(false);
              setEditingEquipment(viewingEquipment);
              form.setFieldsValue({
                equipmentCode: viewingEquipment.equipmentCode,
                equipmentName: viewingEquipment.equipmentName,
                origin: viewingEquipment.origin,
                yom: viewingEquipment.yom,
                dateUse: viewingEquipment.dateUse ? dayjs(viewingEquipment.dateUse) : null,
                stageId: viewingEquipment.stageId,
                issue: viewingEquipment.issue,
              });
              setIsModalVisible(true);
            }}
            style={{
              backgroundColor: "#334766",
              borderColor: "#334766",
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Chỉnh sửa
          </Button>,
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintEquipmentCard(viewingEquipment)}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            In thẻ thiết bị
          </Button>,
          <Button
            key="close"
            onClick={handleViewCancel}
            style={{
              height: "40px",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            Đóng
          </Button>,
        ]}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px",
        }}
        width={1200}
      >
        {viewingEquipment && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Descriptions
              bordered
              column={2}
              size="middle"
              labelStyle={{
                fontWeight: "bold",
                fontSize: "14px",
                backgroundColor: "#fafafa",
                borderRight: "1px solid #d9d9d9",
                padding: "12px 16px",
                minWidth: "160px",
              }}
            >
              <Descriptions.Item label="Mã thiết bị" span={1}>
                <Text>{viewingEquipment.equipmentCode || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên thiết bị" span={1}>
                <Text>{viewingEquipment.equipmentName || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Công đoạn" span={2}>
                {viewingEquipment.stageId ? (
                  <Tag color="blue">
                    {Array.isArray(stages)
                      ? stages.find((s) => s.stageId === viewingEquipment.stageId)
                        ?.stageName || "N/A"
                      : "N/A"}
                  </Tag>
                ) : (
                  <Text type="secondary">Chưa phân công</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Xuất xứ" span={1}>
                <Text>{viewingEquipment.origin || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Năm sản xuất" span={1}>
                <Text>{viewingEquipment.yom || "N/A"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đưa vào sử dụng" span={1}>
                <Text>
                  {viewingEquipment.dateUse
                    ? dayjs(viewingEquipment.dateUse).format("DD/MM/YYYY")
                    : "N/A"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã QR" span={2}>
                {viewingEquipment.qrcode ? (
                  <Space direction="vertical">
                    {qrImageUrl && (
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        style={{ width: 128, height: 128 }}
                      />
                    )}
                    <Text copyable>{viewingEquipment.qrcode}</Text>
                  </Space>
                ) : (
                  <Text type="secondary">Chưa tạo</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Badge
                  status={viewingEquipment.isActive ? "success" : "error"}
                  text={
                    viewingEquipment.isActive ? "Hoạt động" : "Không hoạt động"
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Vấn đề/Ghi chú" span={2}>
                {viewingEquipment.issue ? (
                  <Text>{viewingEquipment.issue}</Text>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Không có vấn đề
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default EquipmentManagement;
