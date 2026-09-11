import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Tag } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import StudentSelector from "../../components/Admin/StudentSelector";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Settings.css";
import SettingsOverview from "./SettingsOverview";
import SettingsAnalytics from "./SettingsAnalytics";
import SettingsReminders from "./SettingsReminders";
import SettingsSecurity from "./SettingsSecurity";
import SettingsProfile from "./SettingsProfile";
import SettingsLoginHistory from "./SettingsLoginHistory";

const panels = [
  { key: "overview", label: "Settings Overview" },
  { key: "analytics", label: "Analytics" },
  { key: "reminders", label: "Reminders" },
  { key: "security", label: "Logout" },
  { key: "profile", label: "Student Profile" },
  { key: "login-history", label: "Login History" },
];

const normalizePanel = (value) =>
  panels.some((panel) => panel.key === value) ? value : "overview";

export default function Settings() {
  const navigate = useNavigate();
  const { panel: routePanel } = useParams();
  const { data } = useAdminWorkspace();
  const panel = normalizePanel(routePanel || "overview");

  const handlePanelChange = (nextPanel) => {
    const normalized = normalizePanel(nextPanel);
    navigate(normalized === "overview" ? "/settings" : `/settings/${normalized}`);
  };

  const reminderCount = useMemo(
    () =>
      (data?.settings?.reminders || []).filter(
        (row) => row.done !== "Done" && row.done !== true,
      ).length,
    [data],
  );

  const summary = useMemo(() => {
    const security = data?.settings?.security || {};
    return {
      securityStatus: security.mfaEnabled ? "Protected" : "Review required",
      reminderCount,
    };
  }, [data, reminderCount]);

  const content = (() => {
    switch (panel) {
      case "analytics":
        return <SettingsAnalytics />;
      case "reminders":
        return <SettingsReminders />;
      case "security":
        return <SettingsSecurity />;
      case "login-history":
        return <SettingsLoginHistory />;
      case "profile":
        return <SettingsProfile />;
      case "overview":
      default:
        return <SettingsOverview data={data} onSelectPanel={handlePanelChange} />;
    }
  })();

  return (
    <div className="admin-page settings-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">ADMINISTRATION</Tag>
          <h1>Settings</h1>
          <p>
            Review reminders, security history, profile access, and session
            controls for the selected student from one workspace.
          </p>
          <div className="settings-hero-actions">
            <StudentSelector />
            <Button type="primary" onClick={() => handlePanelChange("overview")}>
              Settings overview
            </Button>
            <Button className="dashboard-secondary-btn" onClick={() => handlePanelChange("security")}>
              Security & history
            </Button>
          </div>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <SettingOutlined />
          </div>
          <h3>Workspace status</h3>
          <span>
            {summary.securityStatus} · Settings workspace active
          </span>
          <Button type="link" onClick={() => handlePanelChange("analytics")}>
            Review analytics
          </Button>
        </div>
      </section>

      <nav className="module-tabs" aria-label="Settings workspaces">
        {panels.map((item) => (
          <Button
            key={item.key}
            type={panel === item.key ? "primary" : "default"}
            onClick={() => handlePanelChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {content}
    </div>
  );
}
