import React, { useState } from "react";
import { Card, DatePicker, Select, Space } from "antd";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import "../../styles/pages/OEEDashboard.css";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock data for OEE Dashboard
const mockOEEData = [
  {
    date: "01/01",
    dungNgan: 3.2,
    dungDai: 2.5,
    phePham: 1.8,
    dauCuoiCa: 1.5,
    doiMaThayDao: 2.1,
    tocDoThaoTac: 3.5,
    ngoaiRa: 2.3,
    oee: 79.42,
    tyLeMat: 16.87,
  },
  {
    date: "02/01",
    dungNgan: 4.1,
    dungDai: 5.2,
    phePham: 2.8,
    dauCuoiCa: 2.1,
    doiMaThayDao: 2.5,
    tocDoThaoTac: 2.8,
    ngoaiRa: 1.08,
    oee: 83.13,
    tyLeMat: 20.58,
  },
  {
    date: "03/01",
    dungNgan: 2.1,
    dungDai: 1.8,
    phePham: 1.2,
    dauCuoiCa: 1.1,
    doiMaThayDao: 1.5,
    tocDoThaoTac: 1.3,
    ngoaiRa: 0.01,
    oee: 90.99,
    tyLeMat: 9.01,
  },
  {
    date: "04/01",
    dungNgan: 2.8,
    dungDai: 2.5,
    phePham: 1.9,
    dauCuoiCa: 1.5,
    doiMaThayDao: 1.8,
    tocDoThaoTac: 1.35,
    ngoaiRa: 0.2,
    oee: 88.7,
    tyLeMat: 12.05,
  },
  {
    date: "05/01",
    dungNgan: 2.5,
    dungDai: 2.2,
    phePham: 1.8,
    dauCuoiCa: 1.6,
    doiMaThayDao: 1.7,
    tocDoThaoTac: 1.3,
    ngoaiRa: 0.2,
    oee: 87.95,
    tyLeMat: 11.3,
  },
  {
    date: "06/01",
    dungNgan: 2.4,
    dungDai: 2.3,
    phePham: 1.7,
    dauCuoiCa: 1.5,
    doiMaThayDao: 1.66,
    tocDoThaoTac: 1.3,
    ngoaiRa: 0.26,
    oee: 88.84,
    tyLeMat: 11.16,
  },
  {
    date: "07/01",
    dungNgan: 3.1,
    dungDai: 3.2,
    phePham: 2.1,
    dauCuoiCa: 1.8,
    doiMaThayDao: 2.04,
    tocDoThaoTac: 1.8,
    ngoaiRa: 0.3,
    oee: 85.66,
    tyLeMat: 14.34,
  },
  {
    date: "08/01",
    dungNgan: 8.5,
    dungDai: 12.3,
    phePham: 4.2,
    dauCuoiCa: 3.5,
    doiMaThayDao: 3.8,
    tocDoThaoTac: 4.2,
    ngoaiRa: 0.82,
    oee: 63.68,
    tyLeMat: 37.32,
  },
  {
    date: "09/01",
    dungNgan: 1.2,
    dungDai: 0.9,
    phePham: 0.8,
    dauCuoiCa: 0.7,
    doiMaThayDao: 0.9,
    tocDoThaoTac: 0.8,
    ngoaiRa: 0.57,
    oee: 94.13,
    tyLeMat: 5.87,
  },
  {
    date: "10/01",
    dungNgan: 2.6,
    dungDai: 2.4,
    phePham: 1.8,
    dauCuoiCa: 1.6,
    doiMaThayDao: 1.77,
    tocDoThaoTac: 1.4,
    ngoaiRa: 0.23,
    oee: 88.84,
    tyLeMat: 11.16,
  },
  {
    date: "11/01",
    dungNgan: 2.8,
    dungDai: 2.6,
    phePham: 1.9,
    dauCuoiCa: 1.7,
    doiMaThayDao: 1.87,
    tocDoThaoTac: 1.5,
    ngoaiRa: 0.23,
    oee: 87.63,
    tyLeMat: 12.37,
  },
  {
    date: "12/01",
    dungNgan: 2.5,
    dungDai: 2.3,
    phePham: 1.7,
    dauCuoiCa: 1.5,
    doiMaThayDao: 1.7,
    tocDoThaoTac: 1.35,
    ngoaiRa: 0.25,
    oee: 88.7,
    tyLeMat: 11.3,
  },
  {
    date: "13/01",
    dungNgan: 2.6,
    dungDai: 2.4,
    phePham: 1.8,
    dauCuoiCa: 1.6,
    doiMaThayDao: 1.76,
    tocDoThaoTac: 1.4,
    ngoaiRa: 0.24,
    oee: 88.84,
    tyLeMat: 11.16,
  },
  {
    date: "14/01",
    dungNgan: 2.7,
    dungDai: 2.5,
    phePham: 1.85,
    dauCuoiCa: 1.65,
    doiMaThayDao: 1.82,
    tocDoThaoTac: 1.43,
    ngoaiRa: 0.23,
    oee: 88.06,
    tyLeMat: 11.94,
  },
  {
    date: "15/01",
    dungNgan: 0,
    dungDai: 0,
    phePham: 0,
    dauCuoiCa: 0,
    doiMaThayDao: 0,
    tocDoThaoTac: 0,
    ngoaiRa: 0,
    oee: 88.06,
    tyLeMat: 11.94,
  },
  {
    date: "16/01",
    dungNgan: 2.6,
    dungDai: 2.4,
    phePham: 1.8,
    dauCuoiCa: 1.6,
    doiMaThayDao: 1.77,
    tocDoThaoTac: 1.4,
    ngoaiRa: 0.23,
    oee: 88.84,
    tyLeMat: 11.16,
  },
  {
    date: "17/01",
    dungNgan: 2.7,
    dungDai: 2.5,
    phePham: 1.85,
    dauCuoiCa: 1.65,
    doiMaThayDao: 1.82,
    tocDoThaoTac: 1.43,
    ngoaiRa: 0.23,
    oee: 88.06,
    tyLeMat: 11.94,
  },
  {
    date: "18/01",
    dungNgan: 2.5,
    dungDai: 2.3,
    phePham: 1.7,
    dauCuoiCa: 1.5,
    doiMaThayDao: 1.7,
    tocDoThaoTac: 1.35,
    ngoaiRa: 0.25,
    oee: 88.7,
    tyLeMat: 11.3,
  },
];

const OEEDashboard = () => {
  const [selectedLine, setSelectedLine] = useState("all");
  const [dateRange, setDateRange] = useState([
    dayjs("2025-01-01"),
    dayjs("2025-01-18"),
  ]);
  const [selectedData, setSelectedData] = useState(null);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      setSelectedData(data);
      return (
        <div
          style={{
            background: "#1f2937",
            color: "white",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "13px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>
            Ngày: {label}/2025
          </p>
          <p style={{ color: "#60A5FA", margin: "4px 0" }}>
            ● Dừng ngắn: {data.dungNgan}%
          </p>
          <p style={{ color: "#1e3a8a", margin: "4px 0" }}>
            ● Dừng dài: {data.dungDai}%
          </p>
          <p style={{ color: "#f97316", margin: "4px 0" }}>
            ● Phế phẩm: {data.phePham}%
          </p>
          <p style={{ color: "#dc2626", margin: "4px 0" }}>
            ● Đầu cuối ca: {data.dauCuoiCa}%
          </p>
          <p style={{ color: "#0ea5e9", margin: "4px 0" }}>
            ● Đổi mã thay dao: {data.doiMaThayDao}%
          </p>
          <p style={{ color: "#84cc16", margin: "4px 0" }}>
            ● Tốc độ thao tác: {data.tocDoThaoTac}%
          </p>
          <p style={{ color: "#a78bfa", margin: "4px 0" }}>
            ● Ngoài ra: {data.ngoaiRa}%
          </p>
          <hr
            style={{
              margin: "8px 0",
              border: "none",
              borderTop: "1px solid #4b5563",
            }}
          />
          <p style={{ fontWeight: 600, margin: "4px 0" }}>● OEE: {data.oee}%</p>
          <p style={{ color: "#fca5a5", fontWeight: 600, margin: "4px 0" }}>
            ● Tỷ lệ mất mát: {data.tyLeMat}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="oee-dashboard-container">
      <div className="oee-dashboard-header">
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Biểu Đồ Hiệu Suất OEE
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#6b7280" }}>
            Theo dõi hiệu suất sản xuất và các thành phần gây mất mát
          </p>
        </div>

        <Space size="middle">
          <Select
            value={selectedLine}
            onChange={setSelectedLine}
            style={{ width: 200 }}
            placeholder="Chọn dây chuyền"
          >
            <Option value="all">Tất cả dây chuyền</Option>
            <Option value="line1">Dây chuyền 1</Option>
            <Option value="line2">Dây chuyền 2</Option>
            <Option value="line3">Dây chuyền 3</Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
          />
        </Space>
      </div>

      <div className="oee-dashboard-stats">
        <Card className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">OEE Trung bình</div>
            <div className="stat-value">85.7%</div>
            <div className="stat-trend positive">+2.3% so với tháng trước</div>
          </div>
        </Card>

        <Card className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Tỷ lệ mất mát TB</div>
            <div className="stat-value">14.3%</div>
            <div className="stat-trend negative">+1.2% so với tháng trước</div>
          </div>
        </Card>

        <Card className="stat-card warning">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-label">Mất mát cao nhất</div>
            <div className="stat-value">08/01</div>
            <div className="stat-trend">37.32% tổng mất mát</div>
          </div>
        </Card>

        <Card className="stat-card success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-label">OEE tốt nhất</div>
            <div className="stat-value">09/01</div>
            <div className="stat-trend">94.13% hiệu suất</div>
          </div>
        </Card>
      </div>

      <div className="oee-charts-container">
        <Card
          className="chart-card"
          title="Biểu đồ OEE - Hiệu suất & Các thành phần mất mát"
        >
          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "24px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#60A5FA" }}
              ></div>
              <span>Dừng ngắn</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#1e3a8a" }}
              ></div>
              <span>Dừng dài</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#f97316" }}
              ></div>
              <span>Phế phẩm</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#dc2626" }}
              ></div>
              <span>Đầu cuối ca</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#0ea5e9" }}
              ></div>
              <span>Đổi mã thay dao</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#84cc16" }}
              ></div>
              <span>Tốc độ thao tác</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#a78bfa" }}
              ></div>
              <span>Ngoài ra</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #000",
                }}
              ></div>
              <span>OEE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{ width: "16px", height: "16px", background: "#ef4444" }}
              ></div>
              <span>Tỷ lệ mất mát</span>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart
              data={mockOEEData}
              margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Mất mát (%)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 13,
                }}
                domain={[0, 40]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Hiệu suất (%)",
                  angle: 90,
                  position: "insideRight",
                  fontSize: 13,
                }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Stacked Bars */}
              <Bar
                yAxisId="left"
                dataKey="dungNgan"
                stackId="a"
                fill="#60A5FA"
              />
              <Bar
                yAxisId="left"
                dataKey="dungDai"
                stackId="a"
                fill="#1e3a8a"
              />
              <Bar
                yAxisId="left"
                dataKey="phePham"
                stackId="a"
                fill="#f97316"
              />
              <Bar
                yAxisId="left"
                dataKey="dauCuoiCa"
                stackId="a"
                fill="#dc2626"
              />
              <Bar
                yAxisId="left"
                dataKey="doiMaThayDao"
                stackId="a"
                fill="#0ea5e9"
              />
              <Bar
                yAxisId="left"
                dataKey="tocDoThaoTac"
                stackId="a"
                fill="#84cc16"
              />
              <Bar
                yAxisId="left"
                dataKey="ngoaiRa"
                stackId="a"
                fill="#a78bfa"
              />

              {/* Line Charts */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="oee"
                stroke="#000"
                strokeWidth={3}
                dot={{ fill: "#000", r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="tyLeMat"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Info Box - Show selected data */}
          {selectedData && (
            <div
              style={{
                marginTop: "16px",
                background: "#1f2937",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                display: "inline-block",
                fontSize: "13px",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "8px", margin: 0 }}>
                {selectedData.date}/2025
              </p>
              <p style={{ margin: "4px 0" }}>
                Dừng ngắn: {selectedData.dungNgan}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Dừng dài: {selectedData.dungDai}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Phế phẩm: {selectedData.phePham}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Đầu cuối ca: {selectedData.dauCuoiCa}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Đổi mã thay dao: {selectedData.doiMaThayDao}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Tốc độ thao tác: {selectedData.tocDoThaoTac}%
              </p>
              <p style={{ margin: "4px 0" }}>
                Ngoài ra: {selectedData.ngoaiRa}%
              </p>
              <p
                style={{
                  color: "#67e8f9",
                  fontWeight: 600,
                  margin: "8px 0 4px 0",
                }}
              >
                OEE: {selectedData.oee}%
              </p>
              <p
                style={{
                  color: "#fca5a5",
                  fontWeight: 600,
                  margin: "4px 0 0 0",
                }}
              >
                Tỷ lệ mất mát: {selectedData.tyLeMat}%
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="oee-legend-info">
        <Card>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            Giải thích các chỉ số
          </h3>
          <div className="legend-grid">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#60A5FA" }}
              ></div>
              <div>
                <strong>Dừng ngắn:</strong> Thời gian dừng máy ngắn hạn do các
                vấn đề nhỏ
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#1e3a8a" }}
              ></div>
              <div>
                <strong>Dừng dài:</strong> Thời gian dừng máy kéo dài do sự cố
                nghiêm trọng
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#f97316" }}
              ></div>
              <div>
                <strong>Phế phẩm:</strong> Tỷ lệ sản phẩm lỗi, không đạt tiêu
                chuẩn chất lượng
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#dc2626" }}
              ></div>
              <div>
                <strong>Đầu cuối ca:</strong> Thời gian mất mát do chuyển ca,
                bàn giao công việc
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#0ea5e9" }}
              ></div>
              <div>
                <strong>Đổi mã thay dao:</strong> Thời gian dành cho việc thay
                đổi dao cắt, khuôn mẫu
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#84cc16" }}
              ></div>
              <div>
                <strong>Tốc độ thao tác:</strong> Mất mát do máy chạy chậm hơn
                tốc độ thiết kế
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#a78bfa" }}
              ></div>
              <div>
                <strong>Ngoài ra:</strong> Các nguyên nhân mất mát khác không
                thuộc các loại trên
              </div>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: "#000" }}
              ></div>
              <div>
                <strong>OEE (Overall Equipment Effectiveness):</strong> Hiệu
                suất tổng thể của thiết bị
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OEEDashboard;
