import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Allocations.css";

export default function Allocations() {
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
    {
      name: "roomId",
      label: "Room",
      required: true,
      type: "select",
      options: (admin.rooms || []).map((r) => ({
        value: r.id,
        label: `${r.id} — ${r.block || ""}`,
      })),
    },
    { name: "term", label: "Term", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Pending", "Completed"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => {
        const allocation = {
          ...row,
          id: row.id || makeId("ALC"),
          studentName:
            current.admin.students.find((s) => s.id === row.studentId)?.name ||
            row.studentName,
        };
        const previous = current.admin.allocations.find(
          (a) => a.id === allocation.id,
        );
        const rooms = (current.admin.rooms || []).map((room) => {
          let occupied = Number(room.occupied || 0);
          if (
            previous?.roomId &&
            previous.roomId !== allocation.roomId &&
            previous.status === "Active" &&
            previous.roomId === room.id
          )
            occupied = Math.max(0, occupied - 1);
          if (
            (!previous || previous.roomId !== allocation.roomId) &&
            allocation.status === "Active" &&
            allocation.roomId === room.id
          )
            occupied += 1;
          return {
            ...room,
            occupied,
            status:
              occupied >= Number(room.capacity || 0)
                ? "Full"
                : room.status === "Maintenance"
                  ? "Maintenance"
                  : "Available",
          };
        });
        return {
          ...current,
          admin: {
            ...current.admin,
            allocations: saveRecord(current.admin.allocations, allocation),
            rooms,
          },
        };
      },
      {
        module: "hostel",
        title: `${row.studentName || row.studentId || "Student"} allocation updated`,
        studentId: row.studentId,
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
          allocations: deleteRecord(current.admin.allocations, row),
        },
      }),
      {
        module: "hostel",
        title: "Hostel allocation removed",
        studentId: row.studentId,
      },
    );
  return (
    <RecordWorkspace
      title="Allocations"
      rows={data.admin?.allocations || []}
      fields={fields}
      prefix="ALC"
      onSave={save}
      onDelete={remove}
    />
  );
}
