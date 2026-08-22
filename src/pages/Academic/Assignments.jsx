import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  makeId,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Assignments.css";
export default function Assignments() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Assignment title", required: true },
    { name: "course", label: "Course" },
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
  const rows = data.academic?.assignments || [];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          assignments: saveRecord(current.academic.assignments, {
            ...row,
            id: row.id || makeId("ASN"),
          }),
        },
      }),
      {
        module: "academic",
        title: `${row.title} assignment updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <section className="assignments-feature">
      <RecordWorkspace
        title="Assignments"
        rows={rows}
        fields={fields}
        prefix="ASN"
        onSave={save}
        onDelete={(row) =>
          commit(
            (current) => ({
              ...current,
              academic: {
                ...current.academic,
                assignments: deleteRecord(current.academic.assignments, row),
              },
            }),
            {
              module: "academic",
              title: `${row.title} assignment removed`,
              studentId: row.studentId,
            },
          )
        }
      />
    </section>
  );
}
