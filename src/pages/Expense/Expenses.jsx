import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import { studentNameForRecord, useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Expenses.css";

export default function Expenses() {
  const { data, admin, filterByStudent } = useAdminWorkspace();
  const fields = [
    {
      name: "studentId",
      label: "Student Name",
      type: "select",
      options: (admin.students || []).map((student) => ({
        value: student.id || student._id,
        label: student.name,
      })),
    },
    { name: "title", label: "Expense title", required: true },
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
  return (
    <RecordWorkspace
      title="Expenses"
      rows={filterByStudent(data.expenses)}
      fields={fields}
      prefix="EXP"
      readOnly
      renderValue={(field, value, row) => {
        if (field.name !== "studentId") return undefined;
        return studentNameForRecord(
          admin.students,
          row,
          "—",
        );
      }}
    />
  );
}
