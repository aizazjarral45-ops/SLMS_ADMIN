import { Card, Descriptions, Empty, Tag } from "antd";
import {
  useAdminWorkspace,
  displayDate,
  tagColor,
} from "../../lib/adminWorkspace";
import "./ComplaintDetails.css";
export default function ComplaintDetails({ selectedId }) {
  const { data } = useAdminWorkspace();
  const row = (data.complaints || []).find(
    (item) => String(item.id || item.key) === String(selectedId),
  );
  if (!row)
    return (
      <Card className="admin-panel complaint-details-feature">
        <Empty description="Select a complaint from the list to view its details." />
      </Card>
    );
  return (
    <Card
      className="admin-panel complaint-details-feature"
      title={row.title || "Complaint details"}
    >
      <Descriptions bordered column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Student">
          {row.studentId || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {row.category || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Department">
          {row.department || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Date">
          {displayDate(row.createdAt || row.date)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={tagColor(row.status)}>{row.status || "Submitted"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {row.description || "No description supplied."}
        </Descriptions.Item>
        <Descriptions.Item label="Resolution" span={2}>
          {row.resolution || "No resolution recorded."}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
