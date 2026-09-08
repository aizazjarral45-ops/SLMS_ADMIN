import { useMemo } from "react";
import { Card, Col, Empty, List, Row, Tag } from "antd";
import { displayDate, useAdminWorkspace } from "../../lib/adminWorkspace";
import "./CopilotOverview.css";

export default function CopilotOverview() {
  const { data, filterByStudent } = useAdminWorkspace();
  const history = useMemo(
    () => filterByStudent(data.aiSearchHistory).slice(0, 8),
    [data.aiSearchHistory, filterByStudent],
  );

  return (
    <Row gutter={[16, 16]} className="copilot-overview-feature">
      <Col xs={24} lg={8}>
        <Card className="admin-panel" title="Student search history">
          <List
            dataSource={history}
            locale={{ emptyText: "No student search history found." }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.query}
                  description={displayDate(item.createdAt)}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} lg={16}>
        <Card className="admin-panel" title="Connected student searches">
          <div className="copilot-admin-history">
            {history.length ? (
              history.map((row) => (
                <div key={row.id} className="copilot-admin-message">
                  <Tag color="green">{row.status}</Tag>
                  <span>{row.query}</span>
                </div>
              ))
            ) : (
              <Empty
                description="No student searches for the selected student"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
