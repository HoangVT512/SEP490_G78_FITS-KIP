import { css } from "@emotion/react";

export const dashboardContainer = css`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: calc(100vh - 70px);
`;

export const welcomeCard = css`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .ant-card-body {
    padding: 32px;
  }

  h2 {
    margin-bottom: 12px;
    color: #1e293b !important;
  }
`;

export const statsCard = css`
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    border-color: #1e40af;
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
  }

  h4 {
    color: #1e40af;
    margin-bottom: 8px;
  }

  span {
    color: #64748b;
  }
`;

export const quickStatsCard = css`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.08);
    border-color: #2563eb;
  }

  &.equipment-card {
    border-left: 4px solid #2563eb;
  }

  &.incident-card {
    border-left: 4px solid #dc2626;
  }

  &.maintenance-card {
    border-left: 4px solid #059669;
  }

  &.completed-card {
    border-left: 4px solid #7c3aed;
  }

  .ant-statistic-title {
    margin-bottom: 8px;
    font-weight: 500;
    color: #64748b;
  }

  .ant-statistic-content-value {
    font-size: 28px;
  }
`;

export const progressCard = css`
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  .ant-card-head {
    border-bottom: 1px solid #f1f5f9;
  }

  .ant-card-head-title {
    font-weight: 600;
  }

  .ant-progress-line {
    margin-bottom: 16px;
  }

  .ant-card-small {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
