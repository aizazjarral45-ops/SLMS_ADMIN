import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Roles.css";
export default function Roles() {
  const { data, commit } = useAdminWorkspace();
  const fields = [
    { name: "name", label: "Role name", required: true },
    { name: "members", label: "Members", type: "number", min: 0 },
    { name: "description", label: "Description", type: "textarea" },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          roles: saveRecord(current.admin.roles, {
            ...row,
            id: row.id || makeId("ROL"),
          }),
        },
      }),
      {
        module: "users",
        title: `${row.name || "Role"} updated`,
        refId: row.id,
        notify: true,
      },
    );
  return (
    <RecordWorkspace
      title="Roles"
      rows={data.admin?.roles || []}
      fields={fields}
      prefix="ROL"
      onSave={save}
      onDelete={(row) =>
        commit(
          (current) => ({
            ...current,
            admin: {
              ...current.admin,
              roles: deleteRecord(current.admin.roles, row),
            },
          }),
          {
            module: "users",
            title: `${row.name || "Role"} removed`,
            refId: row.id,
          },
        )
      }
    />
  );
}
