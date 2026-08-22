import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./UserDirectory.css";
export default function UserDirectory() {
  const { data, commit } = useAdminWorkspace();
  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", required: true },
    { name: "role", label: "Role", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Inactive"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          users: saveRecord(current.admin.users, {
            ...row,
            id: row.id || makeId("USR"),
          }),
        },
      }),
      {
        module: "users",
        title: `${row.name || "User"} updated`,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <RecordWorkspace
      title="User directory"
      rows={data.admin?.users || []}
      fields={fields}
      prefix="USR"
      onSave={save}
      onDelete={(row) =>
        commit(
          (current) => ({
            ...current,
            admin: {
              ...current.admin,
              users: deleteRecord(current.admin.users, row),
            },
          }),
          {
            module: "users",
            title: `${row.name || "User"} removed`,
            refId: row.id,
          },
        )
      }
    />
  );
}
