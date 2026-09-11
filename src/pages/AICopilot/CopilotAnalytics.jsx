import { Card, Col, Row, Statistic, Tag } from "antd";
import { BookOutlined, RobotOutlined, WalletOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./CopilotAnalytics.css";
export default function CopilotAnalytics() {
  const { data, filterByStudent } = useAdminWorkspace();
  const settings = data.settings?.aiSettings || {};
  const messageCount = filterByStudent(data.aiSearchHistory).filter(
    (row) => row.role === undefined || row.role === "user",
  ).length;
  return (
    <Card className="admin-panel copilot-analytics-feature" title="Copilot analytics">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="admin-stat-card">
            <div className="admin-stat-icon">
              <RobotOutlined />
            </div>
            <Statistic title="Messages" value={messageCount} />
            <Tag color="blue">Messages sent in session</Tag>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-stat-card">
            <div className="admin-stat-icon">
              <BookOutlined />
            </div>
            <Statistic
              title="Study planner"
              value={settings.studyPlanner ? "On" : "Off"}
            />
            <Tag color={settings.studyPlanner ? "green" : "default"}>
              Student guidance
            </Tag>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-stat-card">
            <div className="admin-stat-icon">
              <WalletOutlined />
            </div>
            <Statistic
              title="Budget warnings"
              value={settings.budgetWarnings ? "On" : "Off"}
            />
            <Tag color={settings.budgetWarnings ? "green" : "default"}>
              Expense guidance
            </Tag>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
