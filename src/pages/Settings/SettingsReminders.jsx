import { useAdminWorkspace } from "../../lib/adminWorkspace";
import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import "./SettingsReminders.css";

export default function SettingsReminders() {
  const { data, selectedStudentId, selectedStudentName } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Reminder title" },
    { name: "type", label: "Type" },
    { name: "when", label: "When", type: "date" },
    { name: "done", label: "Status", type: "select", options: ["Pending", "Done", true, false] },
  ];

  return (
    <div className="settings-reminders">
      <RecordWorkspace
        title="Reminder records"
        rows={data?.reminders || data?.settings?.reminders || []}
        fields={fields}
        readOnly
      />
      <p className="settings-reminders-context">
        {selectedStudentId
          ? `Showing reminders for ${selectedStudentName || "the selected student"}.`
          : "Choose a student to view that student's reminders."}
      </p>
    </div>
  );
}
