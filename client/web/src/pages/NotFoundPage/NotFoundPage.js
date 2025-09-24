import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = ({ message = "Sorry, the page you visited does not exist or you do not have permission." }) => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle={message}
      extra={
        <Button type="primary" onClick={() => navigate("/login")}>Back to Login</Button>
      }
    />
  );
};

export default NotFoundPage;
