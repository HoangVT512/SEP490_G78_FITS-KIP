import { css } from "@emotion/react";

export const layoutContainer = css`
  min-height: 100vh;
`;

export const headerStyle = css`
  background: var(--gradient-primary) !important;
  padding: 0 32px !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15) !important;
  height: 70px !important;
  border-bottom: 1px solid #e2e8f0 !important;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;

    .company-name {
      color: #fff !important;
      font-size: 20px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 12px;

      .nav-button {
        color: rgba(255, 255, 255, 0.9);
        border-color: transparent;
        font-weight: 500;
        font-size: 14px;
        height: 40px;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: transparent !important;
        }

        &.ant-btn-primary {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;

          &:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
          }
        }

        &.ant-btn-text {
          &:hover {
            color: #fff !important;
            background: rgba(255, 255, 255, 0.1) !important;
          }
        }
      }

      .login-button {
        margin-left: 12px;
        background: #fff;
        color: #334766;
        border: 1px solid #fff;
        font-weight: 600;
        font-size: 14px;
        padding: 0 20px;
        height: 40px;
        border-radius: 8px;

        &:hover {
          background: #f8fafc !important;
          color: var(--primary-dark) !important;
          border-color: #f8fafc !important;
        }

        &.ant-btn-primary {
          background: var(--primary-dark);
          color: #fff;
          border-color: var(--primary-dark);

          &:hover {
            background: var(--primary-color) !important;
            border-color: var(--primary-color) !important;
          }
        }
      }
    }
  }
`;

export const contentStyle = css`
  background: #f0f2f5;
  min-height: calc(100vh - 134px);
`;

export const footerStyle = css`
  text-align: center;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;

  span {
    color: #8c8c8c;
    font-size: 12px;
  }
`;
