import { css } from "@emotion/react";

export const loginContainer = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 70px);
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

export const loginWrapper = css`
  display: flex;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
  width: 100%;
  max-width: 800px;
  max-height: 600px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

export const logoSection = css`
  flex: 1;
  background: var(--gradient-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: #fff;
  min-width: 350px;

  .logo-content {
    text-align: center;

    .factory-icon {
      font-size: 64px;
      margin-bottom: 20px;
      color: #fff;
    }

    .company-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #fff;
    }

    .company-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const loginForm = css`
  flex: 1;
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 380px;
  max-width: 450px;

  @media (max-width: 768px) {
    min-width: auto;
    max-width: none;
    padding: 24px;
  }

  .ant-form-item-label > label {
    font-weight: 600;
    color: #262626;
    font-size: 14px;
  }

  .ant-input-affix-wrapper,
  .ant-input {
    border-radius: 6px;
    border: 1px solid #d9d9d9;

    &:hover {
      border-color: #3b82f6;
    }

    &:focus,
    &.ant-input-focused {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  }

  .ant-btn-primary {
    background: #334766;
    border-color: #334766;
    font-weight: 600;
    height: 44px;
    border-radius: 8px;

    &:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }
  }
`;

export const title = css`
  text-align: center;
  margin-bottom: 24px !important;
  color: #262626 !important;
  font-weight: 700;
  font-size: 22px !important;
`;

export const toggleGroup = css`
  margin-bottom: 20px !important;

  .ant-radio-group {
    width: 100%;
    display: flex;
    justify-content: center;

    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
      border-radius: 6px;

      &:first-child {
        border-radius: 6px 0 0 6px;
      }

      &:last-child {
        border-radius: 0 6px 6px 0;
      }

      &.ant-radio-button-wrapper-checked {
        background: #334766 !important;
        border-color: #334766 !important;
        color: #fff !important;
      }
    }
  }
`;

export const inputField = css`
  margin-bottom: 16px !important;
`;

export const rememberGroup = css`
  margin-bottom: 24px;

  .ant-checkbox-wrapper {
    color: #595959;
    font-size: 14px;
  }

  /* Custom checkbox checked color */
  .ant-checkbox-checked .ant-checkbox-inner {
    background: #334766;
    border-color: #334766;
  }

  /* Ensure the check mark is visible (white) */
  .ant-checkbox-checked .ant-checkbox-inner::after {
    border-color: #fff;
  }

  /* Hover state */
  .ant-checkbox:hover .ant-checkbox-inner {
    border-color: #334766;
  }
`;

export const loginBtn = css`
  width: 100%;
  font-size: 16px;
`;
