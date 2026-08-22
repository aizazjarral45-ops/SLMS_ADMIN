import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  makeId,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Attendance.css";
export default function Attendance() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    {
      name: "studentId",
      label: "Student",
      required: true,
      type: "select",
      options:
        admin.students?.map((student) => ({
          value: student.id,
          label: `${student.id} — ${student.name}`,
        })) || [],
    },
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
  const rows = data.academic?.attendance || [];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          attendance: saveRecord(current.academic.attendance, {
            ...row,
            id: row.id || makeId("ATT"),
          }),
        },
      }),
      {
        module: "academic",
        title: `${row.course} attendance recorded`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <section className="attendance-feature">
      <RecordWorkspace
        title="Attendance"
        rows={rows}
        fields={fields}
        prefix="ATT"
        onSave={save}
        onDelete={(row) =>
          commit(
            (current) => ({
              ...current,
              academic: {
                ...current.academic,
                attendance: deleteRecord(current.academic.attendance, row),
              },
            }),
            {
              module: "academic",
              title: `${row.course} attendance removed`,
              studentId: row.studentId,
            },
          )
        }
      />
    </section>
  );
}
