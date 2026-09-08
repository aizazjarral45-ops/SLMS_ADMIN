import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  idOf,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Attendance.css";
import { saveAdminEntity, deleteAdminEntity } from "../../lib/adminApi";
export default function Attendance() {
  const { data, admin, commit, filterByStudent } = useAdminWorkspace();
  const fields = [
    {
      name: "studentId",
      label: "Student",
      required: true,
      type: "select",
      options:
        admin.students?.map((student) => ({
          value: idOf(student),
          label: `${idOf(student)} — ${student.name}`,
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
  const rows = filterByStudent(data.academic?.attendance);
  const save = async (row) => {
    const saved = await saveAdminEntity("attendance", row);
    return commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          attendance: saveRecord(current.academic.attendance, {
            ...saved,
          }),
        },
      }),
      {
        module: "academic",
        title: `${row.course} attendance recorded`,
        studentId: row.studentId,
        refId: saved._id || saved.id,
        notify: true,
      },
    );
  };
  return (
    <section className="attendance-feature">
      <RecordWorkspace
        title="Attendance"
        rows={rows}
        fields={fields}
        prefix="ATT"
        onSave={save}
        onDelete={async (row) => {
          await deleteAdminEntity("attendance", row);
          return commit(
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
          );
        }}
      />
    </section>
  );
}
