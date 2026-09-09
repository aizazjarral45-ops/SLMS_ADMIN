import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Exams.css";
export default function Exams() {
  const { data, filterByStudent } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Exam title", required: true },
    { name: "course", label: "Course" },
    { name: "examDate", label: "Exam date", type: "date" },
    { name: "venue", label: "Venue" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Scheduled", "Completed", "Deferred"],
    },
  ];
  const rows = filterByStudent(data.academic?.exams);
  return (
    <section className="exams-feature">
      <RecordWorkspace
        title="Exams"
        rows={rows}
        fields={fields}
        prefix="EXM"
        readOnly
      />
    </section>
  );
}
