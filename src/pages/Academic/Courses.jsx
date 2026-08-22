import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  makeId,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Courses.css";
export default function Courses() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "code", label: "Course code", required: true },
    { name: "title", label: "Course title", required: true },
    { name: "instructor", label: "Instructor" },
    { name: "credits", label: "Credits", type: "number", min: 1 },
    {
      name: "studentId",
      label: "Assigned student",
      type: "select",
      options:
        admin.students?.map((student) => ({
          value: student.id,
          label: `${student.id} — ${student.name}`,
        })) || [],
    },
  ];
  const rows = data.academic?.courses || [];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          courses: saveRecord(current.academic.courses, {
            ...row,
            id: row.id || makeId("CRS"),
          }),
        },
      }),
      {
        module: "academic",
        title: `${row.title} course updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          courses: deleteRecord(current.academic.courses, row),
        },
      }),
      {
        module: "academic",
        title: `${row.title} course removed`,
        studentId: row.studentId,
      },
    );
  return (
    <section className="courses-feature">
      <RecordWorkspace
        title="Courses"
        rows={rows}
        fields={fields}
        prefix="CRS"
        onSave={save}
        onDelete={remove}
      />
    </section>
  );
}
