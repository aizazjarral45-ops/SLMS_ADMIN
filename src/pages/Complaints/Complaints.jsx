import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button, Card, Col, Row, Space, Statistic, Tag } from "antd";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import ComplaintList from "./ComplaintList";
import ComplaintDetails from "./ComplaintDetails";
import ComplaintStatus from "./ComplaintStatus";
import ComplaintResolution from "./ComplaintResolution";
import "../../components/Admin/AdminShared.css";
import "./Complaints.css";
const panels = ["overview", "list", "details", "status", "resolution"];
const normalize = (value) => (panels.includes(value) ? value : "overview");
export default function Complaints() {
  const location = useLocation();
  const { panel: routePanel } = useParams();
  const { data } = useAdminWorkspace();
  const [panel, setPanel] = useState(() =>
    normalize(location.state?.panel || routePanel || "overview"),
  );
  const [selectedId, setSelectedId] = useState(location.state?.id || null);
  useEffect(() => {
    if (location.state?.panel)
      setTimeout(
        () => setPanel(normalize(String(location.state.panel).split("/")[0])),
        0,
      );
    if (location.state?.id)
      setTimeout(() => {
        setSelectedId(location.state.id);
        setPanel("details");
      }, 0);
  }, [location.state?.panel, location.state?.id]);
  const open = (row) => {
    setSelectedId(row.id);
    setPanel("details");
  };
  const openList = () => setPanel("list");
  const pending = (data.complaints || []).filter(
    (row) => !["Resolved", "Closed"].includes(row.status),
  ).length;
  return (
    <div className="admin-page complaints-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">STUDENT SUPPORT</Tag>
          <h1>Complaints</h1>
          <p>
            Track the complaint list, details, status, and resolution in one
            student-linked support workspace.
          </p>
          <Space wrap>
            <Button type="primary" onClick={openList}>
              Manage complaint list
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => setPanel("status")}
            >
              Review statuses
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <WarningOutlined />
          </div>
          <h3>Support queue</h3>
          <span>
            {pending} complaint{pending === 1 ? "" : "s"} require follow-up.
          </span>
          <Button type="link" onClick={() => setPanel("resolution")}>
            Open resolution
          </Button>
        </div>
      </section>
      <nav className="module-tabs" aria-label="Complaint workspaces">
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
      {panel === "overview" && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">
                  <WarningOutlined />
                </div>
                <Statistic title="Open complaints" value={pending} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">
                  <CheckCircleOutlined />
                </div>
                <Statistic
                  title="Resolved"
                  value={
                    (data.complaints || []).filter(
                      (r) => r.status === "Resolved",
                    ).length
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">
                  <WarningOutlined />
                </div>
                <Statistic
                  title="Total cases"
                  value={(data.complaints || []).length}
                />
              </Card>
            </Col>
          </Row>
          <Card className="admin-panel" title="Complaint workflow">
            <p>
              Use the workspaces above to add a case, inspect its details,
              update status, and document resolution.
            </p>
            <Button type="primary" onClick={openList}>
              Open complaint list
            </Button>
          </Card>
        </>
      )}
      {panel === "list" && <ComplaintList onSelect={open} />}
      {panel === "details" && <ComplaintDetails selectedId={selectedId} />}
      {panel === "status" && <ComplaintStatus selectedId={selectedId} />}
      {panel === "resolution" && (
        <ComplaintResolution
          selectedId={selectedId}
          onSaved={() => setPanel("details")}
        />
      )}
    </div>
  );
}
