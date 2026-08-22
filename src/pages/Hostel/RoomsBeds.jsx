import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./RoomsBeds.css";

export default function RoomsBeds() {
  const { data, commit } = useAdminWorkspace();
  const fields = [
    { name: "id", label: "Room number", required: true },
    { name: "block", label: "Block", required: true },
    { name: "capacity", label: "Beds", type: "number", min: 1 },
    { name: "occupied", label: "Occupied beds", type: "number", min: 0 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Available", "Full", "Maintenance"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          rooms: saveRecord(current.admin.rooms, {
            ...row,
            id: row.id || makeId("ROM"),
            capacity: Number(row.capacity || 0),
            occupied: Number(row.occupied || 0),
          }),
        },
      }),
      {
        module: "hostel",
        title: `${row.id || "Room"} updated`,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          rooms: deleteRecord(current.admin.rooms, row),
        },
      }),
      { module: "hostel", title: `${row.id || "Room"} removed`, refId: row.id },
    );
  return (
    <RecordWorkspace
      title="Rooms & Beds"
      rows={data.admin?.rooms || []}
      fields={fields}
      prefix="ROM"
      onSave={save}
      onDelete={remove}
    />
  );
}
