import {
  BellOutlined,
  HistoryOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Tag } from "antd";
import "./SettingsOverview.css";

export default function SettingsOverview({ data, onSelectPanel }) {
  const reminderCount = (data?.reminders || data?.settings?.reminders || []).filter(
    (row) => row.done !== "Done" && row.done !== true,
  ).length;

  const cards = [
    {
      title: "Reminders",
      value: `${reminderCount} open reminders`,
      icon: <BellOutlined />,
      detail: "Review reminders for the selected student",
      action: () => onSelectPanel?.("reminders"),
    },
    {
      title: "Logout",
      value: "Protected workspace",
      icon: <LockOutlined />,
      detail: "Manage the current administrator session",
      action: () => onSelectPanel?.("security"),
    },
    {
      title: "Login History",
      value: "Student activity",
      icon: <HistoryOutlined />,
      detail: "View the selected student's access history",
      action: () => onSelectPanel?.("login-history"),
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

    </div>
  );
}
