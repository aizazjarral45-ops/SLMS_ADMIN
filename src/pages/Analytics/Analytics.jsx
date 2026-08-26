import { useNavigate } from "react-router-dom";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Progress, Row, Space, Tag } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Analytics.css";
function Stat({ title, value, icon, hint }) {
  return (
    <Card className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-title">{title}</div>
      <strong style={{ fontSize: 24 }}>{value}</strong>
      <div className="dashboard-stat-hint">{hint}</div>
    </Card>
  );
}
export default function Analytics({ embedded = false }) {
  const navigate = useNavigate();
  const { data } = useAdminWorkspace();
  const attendanceRows = data.academic?.attendance || [];
  const total = attendanceRows.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0,
  );
  const attended = attendanceRows.reduce(
    (sum, row) => sum + Number(row.attended || 0),
    0,
  );
  const attendance = total ? Math.round((attended / total) * 100) : 0;
  const assignments = data.academic?.assignments || [];
  const completion = assignments.length
    ? Math.round(
        (assignments.filter((row) => row.status === "Completed").length /
          assignments.length) *
          100,
      )
    : 0;
  const rooms = data.admin?.rooms || [];
  const occupancy = rooms.reduce(
    (sum, row) => sum + Number(row.capacity || 0),
    0,
  )
    ? Math.round(
        (rooms.reduce((sum, row) => sum + Number(row.occupied || 0), 0) /
          rooms.reduce((sum, row) => sum + Number(row.capacity || 0), 0)) *
          100,
      )
    : 0;
  const reports = [
    [
      "Student directory",
      `${data.admin?.students?.length || 0} student records`,
      "/students",
      <TeamOutlined />,
    ],
    [
      "Academic activity",
      `${data.academic?.courses?.length || 0} courses`,
      "/academic",
      <BarChartOutlined />,
    ],
    [
      "Hostel operations",
      `${data.hostelApplications?.length || 0} applications`,
      "/hostel",
      <TeamOutlined />,
    ],
    [
      "Expense summary",
      `$${(data.expenses || []).reduce((sum, row) => sum + Number(row.amount || 0), 0).toFixed(2)}`,
      "/expense",
      <BarChartOutlined />,
    ],
  ];
  return (
    <div className={`admin-page analytics-page${embedded ? " analytics-page-embedded" : ""}`}>
      {!embedded && (
        <section className="module-hero">
          <div>
            <Tag className="dashboard-eyebrow">REPORTING</Tag>
            <h1>Analytics</h1>
            <p>A visual operational summary from connected SLMS records.</p>
            <Space wrap>
              <Button type="primary" onClick={() => navigate("/students")}>
                Review student data
              </Button>
              <Button
                className="dashboard-secondary-btn"
                onClick={() => navigate("/")}
              >
                Back to dashboard
              </Button>
            </Space>
          </div>
          <div className="module-hero-panel">
            <div className="module-hero-icon">
              <BarChartOutlined />
            </div>
            <h3>Live indicators</h3>
            <span>Metrics update as module data changes.</span>
            <Button type="link" onClick={() => navigate("/notifications")}>
              Review alerts
            </Button>
          </div>
        </section>
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Stat
            title="Student engagement"
            value={data.admin?.students?.length || 0}
            icon={<TeamOutlined />}
            hint="Directory profiles"
          />
        </Col>
        <Col xs={24} md={8}>
          <Stat
            title="Attendance health"
            value={`${attendance}%`}
            icon={<BarChartOutlined />}
            hint="Shared register"
          />
        </Col>
        <Col xs={24} md={8}>
          <Stat
            title="Resolved cases"
            value={
              (data.complaints || []).filter((row) => row.status === "Resolved")
                .length
            }
            icon={<CheckCircleOutlined />}
            hint="Student support"
          />
        </Col>
      </Row>
      <Card className="admin-panel" title="Operational indicators">
        <div className="analytics-bars">
          {[
            ["Attendance health", attendance],
            ["Assignment completion", completion],
            ["Hostel occupancy", occupancy],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="analytics-label">
                <strong>{label}</strong>
                <span>{value}%</span>
              </div>
              <Progress
                percent={value}
                showInfo={false}
                strokeColor="#1e3a8a"
              />
            </div>
          ))}
        </div>
      </Card>
      <Card className="admin-panel" title="Report index">
        <div className="admin-link-grid">
          {reports.map(([title, copy, route, icon]) => (
            <button key={title} onClick={() => navigate(route)}>
              <span>{icon}</span>
              <div>
                <strong>{title}</strong>
                <small>{copy} · Open module</small>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
