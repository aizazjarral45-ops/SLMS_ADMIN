import { Card, List, Switch } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./CopilotSettings.css";
export default function CopilotSettings() {
  const { data, commit } = useAdminWorkspace();
  const settings = data.settings?.aiSettings || {};
  const fields = [
    ["studyPlanner", "Study planner suggestions"],
    ["budgetWarnings", "Budget warnings"],
    ["complaintDrafting", "Complaint drafting assistance"],
  ];
  const change = (field, value) =>
    commit(
      (current) => ({
        ...current,
        settings: {
          ...current.settings,
          aiSettings: { ...current.settings.aiSettings, [field]: value },
        },
      }),
      {
        module: "ai",
        title: `${field} ${value ? "enabled" : "disabled"}`,
        notify: false,
      },
    );
  return (
    <Card
      className="admin-panel copilot-settings-feature"
      title="Assistance controls"
    >
      <List
        dataSource={fields}
        renderItem={([field, label]) => (
          <List.Item
            actions={[
              <Switch
                key={field}
                checked={Boolean(settings[field])}
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
