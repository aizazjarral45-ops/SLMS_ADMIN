import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Applications.css";

export default function Applications() {
  const { data, admin, commit } = useAdminWorkspace();
  const fields = [
    { name: "fullName", label: "Student name", required: true },
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
    { name: "program", label: "Program" },
    { name: "semester", label: "Semester" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Submitted", "In Progress", "Approved", "Rejected"],
    },
    {
      name: "feesStatus",
      label: "Fee status",
      type: "select",
      options: ["Pending", "Partial", "Paid"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelApplications: saveRecord(current.hostelApplications, {
          ...row,
          id: row.id || makeId("HST"),
        }),
      }),
      {
        module: "hostel",
        title: `${row.fullName || "Hostel"} application updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelApplications: deleteRecord(current.hostelApplications, row),
      }),
      {
        module: "hostel",
        title: `${row.fullName || "Hostel"} application removed`,
        studentId: row.studentId,
      },
    );
  return (
    <RecordWorkspace
      title="Applications"
      rows={data.hostelApplications || []}
      fields={fields}
      prefix="HST"
      onSave={save}
      onDelete={remove}
    />
  );
}
