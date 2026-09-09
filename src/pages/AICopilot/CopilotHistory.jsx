import { useMemo, useState } from "react";
import { Button, Card, Input, Modal, Space, Table, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  displayDate,
  findStudentForRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import StudentSelector from "../../components/Admin/StudentSelector";

const findStudentForRow = (students, row) => findStudentForRecord(students, row);

export default function CopilotHistory() {
  const { data, admin, filterByStudent } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const students = useMemo(() => admin.students || [], [admin.students]);
  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return filterByStudent(data.aiSearchHistory).filter((row) => {
      if (!value) return true;
      const student = findStudentForRow(students, row);
      return [row.query, row.status, student?.name, student?.email, row.userId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [data.aiSearchHistory, filterByStudent, query, students]);
  return (
    <>
      <Card
        className="admin-panel"
        title="Student search history"
        extra={<StudentSelector />}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input.Search
            allowClear
            placeholder="Search student, query, status, or user ID"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Table
            rowKey={(row) => row.id}
            dataSource={rows}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            columns={[
              {
                title: "Student",
                render: (_, row) => {
                  const student = findStudentForRow(students, row);
                  return student?.name || row.userId || "Unknown student";
                },
              },
              { title: "Search query", dataIndex: "query" },
              { title: "Date", dataIndex: "createdAt", render: displayDate },
              { title: "Status", dataIndex: "status", render: (value) => <Tag color="green">{value}</Tag> },
              {
                title: "Actions",
                render: (_, row) => (
                  <Button type="link" icon={<EyeOutlined />} onClick={() => setSelected(row)}>
                    View
                  </Button>
                ),
              },
            ]}
          />
        </Space>
      </Card>
      <Modal
        title="Search history details"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected ? (
          <Space direction="vertical">
            <strong>{selected.query}</strong>
            <span>
              Student:{" "}
              {findStudentForRow(students, selected)?.name || "Unknown student"}
            </span>
            <span>Date: {displayDate(selected.createdAt)}</span>
            <span>Status: {selected.status}</span>
            <span>Provider: {selected.provider || "—"}</span>
            <span>Model: {selected.model || "—"}</span>
          </Space>
        ) : null}
      </Modal>
    </>
  );
}
