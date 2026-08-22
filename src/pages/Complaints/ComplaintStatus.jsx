import { Card, Empty, Select, Space, Tag, Typography } from "antd";
import { useAdminWorkspace, tagColor } from "../../lib/adminWorkspace";
import "./ComplaintStatus.css";
export default function ComplaintStatus({ selectedId }) {
  const { data, commit } = useAdminWorkspace();
  const rows = data.complaints || [];
  const update = (row, status) =>
    commit(
      (current) => ({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === row.id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item,
        ),
      }),
      {
        module: "complaints",
        title: `${row.title || "Complaint"} status changed to ${status}`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <Card
      className="admin-panel complaint-status-feature"
      title="Status tracking"
    >
      {rows.length ? (
        rows.map((row) => (
          <div
            className={`complaint-status-row ${String(selectedId) === String(row.id) ? "is-selected" : ""}`}
            key={row.id}
          >
            <div>
              <Typography.Text strong>
                {row.title || "Complaint"}
              </Typography.Text>
              <div className="dashboard-stat-hint">
                {row.studentId || "Unlinked student"}
              </div>
            </div>
            <Space>
              <Tag color={tagColor(row.status)}>
                {row.status || "Submitted"}
              </Tag>
              <Select
                value={row.status || "Submitted"}
                onChange={(value) => update(row, value)}
                options={["Submitted", "In Progress", "Resolved", "Closed"].map(
                  (value) => ({ value, label: value }),
                )}
              />
            </Space>
          </div>
        ))
      ) : (
        <Empty description="No complaint statuses yet" />
      )}
    </Card>
  );
}
