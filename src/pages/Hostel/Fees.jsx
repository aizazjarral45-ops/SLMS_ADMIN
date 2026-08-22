import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Fees.css";

export default function Fees() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    {
      name: "studentId",
      label: "Student",
      required: true,
      type: "select",
      options: (admin.students || []).map((s) => ({
        value: s.id,
        label: `${s.id} — ${s.name}`,
      })),
    },
    { name: "term", label: "Term", required: true },
    { name: "amount", label: "Amount", required: true, type: "number", min: 0 },
    { name: "paidOn", label: "Paid on", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Pending", "Partial", "Paid", "Overdue"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelFees: saveRecord(current.hostelFees, {
          ...row,
          id: row.id || makeId("FEE"),
          amount: Number(row.amount || 0),
        }),
      }),
      {
        module: "hostel",
        title: `Hostel fee ${row.status || "updated"}`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelFees: deleteRecord(current.hostelFees, row),
      }),
      {
        module: "hostel",
        title: "Hostel fee removed",
        studentId: row.studentId,
      },
    );
  return (
    <RecordWorkspace
      title="Fees"
      rows={data.hostelFees || []}
      fields={fields}
      prefix="FEE"
      onSave={save}
      onDelete={remove}
    />
  );
}
