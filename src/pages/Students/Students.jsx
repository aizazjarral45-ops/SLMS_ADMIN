import { useNavigate } from "react-router-dom";
import { TeamOutlined } from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import StudentSelector from "../../components/Admin/StudentSelector";
import "./Students.css";
export default function Students() {
  const navigate = useNavigate();
  const { data } = useAdminWorkspace();
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
        rows={data.admin?.students || []}
        fields={fields}
        prefix="STU"
        onView={(row) => navigate(`/students/${row.id}`)}
        renderValue={(field, value) => {
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
    </div>
  );
}
