import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import NotificationList from "./NotificationList";
import NotificationPreferences from "./NotificationPreferences";
import "../../components/Admin/AdminShared.css";
import "./Notifications.css";

export default function Notifications() {
  const location = useLocation();
  const { panel: routePanel } = useParams();
  const [panel, setPanel] = useState(() =>
    (location.state?.panel || routePanel) === "preferences"
      ? "preferences"
      : "list",
  );
  useEffect(() => {
    if (location.state?.panel)
      setTimeout(
        () =>
          setPanel(
            location.state.panel === "preferences" ? "preferences" : "list",
          ),
        0,
      );
  }, [location.state?.panel]);
  return (
    <div className="admin-page notifications-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">NOTIFICATION CENTER</Tag>
          <h1>Notifications</h1>
          <p>
            Review latest student activity, operational updates, alerts, and
            reminders from every Admin module.
          </p>
          <Space wrap>
            <Button type="primary" onClick={() => setPanel("list")}>
              Open notification list
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => setPanel("preferences")}
            >
              Manage preferences
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <BellOutlined />
          </div>
          <h3>Connected alerts</h3>
          <span>New module activity appears here automatically.</span>
          <Button
            type="link"
            onClick={() => setPanel(panel === "list" ? "preferences" : "list")}
          >
            {panel === "list"
              ? "Configure preferences"
              : "Back to notifications"}
          </Button>
        </div>
      </section>
      <nav className="module-tabs" aria-label="Notification workspaces">
        <Button
          type={panel === "list" ? "primary" : "default"}
          onClick={() => setPanel("list")}
        >
          Notification List
        </Button>
        <Button
          type={panel === "preferences" ? "primary" : "default"}
          onClick={() => setPanel("preferences")}
        >
          Preferences
        </Button>
      </nav>
      {panel === "list" ? <NotificationList /> : <NotificationPreferences />}
    </div>
  );
}
