import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Expenses.css";

export default function Expenses() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Expense title", required: true },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: (admin.students || []).map((s) => ({
        value: s.id,
        label: `${s.id} — ${s.name}`,
      })),
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: (admin.categories || []).map((item) =>
        typeof item === "string" ? item : item.name,
      ),
    },
    { name: "amount", label: "Amount", required: true, type: "number", min: 0 },
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
          amount: Number(row.amount || 0),
        }),
      }),
      {
        module: "expense",
        title: `${row.title || "Expense"} updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        expenses: deleteRecord(current.expenses, row),
      }),
      {
        module: "expense",
        title: `${row.title || "Expense"} removed`,
        studentId: row.studentId,
      },
    );
  return (
    <RecordWorkspace
      title="Expenses"
      rows={data.expenses || []}
      fields={fields}
      prefix="EXP"
      onSave={save}
      onDelete={remove}
    />
  );
}
