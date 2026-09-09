import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Assignments.css";
export default function Assignments() {
  const { data, filterByStudent } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Assignment title", required: true },
    { name: "course", label: "Course" },
    { name: "dueDate", label: "Due date", type: "date" },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: ["Low", "Medium", "High"],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["To do", "In progress", "Completed"],
    },
  ];
  const rows = filterByStudent(data.academic?.assignments);
  return (
    <section className="assignments-feature">
      <RecordWorkspace
        title="Assignments"
        rows={rows}
        fields={fields}
        prefix="ASN"
        readOnly
      />
    </section>
  );
}
