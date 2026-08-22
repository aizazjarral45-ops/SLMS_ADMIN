import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RobotOutlined } from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import CopilotOverview from "./CopilotOverview";
import CopilotAnalytics from "./CopilotAnalytics";
import CopilotSettings from "./CopilotSettings";
import "../../components/Admin/AdminShared.css";
import "./AICopilot.css";
const panels = ["overview", "analytics", "settings"];
const normalize = (value) => (panels.includes(value) ? value : "overview");
export default function AICopilot() {
  const location = useLocation();
  const { panel: routePanel } = useParams();
  const requested =
    location.state?.panel?.split?.("/")?.[0] ||
    location.state?.panel ||
    routePanel ||
    "overview";
  const [panel, setPanel] = useState(() => normalize(requested));
  useEffect(() => {
    if (location.state?.panel)
      setTimeout(
        () => setPanel(normalize(String(location.state.panel).split("/")[0])),
        0,
      );
  }, [location.state?.panel]);
  const content = useMemo(
    () =>
      ({
        overview: <CopilotOverview />,
        analytics: <CopilotAnalytics />,
        settings: <CopilotSettings />,
      })[panel],
    [panel],
  );
  return (
    <div className="admin-page aicopilot-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">AI COPILOT</Tag>
          <h1>AI Copilot</h1>
          <p>
            Monitor assistant activity, create operational notes, and control
            connected assistance features.
          </p>
          <Space wrap>
            <Button type="primary" onClick={() => setPanel("overview")}>
              Open message log
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => setPanel("settings")}
            >
              Manage settings
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <RobotOutlined />
          </div>
          <h3>Connected assistant</h3>
          <span>Local notes and controls are ready for review.</span>
          <Button
            type="link"
            onClick={() =>
              setPanel(panel === "analytics" ? "overview" : "analytics")
            }
          >
            {panel === "analytics" ? "Open message log" : "View analytics"}
          </Button>
        </div>
      </section>
      <nav className="module-tabs" aria-label="AI Copilot workspaces">
        {panels.map((item) => (
          <Button
            key={item}
            type={panel === item ? "primary" : "default"}
            onClick={() => setPanel(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </nav>
      {content}
    </div>
  );
}
