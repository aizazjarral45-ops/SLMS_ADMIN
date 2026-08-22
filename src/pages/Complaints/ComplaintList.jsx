import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./ComplaintList.css";
export default function ComplaintList({ onSelect }) {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Complaint title", required: true },
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options: (admin.students || []).map((s) => ({
        value: s.id,
        label: `${s.id} — ${s.name}`,
      })),
    },
    { name: "category", label: "Category" },
    { name: "department", label: "Department" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Submitted", "In Progress", "Resolved", "Closed"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        complaints: saveRecord(current.complaints, {
          ...row,
          id: row.id || makeId("CMP"),
        }),
      }),
      {
        module: "complaints",
        title: `${row.title || "Complaint"} updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        complaints: deleteRecord(current.complaints, row),
      }),
      {
        module: "complaints",
        title: `${row.title || "Complaint"} removed`,
        studentId: row.studentId,
      },
    );
  return (
    <RecordWorkspace
      title="Complaint List"
      rows={data.complaints || []}
      fields={fields}
      prefix="CMP"
      onSave={save}
      onDelete={remove}
      onView={onSelect}
    />
  );
}
