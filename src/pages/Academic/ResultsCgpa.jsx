import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  makeId,
  saveRecord,
  deleteRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./ResultsCgpa.css";
export default function ResultsCgpa() {
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
    { name: "term", label: "Term", required: true },
    { name: "course", label: "Course" },
    { name: "grade", label: "Grade" },
    {
      name: "gpa",
      label: "GPA / CGPA",
      required: true,
      type: "number",
      min: 0,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Published", "Draft", "Reviewed"],
    },
  ];
  const rows = data.academic?.results || [];
  const save = (row) =>
    commit(
      (current) => {
        const result = { ...row, id: row.id || makeId("RES") };
        return {
          ...current,
          academic: {
            ...current.academic,
            results: saveRecord(current.academic.results, result),
          },
          admin: {
            ...current.admin,
            students: current.admin.students.map((student) =>
              student.id === result.studentId
                ? { ...student, cgpa: Number(result.gpa) }
                : student,
            ),
          },
        };
      },
      {
        module: "academic",
        title: `Result published for ${row.term}`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <section className="results-cgpa-feature">
      <RecordWorkspace
        title="Results & CGPA"
        rows={rows}
        fields={fields}
        prefix="RES"
        onSave={save}
        onDelete={(row) =>
          commit(
            (current) => ({
              ...current,
              academic: {
                ...current.academic,
                results: deleteRecord(current.academic.results, row),
              },
            }),
            {
              module: "academic",
              title: `Result removed for ${row.term}`,
              studentId: row.studentId,
            },
          )
        }
      />
    </section>
  );
}
