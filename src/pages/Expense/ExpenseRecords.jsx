import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./ExpenseRecords.css";

export default function ExpenseRecords() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Record title", required: true },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: (admin.students || []).map((s) => ({
        value: s.id,
        label: `${s.id} — ${s.name}`,
      })),
    },
    { name: "amount", label: "Amount", type: "number", min: 0 },
    { name: "date", label: "Date", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Logged", "Approved", "Rejected"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        expenses: saveRecord(current.expenses, {
          ...row,
          id: row.id || makeId("EXP"),
        }),
      }),
      {
        module: "expense",
        title: `${row.title || "Expense"} record updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <RecordWorkspace
      title="Expense Records"
      rows={data.expenses || []}
      fields={fields}
      prefix="EXP"
      onSave={save}
      onDelete={(row) =>
        commit(
          (current) => ({
            ...current,
            expenses: deleteRecord(current.expenses, row),
          }),
          {
            module: "expense",
            title: "Expense record removed",
            studentId: row.studentId,
          },
        )
      }
    />
  );
}
