import {
  BarChartOutlined,
  BellOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag } from "antd";
import "./SettingsOverview.css";

export default function SettingsOverview({ data, onSelectPanel }) {
  const notifications = data?.settings?.notifications || {};
  const preferences = data?.admin?.preferences || {};
  const activeNotifications = Object.values(notifications).filter(Boolean).length;
  const reminderCount = (data?.settings?.reminders || []).filter(
    (row) => row.done !== "Done" && row.done !== true,
  ).length;

  const cards = [
    {
      title: "Security posture",
      value: `${data?.settings?.security?.mfaEnabled ? "MFA" : "No MFA"} enabled`,
      icon: <LockOutlined />,
      detail: `Timeout ${data?.settings?.security?.sessionTimeoutMinutes || 30} mins`,
      action: () => onSelectPanel?.("security"),
    },
    {
      title: "Communication channels",
      value: `${activeNotifications} active alerts`,
      icon: <BellOutlined />,
      detail: `${preferences.weeklyDigest ? "Digest on" : "Digest off"} · ${preferences.compactTables ? "Compact" : "Standard"}`,
      action: () => onSelectPanel?.("reminders"),
    },
    {
      title: "Operational reporting",
      value: `${reminderCount} open reminders`,
      icon: <BarChartOutlined />,
      detail: "Analytics reflect live SLMS activity",
      action: () => onSelectPanel?.("analytics"),
    },
  ];

  return (
    <div className="settings-overview">
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} md={8} key={card.title}>
            <Card className="admin-panel settings-summary-card">
              <div className="settings-summary-top">
                <div className="settings-summary-icon">{card.icon}</div>
                <Tag className="dashboard-eyebrow settings-card-tag">LIVE</Tag>
              </div>
              <div className="settings-summary-label">{card.title}</div>
              <strong className="settings-summary-value">{card.value}</strong>
              <p className="settings-summary-detail">{card.detail}</p>
              <Button type="link" onClick={card.action}>
                Review this area
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="admin-panel settings-overview-card" title="Workspace configuration">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="settings-overview-row">
            <div>
              <strong>Theme</strong>
              <p>{data?.settings?.theme || "Light"}</p>
            </div>
            <div>
              <strong>Admin preferences</strong>
              <p>{preferences.autoAssignComplaints ? "Auto-assign enabled" : "Manual assignment"}</p>
            </div>
          </div>
          <div className="settings-overview-row">
            <div>
              <strong>Security policy</strong>
              <p>{data?.settings?.security?.passwordPolicy || "High"}</p>
            </div>
            <div>
              <strong>Module access</strong>
              <p>Settings, analytics, reminders, and security controls available</p>
            </div>
          </div>
        </Space>
        <div className="settings-overview-actions">
          <Button type="primary" onClick={() => onSelectPanel?.("security")}>
            Manage security
          </Button>
          <Button className="dashboard-secondary-btn" onClick={() => onSelectPanel?.("analytics")}>
            Open analytics
          </Button>
          <Button className="dashboard-secondary-btn" onClick={() => onSelectPanel?.("reminders")}>
            Review reminders
          </Button>
        </div>
      </Card>
    </div>
  );
}
