import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./ComplaintList.css";
import { saveAdminEntity, deleteAdminEntity } from "../../lib/adminApi";
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
    { name: "description", label: "Description", type: "textarea", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Submitted", "In Progress", "Resolved", "Closed"],
    },
  ];
  const save = async (row) => {
    const saved = await saveAdminEntity("complaints", row);
    return commit(
      (current) => ({
        ...current,
        complaints: saveRecord(current.complaints, {
          ...saved,
        }),
      }),
      {
        module: "complaints",
        title: `${saved.title || "Complaint"} updated`,
        studentId: saved.studentId,
        refId: saved._id || saved.id,
        notify: true,
      },
    );
  };
  const remove = async (row) => {
    await deleteAdminEntity("complaints", row);
    return commit(
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
  };
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
