import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  List,
  Row,
  Col,
  Space,
  Tag,
} from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./CopilotOverview.css";

const prompts = [
  "Summarize open complaints",
  "List approaching assessments",
  "Review hostel fee balances",
];
export default function CopilotOverview() {
  const { data, commit } = useAdminWorkspace();
  const [draft, setDraft] = useState("");
  const send = () => {
    const content = draft.trim();
    if (!content) return;
    commit(
      (current) => ({
        ...current,
        copilotMessages: [
          ...(current.copilotMessages || []),
          {
            id: `AI-${Date.now().toString(36)}`,
            role: "admin",
            content,
            createdAt: new Date().toISOString(),
          },
        ],
      }),
      { module: "ai", title: "Copilot note added", notify: true },
    );
    setDraft("");
  };
  return (
    <Row gutter={[16, 16]} className="copilot-overview-feature">
      <Col xs={24} lg={8}>
        <Card className="admin-panel" title="Operational prompts">
          <List
            dataSource={prompts}
            renderItem={(item) => (
              <List.Item>
                <Button type="link" onClick={() => setDraft(item)}>
                  {item}
                </Button>
              </List.Item>
            )}
          />
        </Card>
        <Alert
          showIcon
          type="info"
          message="Notes are stored locally and can be connected to an API later."
        />
      </Col>
      <Col xs={24} lg={16}>
        <Card className="admin-panel" title="Shared message log">
          <div className="copilot-admin-history">
            {data.copilotMessages?.length ? (
              data.copilotMessages.slice(-12).map((row) => (
                <div
                  key={row.id}
                  className={`copilot-admin-message ${row.role === "admin" ? "is-admin" : ""}`}
                >
                  <Tag>{row.role || "user"}</Tag>
                  <span>{row.content}</span>
                </div>
              ))
            ) : (
              <Empty
                description="No shared copilot messages yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
          <Space.Compact block style={{ marginTop: 16 }}>
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onPressEnter={send}
              placeholder="Add an administrative AI note"
            />
            <Button type="primary" onClick={send}>
              Send note
            </Button>
          </Space.Compact>
        </Card>
      </Col>
    </Row>
  );
}
