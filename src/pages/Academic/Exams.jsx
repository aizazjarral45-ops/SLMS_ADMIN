import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  makeId,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Exams.css";
export default function Exams() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Exam title", required: true },
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
    { name: "examDate", label: "Exam date", type: "date" },
    { name: "venue", label: "Venue" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Scheduled", "Completed", "Deferred"],
    },
  ];
  const rows = data.academic?.exams || [];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        academic: {
          ...current.academic,
          exams: saveRecord(current.academic.exams, {
            ...row,
            id: row.id || makeId("EXM"),
          }),
        },
      }),
      {
        module: "academic",
        title: `${row.title} exam updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <section className="exams-feature">
      <RecordWorkspace
        title="Exams"
        rows={rows}
        fields={fields}
        prefix="EXM"
        onSave={save}
        onDelete={(row) =>
          commit(
            (current) => ({
              ...current,
              academic: {
                ...current.academic,
                exams: deleteRecord(current.academic.exams, row),
              },
            }),
            {
              module: "academic",
              title: `${row.title} exam removed`,
              studentId: row.studentId,
            },
          )
        }
      />
    </section>
  );
}
