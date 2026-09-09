import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Attendance.css";
export default function Attendance() {
  const { data, filterByStudent } = useAdminWorkspace();
  const fields = [
    { name: "course", label: "Course", required: true },
    {
      name: "attended",
      label: "Classes attended",
      required: true,
      type: "number",
    },
    {
      name: "total",
      label: "Total classes",
      required: true,
      type: "number",
      min: 1,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Recorded", "At risk", "Cleared"],
    },
  ];
  const rows = filterByStudent(data.academic?.attendance);
  return (
    <section className="attendance-feature">
      <RecordWorkspace
        title="Attendance"
        rows={rows}
        fields={fields}
        prefix="ATT"
        readOnly
      />
    </section>
  );
}
