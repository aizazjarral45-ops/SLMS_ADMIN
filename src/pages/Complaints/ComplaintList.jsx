import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { studentNameForRecord, useAdminWorkspace } from "../../lib/adminWorkspace";
import "./ComplaintList.css";
export default function ComplaintList({ onSelect }) {
  const { data, admin, filterByStudent } =
    useAdminWorkspace();
  const students = admin.students || [];
  const fields = [
    { name: "title", label: "Complaint title", required: true },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: students.map((s) => ({
        value: s.id,
        label: `${s.id} — ${s.name}`,
      })),
    },
    { name: "category", label: "Category" },
    { name: "department", label: "Department" },
    { name: "description", label: "Description", type: "textarea", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Submitted", "In Progress", "Resolved", "Closed"],
    },
  ];
  const studentName = (row) => {
    return studentNameForRecord(
      students,
      row,
      "—",
    );
  };
  return (
    <RecordWorkspace
      title="Complaint List"
      rows={filterByStudent(data.complaints)}
      fields={fields}
      prefix="CMP"
      onView={onSelect}
      readOnly
      renderValue={(field, value, row) =>
        field.name === "studentId" ? studentName(row) : undefined
      }
    />
  );
}
