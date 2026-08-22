import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FileTextOutlined,
  HomeOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic, Tag } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import Applications from "./Applications";
import RoomsBeds from "./RoomsBeds";
import Allocations from "./Allocations";
import Fees from "./Fees";
import "../../components/Admin/AdminShared.css";
import "./Hostel.css";

const panels = ["overview", "applications", "rooms", "allocations", "fees"];
const normalize = (value) => (panels.includes(value) ? value : "overview");

function Hero({ panel, setPanel }) {
  return (
    <section className="module-hero hostel-hero">
      <div>
        <Tag className="dashboard-eyebrow">HOSTEL OPERATIONS</Tag>
        <h1>Hostel</h1>
        <p>
          Coordinate applications, room capacity, allocations, and fee status
          with student-linked records.
        </p>
        <Space wrap>
          <Button type="primary" onClick={() => setPanel("applications")}>
            Review applications
          </Button>
          <Button
            className="dashboard-secondary-btn"
            onClick={() => setPanel("overview")}
          >
            View overview
          </Button>
        </Space>
      </div>
      <div className="module-hero-panel">
        <div className="module-hero-icon">
          <HomeOutlined />
        </div>
        <h3>Residence overview</h3>
        <span>Capacity and applications are ready for review.</span>
        <Button
          type="link"
          onClick={() => setPanel(panel === "overview" ? "rooms" : "overview")}
        >
          {panel === "overview" ? "Open rooms" : "Back to overview"}
        </Button>
      </div>
    </section>
  );
}

function Overview({ data, setPanel }) {
  const rooms = data.admin?.rooms || [];
  const allocations = data.admin?.allocations || [];
  const applications = data.hostelApplications || [];
  const fees = data.hostelFees || [];
  const cards = [
    ["Applications", applications.length, <FileTextOutlined />, "applications"],
    [
      "Available rooms",
      rooms.filter((r) => r.status === "Available").length,
      <HomeOutlined />,
      "rooms",
    ],
    ["Allocations", allocations.length, <TeamOutlined />, "allocations"],
    [
      "Paid fees",
      fees.filter((r) => r.status === "Paid").length +
        applications.filter((r) => r.feesStatus === "Paid").length,
      <WalletOutlined />,
      "fees",
    ],
  ];
  return (
    <>
      <Row gutter={[16, 16]}>
        {cards.map(([title, value, icon, target]) => (
          <Col xs={24} sm={12} xl={6} key={title}>
            <button className="stat-link" onClick={() => setPanel(target)}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">{icon}</div>
                <Statistic title={title} value={value} />
                <div className="dashboard-stat-hint">Open workspace</div>
              </Card>
            </button>
          </Col>
        ))}
      </Row>
      <Card className="admin-panel" title="Capacity snapshot">
        <div className="related-grid">
          <div>
            <strong>
              {rooms.reduce((s, r) => s + Number(r.occupied || 0), 0)}
            </strong>
            <div className="dashboard-stat-hint">Occupied beds</div>
          </div>
          <div>
            <strong>
              {rooms.reduce((s, r) => s + Number(r.capacity || 0), 0)}
            </strong>
            <div className="dashboard-stat-hint">Total beds</div>
          </div>
          <div>
            <strong>
              {
                applications.filter(
                  (a) => a.status !== "Approved" && a.status !== "Rejected",
                ).length
              }
            </strong>
            <div className="dashboard-stat-hint">
              Applications awaiting decision
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function Hostel() {
  const location = useLocation();
  const { data } = useAdminWorkspace();
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
        overview: <Overview data={data} setPanel={setPanel} />,
        applications: <Applications />,
        rooms: <RoomsBeds />,
        allocations: <Allocations />,
        fees: <Fees />,
      })[panel],
    [data, panel],
  );
  return (
    <div className="admin-page hostel-page">
      <Hero panel={panel} setPanel={setPanel} />
      <nav className="module-tabs" aria-label="Hostel workspaces">
        {panels.map((item) => (
          <Button
            key={item}
            type={panel === item ? "primary" : "default"}
            onClick={() => setPanel(item)}
          >
            {item === "rooms"
              ? "Rooms / Beds"
              : item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </nav>
      {content}
    </div>
  );
}
