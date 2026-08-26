import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Tag } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Settings.css";
import SettingsOverview from "./SettingsOverview";
import SettingsAnalytics from "./SettingsAnalytics";
import SettingsReminders from "./SettingsReminders";
import SettingsSecurity from "./SettingsSecurity";

const panels = [
  { key: "overview", label: "Settings Overview" },
  { key: "analytics", label: "Analytics" },
  { key: "reminders", label: "Reminders" },
  { key: "security", label: "Security" },
];

const normalizePanel = (value) =>
  panels.some((panel) => panel.key === value) ? value : "overview";

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { panel: routePanel } = useParams();
  const { data } = useAdminWorkspace();
  const [panel, setPanel] = useState(() => normalizePanel(location.state?.panel || routePanel || "overview"));

  useEffect(() => {
    const nextPanel = normalizePanel(location.state?.panel || routePanel || "overview");
    // Avoid synchronous setState during render cycles: defer update only when needed
    if (nextPanel !== panel) setTimeout(() => setPanel(nextPanel), 0);
  }, [location.state?.panel, routePanel, panel]);

  const handlePanelChange = (nextPanel) => {
    const normalized = normalizePanel(nextPanel);
    setPanel(normalized);
    navigate(`/settings/${normalized}`, { replace: false });
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
    const activeModules = [
      !!(data?.settings?.notifications && Object.values(data.settings.notifications).some(Boolean)),
      !!(data?.settings?.security && Object.keys(security).length),
      reminderCount > 0,
    ].filter(Boolean).length;

    return {
      securityStatus: security.mfaEnabled ? "Protected" : "Review required",
      activeModules,
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
            Manage the platform, communication preferences, reporting, and
            security controls from a single workspace.
          </p>
          <div className="settings-hero-actions">
            <Button type="primary" onClick={() => handlePanelChange("overview")}>
              Settings overview
            </Button>
            <Button className="dashboard-secondary-btn" onClick={() => handlePanelChange("security")}>
              Security controls
            </Button>
          </div>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <SettingOutlined />
          </div>
          <h3>Workspace status</h3>
          <span>
            {summary.securityStatus} · {summary.activeModules} modules active
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
