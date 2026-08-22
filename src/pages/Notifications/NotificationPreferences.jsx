import { Card, List, Switch } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./NotificationPreferences.css";
export default function NotificationPreferences() {
  const { data, commit } = useAdminWorkspace();
  const values = data.settings?.notifications || {};
  const fields = [
    ["assignment", "Assignment updates"],
    ["exam", "Exam updates"],
    ["attendance", "Attendance updates"],
    ["expense", "Expense updates"],
    ["complaints", "Complaint updates"],
    ["hostel", "Hostel activity"],
    ["reminder", "Reminders"],
    ["ai", "AI Copilot notes"],
  ];
  const change = (field, value) =>
    commit((current) => ({
      ...current,
      settings: {
        ...current.settings,
        notifications: { ...current.settings.notifications, [field]: value },
      },
    }));
  return (
    <Card
      className="admin-panel notification-preferences-feature"
      title="Notification preferences"
    >
      <List
        dataSource={fields}
        renderItem={([field, label]) => (
          <List.Item
            actions={[
              <Switch
                key={field}
                checked={values[field] !== false}
                onChange={(value) => change(field, value)}
              />,
            ]}
          >
            {label}
          </List.Item>
        )}
      />
    </Card>
  );
}
