import Reminders from "../Reminders/Reminders";
import "./SettingsReminders.css";

export default function SettingsReminders() {
  return (
    <div className="settings-reminders">
      <Reminders embedded />
    </div>
  );
}
