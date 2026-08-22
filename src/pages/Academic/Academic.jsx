import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  BarChartOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Progress, Row, Space, Statistic, Tag } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import Courses from "./Courses";
import Assignments from "./Assignments";
import Exams from "./Exams";
import Attendance from "./Attendance";
import ResultsCgpa from "./ResultsCgpa";
import "../../components/Admin/AdminShared.css";
import "./Academic.css";

const panels = [
  "overview",
  "courses",
  "assignments",
  "exams",
  "attendance",
  "results",
];
const goPanel = (value) => (panels.includes(value) ? value : "overview");

function Hero({ panel, setPanel }) {
  return (
    <section className="module-hero academic-hero">
      <div>
        <Tag className="dashboard-eyebrow">ACADEMIC OPERATIONS</Tag>
        <h1>Academic</h1>
        <p>
          Control course offerings, assessment calendars, attendance, and
          outcomes from one connected workspace.
        </p>
        <Space wrap>
          <Button type="primary" onClick={() => setPanel("courses")}>
            Manage academic records
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
          <BookOutlined />
        </div>
        <h3>Operations overview</h3>
        <span>Academic workflows and outcomes are ready for review.</span>
        <Button
          type="link"
          onClick={() =>
            setPanel(panel === "overview" ? "attendance" : "overview")
          }
        >
          {panel === "overview" ? "Open attendance" : "Back to overview"}
        </Button>
      </div>
    </section>
  );
}

function Overview({ data, setPanel }) {
  const academic = data.academic || {};
  const attendance = academic.attendance || [];
  const total = attendance.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0,
  );
  const attended = attendance.reduce(
    (sum, row) => sum + Number(row.attended || 0),
    0,
  );
  const rate = total ? Math.round((attended / total) * 100) : 0;
  const completion = academic.assignments?.length
    ? Math.round(
        (academic.assignments.filter((row) => row.status === "Completed")
          .length /
          academic.assignments.length) *
          100,
      )
    : 0;
  const cards = [
    ["Courses", academic.courses?.length || 0, <BookOutlined />, "courses"],
    [
      "Assignments",
      academic.assignments?.length || 0,
      <FileTextOutlined />,
      "assignments",
    ],
    ["Exams", academic.exams?.length || 0, <CheckCircleOutlined />, "exams"],
    [
      "Current CGPA",
      academic.profile?.cgpa || "—",
      <BarChartOutlined />,
      "results",
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
      <Card className="admin-panel" title="Academic overview">
        <div className="academic-overview-grid">
          <div className="academic-metric">
            <div className="academic-metric-label">Attendance rate</div>
            <div className="academic-metric-value">{rate}%</div>
            <Progress percent={rate} showInfo={false} strokeColor="#1e3a8a" />
            <Button type="link" onClick={() => setPanel("attendance")}>
              Review attendance
            </Button>
          </div>
          <div className="academic-metric">
            <div className="academic-metric-label">Assignment completion</div>
            <div className="academic-metric-value">{completion}%</div>
            <Progress
              percent={completion}
              showInfo={false}
              strokeColor="#1e3a8a"
            />
            <Button type="link" onClick={() => setPanel("assignments")}>
              Review assignments
            </Button>
          </div>
          <div className="academic-metric">
            <div className="academic-metric-label">Academic records</div>
            <div className="academic-metric-value">
              {(academic.courses?.length || 0) +
                (academic.assignments?.length || 0) +
                (academic.exams?.length || 0) +
                (academic.results?.length || 0)}
            </div>
            <Progress
              percent={Math.min(
                100,
                Math.round(
                  (((academic.courses?.length || 0) +
                    (academic.assignments?.length || 0) +
                    (academic.exams?.length || 0)) /
                    20) *
                    100,
                ),
              )}
              showInfo={false}
              strokeColor="#1e3a8a"
            />
            <Button type="link" onClick={() => setPanel("results")}>
              Open outcomes
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function Academic() {
  const location = useLocation();
  const { panel: routePanel } = useParams();
  const { data } = useAdminWorkspace();
  const requested =
    location.state?.panel?.split?.("/")?.[0] ||
    location.state?.panel ||
    routePanel ||
    "overview";
  const [panel, setPanel] = useState(() => goPanel(requested));
  useEffect(() => {
    if (location.state?.panel)
      setTimeout(
        () => setPanel(goPanel(String(location.state.panel).split("/")[0])),
        0,
      );
  }, [location.state?.panel]);
  const content = useMemo(
    () =>
      ({
        overview: <Overview data={data} setPanel={setPanel} />,
        courses: <Courses />,
        assignments: <Assignments />,
        exams: <Exams />,
        attendance: <Attendance />,
        results: <ResultsCgpa />,
      })[panel],
    [data, panel],
  );
  return (
    <div className="admin-page academic-page">
      <Hero panel={panel} setPanel={setPanel} />
      <nav className="module-tabs" aria-label="Academic workspaces">
        {panels.map((item) => (
          <Button
            key={item}
            type={panel === item ? "primary" : "default"}
            onClick={() => setPanel(item)}
          >
            {item === "results"
              ? "Results / CGPA"
              : item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </nav>
      {content}
    </div>
  );
}
