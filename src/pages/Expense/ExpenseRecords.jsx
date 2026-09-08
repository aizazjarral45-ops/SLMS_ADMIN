import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  saveRecord,
  idOf,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import { Button, Space, Popconfirm } from "antd";
import "./ExpenseRecords.css";
import { saveAdminEntity, deleteAdminEntity } from "../../lib/adminApi";

export default function ExpenseRecords() {
  const { data, admin, commit, filterByStudent } = useAdminWorkspace();
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
  const save = async (row) => {
    const saved = await saveAdminEntity("expenses", row);
    return commit(
      (current) => ({
        ...current,
        expenses: saveRecord(current.expenses, saved),
      }),
      {
        module: "expense",
        title: `${saved.title || "Expense"} record updated`,
        studentId: saved.studentId,
        refId: idOf(saved),
        notify: true,
      },
    );
  };
  const approve = async (row) => {
    const updated = await saveAdminEntity("expenses", { ...row, status: "Approved" });
    return commit(
      (current) => ({
        ...current,
        expenses: current.expenses.map((item) =>
          idOf(item) === idOf(updated) ? updated : item,
        ),
      }),
      {
        module: "expense",
        title: `${row.title || "Expense"} approved`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  };

  const reject = async (row) => {
    const updated = await saveAdminEntity("expenses", { ...row, status: "Rejected" });
    return commit(
      (current) => ({
        ...current,
        expenses: current.expenses.map((item) =>
          idOf(item) === idOf(updated) ? updated : item,
        ),
      }),
      {
        module: "expense",
        title: `${row.title || "Expense"} rejected`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
  };

  return (
    <RecordWorkspace
      title="Expense Records"
      rows={filterByStudent(data.expenses)}
      fields={fields}
      prefix="EXP"
      onSave={save}
      deleteConfirmTitle="Are you sure you want to delete this expense?"
      onDelete={async (row) => {
        await deleteAdminEntity("expenses", row);
        return commit(
          (current) => ({
            ...current,
            expenses: deleteRecord(current.expenses, row),
          }),
          {
            module: "expense",
            title: "Expense record removed",
            studentId: row.studentId,
          },
        );
      }}
      additionalRowActions={(row) => (
        <Space>
          {row.status !== "Approved" && (
            <Button type="link" onClick={() => approve(row)}>
              Approve
            </Button>
          )}
          {row.status !== "Rejected" && (
            <Popconfirm
              title="Reject this expense?"
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
