import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Layout from "../components/Layout";
import { authService } from "../services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");

        if (!userId || !token) {
          setSuccess(false);
          setMessage("Thông tin xác thực không hợp lệ");
          setLoading(false);
          return;
        }

        const response = await authService.verifyEmail(userId, token);

        if (response.success) {
          setSuccess(true);
          setMessage(response.message || "Email đã được xác thực thành công!");

          // Update stored user if logged in
          const currentUser = authService.getStoredUser();
          if (currentUser && currentUser.id === userId) {
            currentUser.emailConfirmed = true;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        } else {
          setSuccess(false);
          setMessage(
            response.message ||
              "Không thể xác thực email. Token có thể đã hết hạn."
          );
        }
      } catch (error) {
        setSuccess(false);
        setMessage(error.message || "Đã có lỗi xảy ra khi xác thực email");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            flexDirection: "column",
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang xác thực email...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "50px 0" }}>
        <Result
          status={success ? "success" : "error"}
          icon={
            success ? (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            )
          }
          title={success ? "Xác thực thành công!" : "Xác thực thất bại"}
          subTitle={message}
          extra={[
            authService.isLoggedIn() ? (
              <Button type="primary" key="profile" onClick={handleGoToProfile}>
                Về trang cá nhân
              </Button>
            ) : (
              <Button type="primary" key="login" onClick={handleGoToLogin}>
                Đăng nhập
              </Button>
            ),
          ]}
        />
      </div>
    </Layout>
  );
};

export default VerifyEmail;
