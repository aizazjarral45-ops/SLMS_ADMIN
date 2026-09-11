import { Card, Empty, Select, Space, Tag, Typography, message } from "antd";
import {
  idOf,
  studentNameForRecord,
  useAdminWorkspace,
  tagColor,
} from "../../lib/adminWorkspace";
import { adminRequest, isAdminApiConfigured } from "../../api/client";
import "./ComplaintStatus.css";
export default function ComplaintStatus({ selectedId }) {
  const { data, admin, updateData, filterByStudent } = useAdminWorkspace();
  const rows = filterByStudent(data.complaints);
  const [messageApi, contextHolder] = message.useMessage();
  const update = async (row, status) => {
    if (!isAdminApiConfigured) {
      messageApi.error("Complaint updates require a configured API.");
      return;
    }
    try {
      const result = await adminRequest(`/complaints/${idOf(row)}/status`, {
        method: "PATCH",
        body: { status },
      });
      const updatedComplaint = result.complaint || result.record;
      if (!updatedComplaint) {
        throw new Error("The API did not return the updated complaint.");
      }
      updateData?.((current) => ({
        ...current,
        complaints: current.complaints.map((item) =>
          idOf(item) === idOf(updatedComplaint) ? updatedComplaint : item,
        ),
      }));
      messageApi.success("Complaint status updated.");
    } catch (error) {
      messageApi.error(error.message || "Unable to update complaint status.");
    }
  };
  return (
    <Card
      className="admin-panel complaint-status-feature"
      title="Status tracking"
    >
      {contextHolder}
      {rows.length ? (
        rows.map((row) => (
          <div
            className={`complaint-status-row ${String(selectedId) === String(row.id) ? "is-selected" : ""}`}
            key={idOf(row)}
          >
            <div>
              <Typography.Text strong>
                {row.title || "Complaint"}
              </Typography.Text>
              <div className="dashboard-stat-hint">
                {studentNameForRecord(admin.students, row)}
              </div>
            </div>
            <Space>
              <Tag color={tagColor(row.status)}>
                {row.status || "Submitted"}
              </Tag>
              <Select
                value={row.status || "Submitted"}
                onChange={(value) => update(row, value)}
                options={["Submitted", "Pending", "In Progress", "Resolved", "Rejected", "Closed"].map(
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
