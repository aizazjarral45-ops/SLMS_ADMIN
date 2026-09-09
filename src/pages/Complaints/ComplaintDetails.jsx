import { Descriptions, Modal, Tag } from "antd";
import {
  idOf,
  studentNameForRecord,
  useAdminWorkspace,
  displayDate,
  tagColor,
} from "../../lib/adminWorkspace";
import "./ComplaintDetails.css";
export default function ComplaintDetails({ selectedId, open, onClose }) {
  const { data, admin, filterByStudent } = useAdminWorkspace();
  const row = filterByStudent(data.complaints).find(
    (item) => idOf(item) === String(selectedId),
  );
  if (!row) return null;
  return (
    <Modal
      title={row.title || "Complaint details"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Descriptions bordered column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Student">
          {studentNameForRecord(admin.students, row)}
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
      </Descriptions>
    </Modal>
  );
}
