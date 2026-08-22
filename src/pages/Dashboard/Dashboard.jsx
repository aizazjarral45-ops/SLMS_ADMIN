import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOutlined,
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  RobotOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { getAdminData } from "../../data/sharedData";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Dashboard.css";
const { Title, Paragraph, Text } = Typography;
function MetricCard({ icon, title, value, hint, color }) {
  return (
    <Card className="dashboard-stat-card">
      <Space align="start" size="middle">
        <div
          className="dashboard-stat-icon"
          style={{ color, background: `${color}18` }}
        >
          {icon}
        </div>
        <div>
          <div className="dashboard-stat-title">{title}</div>
          <div className="dashboard-stat-value">{value}</div>
          <Text className="dashboard-stat-hint">{hint}</Text>
        </div>
      </Space>
    </Card>
  );
}
export default function Dashboard() {
  const { data } = useAdminWorkspace();
  const navigate = useNavigate();
  const admin = getAdminData(data);
  const snapshot = useMemo(() => {
    const attendance = data.academic?.attendance || [];
    const total = attendance.reduce(
      (sum, row) => sum + Number(row.total || 0),
      0,
    );
    const attended = attendance.reduce(
      (sum, row) => sum + Number(row.attended || 0),
      0,
    );
    return {
      pending: (data.complaints || []).filter(
        (row) => !["Resolved", "Closed"].includes(row.status),
      ).length,
      beds: admin.rooms.reduce(
        (sum, row) => sum + Number(row.occupied || 0),
        0,
      ),
      totalBeds: admin.rooms.reduce(
        (sum, row) => sum + Number(row.capacity || 0),
        0,
      ),
      attendance: total ? Math.round((attended / total) * 100) : 0,
      spend: (data.expenses || []).reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0,
      ),
    };
  }, [admin.rooms, data]);
  const activity = useMemo(() => {
    const shared = (data.activity || [])
      .slice(0, 8)
      .map((row) => ({
        title: row.title || "Admin activity",
        detail: row.module || "Updated",
        tag: row.module || "Admin",
        route:
          row.module === "academic"
            ? "/academic"
            : row.module === "hostel"
              ? "/hostel"
              : row.module === "expense"
                ? "/expense"
                : row.module === "complaints"
                  ? "/complaints"
                  : row.module === "students"
                    ? "/students"
                    : row.module === "ai"
                      ? "/copilot"
                      : null,
        createdAt: row.createdAt,
      }));
    const fallback = [
      ...(data.academic?.assignments || [])
        .slice(0, 2)
        .map((row) => ({
          title: row.title || "Assignment",
          detail: row.status || "To do",
          tag: "Academic",
          route: "/academic",
        })),
      ...(data.complaints || [])
        .slice(0, 2)
        .map((row) => ({
          title: row.title || "Complaint",
          detail: row.status || "Submitted",
          tag: "Support",
          route: "/complaints",
        })),
      ...(data.notifications || [])
        .slice(0, 2)
        .map((row) => ({
          title: row.title || "Notification",
          detail: row.type || "Alert",
          tag: "Notifications",
          route: "/notifications",
        })),
      ...(data.expenses || [])
        .slice(0, 2)
        .map((row) => ({
          title: row.title || "Expense update",
          detail: row.status || "Logged",
          tag: "Expense",
          route: "/expense",
        })),
      ...(data.hostelApplications || [])
        .slice(0, 2)
        .map((row) => ({
          title: row.fullName || "Hostel activity",
          detail: row.status || "Submitted",
          tag: "Hostel",
          route: "/hostel",
        })),
      ...(data.academic?.attendance || [])
        .slice(0, 2)
        .map((row) => ({
          title: `${row.course || "Course"} attendance`,
          detail: `${row.attended || 0}/${row.total || 0} classes`,
          tag: "Attendance",
          route: "/academic",
        })),
    ];
    return [...shared, ...fallback].slice(0, 8);
  }, [data]);
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero-card">
        <div>
          <Tag className="dashboard-eyebrow" icon={<CheckCircleOutlined />}>
            ADMIN CONTROL CENTER
          </Tag>
          <Title className="dashboard-title">
            A clear view of your campus operations.
          </Title>
          <Paragraph className="dashboard-subtitle">
            Review connected SLMS activity, keep teams aligned, and resolve the
            next priority before it becomes a blocker.
          </Paragraph>
          <Space wrap>
            <Button
              type="primary"
              className="dashboard-primary-btn"
              onClick={() => navigate("/students")}
            >
              Manage students <ArrowRightOutlined />
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/analytics")}
            >
              View analytics
            </Button>
          </Space>
        </div>
        <div className="dashboard-hero-panel">
          <div className="Dashboard-hero-card-icon">
            <RobotOutlined />
          </div>
          <Title level={3}>AI operational brief</Title>
          <Text type="secondary">
            {data.copilotMessages?.length || 0} live copilot messages are
            available for review.
          </Text>
          <Button type="link" onClick={() => navigate("/copilot")}>
            Open AI Copilot
          </Button>
        </div>
      </section>
      <Row gutter={[16, 16]} className="dashboard-stats-grid">
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            icon={<TeamOutlined />}
            title="Active students"
            value={
              admin.students.filter((row) => row.status === "Active").length
            }
            hint={`${admin.students.length} student profiles`}
            color="#1e3a8a"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            icon={<WarningOutlined />}
            title="Open complaints"
            value={snapshot.pending}
            hint="Require follow-up"
            color="#d97706"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            icon={<HomeOutlined />}
            title="Hostel occupancy"
            value={
              snapshot.totalBeds
                ? `${snapshot.beds}/${snapshot.totalBeds}`
                : "—"
            }
            hint="Allocated beds"
            color="#7c3aed"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            icon={<DollarOutlined />}
            title="Student spending"
            value={`$${snapshot.spend.toFixed(2)}`}
            hint="Connected expense records"
            color="#0f766e"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="dashboard-content-grid">
        <Col xs={24} lg={15}>
          <Card className="dashboard-card" title="Operational pulse">
            <div className="dashboard-panel-section">
              <div className="dashboard-section-heading">
                <Title level={4}>Attendance health</Title>
                <Tag className="dashboard-soft-tag">Academic data</Tag>
              </div>
              <div className="dashboard-progress-meta">
                <Text strong>Recorded attendance</Text>
                <Text type="secondary">{snapshot.attendance}%</Text>
              </div>
              <Progress
                percent={snapshot.attendance}
                strokeColor={{ "0%": "#60a5fa", "100%": "#1e3a8a" }}
                trailColor="#e5edff"
              />
              <Button
                type="link"
                onClick={() =>
                  navigate("/academic", { state: { panel: "attendance" } })
                }
              >
                Open attendance <ArrowRightOutlined />
              </Button>
            </div>
            <div className="dashboard-panel-section">
              <div className="dashboard-section-heading">
                <Title level={4}>Latest activity</Title>
                <Tag className="dashboard-soft-tag">Live updates</Tag>
              </div>
              <List
                dataSource={
                  activity.length
                    ? activity
                    : [
                        {
                          title: "No activity yet",
                          detail: "New module updates will appear here.",
                          tag: "SLMS",
                        },
                      ]
                }
                renderItem={(item) => (
                  <List.Item
                    actions={
                      item.route
                        ? [
                            <Button
                              key="open"
                              type="link"
                              onClick={() => navigate(item.route)}
                            >
                              Open
                            </Button>,
                          ]
                        : []
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.title}</Text>
                          <Tag color="blue">{item.tag}</Tag>
                        </Space>
                      }
                      description={item.detail}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="dashboard-card" title="Quick actions">
            <div className="dashboard-actions">
              {[
                [<BookOutlined />, "Create course", "/academic", "courses"],
                [
                  <HomeOutlined />,
                  "Review hostel applications",
                  "/hostel",
                  "applications",
                ],
                [
                  <DollarOutlined />,
                  "Set monthly budget",
                  "/expense",
                  "budget",
                ],
                [
                  <BellOutlined />,
                  "Open notifications",
                  "/notifications",
                  null,
                ],
              ].map(([icon, label, route, panel]) => (
                <button
                  key={label}
                  className="dashboard-action"
                  onClick={() =>
                    navigate(route, panel ? { state: { panel } } : undefined)
                  }
                >
                  <span>{icon}</span>
                  <strong>{label}</strong>
                  <ArrowRightOutlined />
                </button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="dashboard-card" title="Recent shared records">
        <Row gutter={[16, 16]}>
          {(data.notifications || []).slice(0, 3).map((record) => (
            <Col xs={24} md={8} key={record.id}>
              <div className="dashboard-mini-card">
                <Tag color={record.type === "complaint" ? "orange" : "blue"}>
                  {record.type || "Update"}
                </Tag>
                <Title level={5}>{record.title || "Shared update"}</Title>
                <Paragraph className="dashboard-mini-copy">
                  {record.createdAt
                    ? new Date(record.createdAt).toLocaleString()
                    : "Recent module activity"}
                </Paragraph>
                <Button type="link" onClick={() => navigate("/notifications")}>
                  Review update
                </Button>
              </div>
            </Col>
          ))}
          {!(data.notifications || []).length && (
            <Col span={24}>
              <Text type="secondary">
                No notifications yet. New module activity will appear here.
              </Text>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
}
