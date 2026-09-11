import { useMemo } from "react";
import { Card, Empty, Tag } from "antd";
import { displayDate, useAdminWorkspace } from "../../lib/adminWorkspace";
import "./CopilotOverview.css";

export default function CopilotOverview() {
  const { data, admin, filterByStudent } = useAdminWorkspace();
  const history = useMemo(
    () => filterByStudent(data.aiSearchHistory).slice(0, 8),
    [data.aiSearchHistory, filterByStudent],
  );
  const students = admin.students || [];

  return (
    <Card
      className="admin-panel copilot-overview-feature"
      title="Student search history"
      extra={
        <Tag color="blue">
          {data.aiSearchHistory?.length || 0} messages
        </Tag>
      }
    >
      <div className="copilot-admin-history">
        {history.length ? (
          history.map((row) => {
            const student = students.find(
              (item) => String(item.id ?? item._id) === String(row.userId),
            );
            return (
              <div key={row.id} className="copilot-admin-message">
                <Tag color="green">{row.status}</Tag>
                <div>
                  <strong>{row.query}</strong>
                  <small>
                    {student?.name || "Unknown student"} ·{" "}
                    {displayDate(row.createdAt)}
                  </small>
                </div>
              </div>
            );
          })
        ) : (
          <Empty
            description="No student searches for the selected student"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Card>
  );
}
