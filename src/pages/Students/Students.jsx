import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TeamOutlined } from "@ant-design/icons";
import { Button, Descriptions, Modal, Space, Tag } from "antd";
import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { rollNoForRecord, useAdminWorkspace } from "../../lib/adminWorkspace";
import { adminRequest, isAdminApiConfigured } from "../../api/client";
import "../../components/Admin/AdminShared.css";
import StudentSelector from "../../components/Admin/StudentSelector";
import "./Students.css";
export default function Students() {
  const navigate = useNavigate();
  const { data } = useAdminWorkspace();
  const [freshStudents, setFreshStudents] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  useEffect(() => {
    if (!isAdminApiConfigured) return undefined;
    let cancelled = false;
    adminRequest("/admin/students")
      .then((result) => {
        if (!cancelled) setFreshStudents(result.students || []);
      })
      .catch((error) => {
        console.error("Unable to refresh student profiles.", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const students = freshStudents || data.admin?.students || [];
  const studentFor = (row) => {
    const identifiers = [
      row.userId,
      row.studentId,
      row.email,
      row.profile?.userId,
      row.profile?.studentId,
      row.profile?.email,
    ]
      .filter(Boolean)
      .map(String);
    return (
      students.find((candidate) =>
        [
          candidate.userId,
          candidate.studentId,
          candidate.email,
          candidate.profile?.userId,
          candidate.profile?.studentId,
          candidate.profile?.email,
        ]
          .filter(Boolean)
          .map(String)
          .some((identifier) => identifiers.includes(identifier)),
      ) || row
    );
  };
  const departmentFor = (row) => {
    const student = studentFor(row);
    return student.department || student.profile?.department || "—";
  };
  const fields = [
    { name: "name", label: "Student name", required: true },
    { name: "studentId", label: "Student ID" },
    { name: "userId", label: "User ID" },
    { name: "email", label: "Email", required: true },
    { name: "phone", label: "Phone" },
    { name: "program", label: "Program" },
  ];
  return (
    <div className="admin-page students-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">STUDENT DIRECTORY</Tag>
          <h1>Students</h1>
          <p>
            Maintain student profiles and open each complete connected SLMS
            record.
          </p>
          <Space wrap>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/")}
            >
              Back to dashboard
            </Button>
            <StudentSelector />
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <TeamOutlined />
          </div>
          <h3>Student records</h3>
          <span>
            {data.admin?.students?.length || 0} profiles are connected to module
            data.
          </span>
          <Button type="link" onClick={() => navigate("/academic")}>
            Review academics
          </Button>
        </div>
      </section>
      <RecordWorkspace
        title="Student records"
        rows={students}
        fields={fields}
        prefix="STU"
        onView={setSelectedStudent}
        pageSize={10}
        renderValue={(field, value, row) => {
          if (field.name === "program") {
            return departmentFor(row);
          }
          if (field.name === "studentId") {
            return rollNoForRecord(students, row);
          }
          if (field.name === "status") {
            return (
              <Tag color={value === "Active" ? "green" : "gold"}>
                {value ?? "Pending"}
              </Tag>
            );
          }

          return value ?? "—";
        }}
      />
      <Modal
        title={selectedStudent?.name || "Student record"}
        open={Boolean(selectedStudent)}
        onCancel={() => setSelectedStudent(null)}
        footer={null}
        destroyOnClose
      >
        {selectedStudent ? (
          <Descriptions bordered column={1}>
            {fields.map((field) => (
              <Descriptions.Item key={field.name} label={field.label}>
                {field.name === "program"
                  ? departmentFor(selectedStudent)
                  : field.name === "studentId"
                    ? rollNoForRecord(students, selectedStudent)
                    : selectedStudent[field.name] ?? "—"}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
}
