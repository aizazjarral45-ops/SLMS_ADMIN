import { useNavigate } from "react-router-dom";
import { TeamOutlined } from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Students.css";
export default function Students() {
  const navigate = useNavigate();
  const { data, commit } = useAdminWorkspace();
  const fields = [
    { name: "name", label: "Student name", required: true },
    { name: "email", label: "Email", required: true },
    { name: "program", label: "Program" },
    {
      name: "semester",
      label: "Semester",
      type: "select",
      options: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    },
    { name: "cgpa", label: "CGPA", type: "number", min: 0 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Active", "On hold", "Graduated"],
    },
  ];
  
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          students: saveRecord(current.admin.students, {
            ...row,
            id: row.id || makeId("STU"),
          }),
        },
      }),
      {
        module: "students",
        title: `${row.name || "Student"} profile updated`,
        studentId: row.id,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          students: deleteRecord(current.admin.students, row),
        },
      }),
      {
        module: "students",
        title: `${row.name || "Student"} profile removed`,
        refId: row.id,
      },
    );
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
              type="primary"
              onClick={() =>
                document
        
                .querySelector(".record-workspace .ant-btn-primary")
                  ?.click()
              }
            >
              Add student
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/")}
            >
              Back to dashboard
            </Button>
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
        onSave={save}
        onDelete={remove}
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
