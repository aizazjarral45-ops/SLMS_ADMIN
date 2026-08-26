import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import { Button, Space, Popconfirm } from "antd";
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

  const approve = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelApplications: current.hostelApplications.map((item) =>
          item.id === row.id ? { ...item, status: "Approved", updatedAt: new Date().toISOString() } : item,
        ),
      }),
      {
        module: "hostel",
        title: `${row.fullName || "Hostel"} application approved`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );

  const reject = (row) =>
    commit(
      (current) => ({
        ...current,
        hostelApplications: current.hostelApplications.map((item) =>
          item.id === row.id ? { ...item, status: "Rejected", updatedAt: new Date().toISOString() } : item,
        ),
      }),
      {
        module: "hostel",
        title: `${row.fullName || "Hostel"} application rejected`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
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
      additionalRowActions={(row) => (
        <Space>
          {row.status !== "Approved" && (
            <Button type="link" onClick={() => approve(row)}>
              Approve
            </Button>
          )}
          {row.status !== "Rejected" && (
            <Popconfirm
              title="Reject this application?"
              okText="Reject"
              okButtonProps={{ danger: true }}
              onConfirm={() => reject(row)}
            >
              <Button type="link" danger>
                Reject
              </Button>
            </Popconfirm>
          )}
        </Space>
      )}
    />
  );
}
