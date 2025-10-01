import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App";
import "./styles/global/variables.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#334766",       // default
          colorPrimaryHover: "#3d557a",  // hover sáng hơn
          colorBorder: "#2b3c55",        // border mặc định
          colorBorderHover: "#3d557a",   // border khi hover
          //controlOutline: "#b6c7e0ff",     // outline khi focus
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
