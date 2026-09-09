import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Courses.css";
export default function Courses() {
  const { data, filterByStudent } = useAdminWorkspace();
  const fields = [
    { name: "code", label: "Course code", required: true },
    { name: "title", label: "Course title", required: true },
    { name: "instructor", label: "Instructor" },
    { name: "credits", label: "Credits", type: "number", min: 1 },
  ];
  const rows = filterByStudent(data.academic?.courses);
  return (
    <section className="courses-feature">
      <RecordWorkspace
        title="Courses"
        rows={rows}
        fields={fields}
        prefix="CRS"
        readOnly
      />
    </section>
  );
}
