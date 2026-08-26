import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BookOutlined,
  DollarOutlined,
  HomeOutlined,
  NotificationOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Empty, Row, Table, Tag } from "antd";
import { useAdminWorkspace, tagColor } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./StudentDetails.css";

const idOf = (row) => String(row.id || row.key || row.applicationNo || "");
function RelatedTable({
  title,
  icon,
  rows,
  columns,
  empty = "No related records",
}) {
  return (
    <Card
      className="admin-panel student-related-card"
      style={{
        height: 360,
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
      }}
      styles={{ body: { flex: 1, minHeight: 0, overflow: "auto" } }}
      title={
        <span>
          {icon} {title}
        </span>
      }
    >
      <Table
        rowKey={idOf}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        scroll={{ x: 520 }}
        locale={{
          emptyText: (
            <Empty description={empty} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ),
        }}
      />
    </Card>
  );
}
export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useAdminWorkspace();
  const student = (data.admin?.students || []).find(
    (row) => String(row.id) === String(id),
  );
  const related = useMemo(() => {
    const match = (row) => String(row.studentId || row.id) === String(id);
    return {
      courses: (data.academic?.courses || []).filter(match),
      assignments: (data.academic?.assignments || []).filter(match),
      exams: (data.academic?.exams || []).filter(match),
      attendance: (data.academic?.attendance || []).filter(match),
      results: (data.academic?.results || []).filter(match),
      applications: (data.hostelApplications || []).filter(match),
      fees: (data.hostelFees || []).filter(match),
      allocations: (data.admin?.allocations || []).filter(match),
      complaints: (data.complaints || []).filter(match),
      expenses: (data.expenses || []).filter(match),
      notifications: (data.notifications || []).filter(match),
      activity: (data.activity || []).filter(match),
    };
  }, [data, id]);
  if (!student)
    return (
      <div className="admin-page">
        <Card className="admin-panel">
          <Empty description="This student record is no longer available." />
          <Button onClick={() => navigate("/students")}>
            Back to students
          </Button>
        </Card>
      </div>
    );
  const status = student.status || "Active";
  return (
    <div className="admin-page student-details-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">STUDENT RECORD</Tag>
          <h1>{student.name}</h1>
          <p>
            {student.program || "Student"} ·{" "}
            {student.semester || "Semester not set"} · Complete connected SLMS
            record
          </p>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/students")}
          >
            Back to students
          </Button>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <BookOutlined />
          </div>
          <h3>{student.id}</h3>
          <Tag color={tagColor(status)}>{status}</Tag>
          <div className="dashboard-stat-hint">CGPA {student.cgpa ?? "—"}</div>
        </div>
      </section>
      <Card className="admin-panel" title="Student information">
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Student ID">{student.id}</Descriptions.Item>
          <Descriptions.Item label="Name">{student.name}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {student.email || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Program">
            {student.program || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Semester">
            {student.semester || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="CGPA">
            {student.cgpa ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Joined">
            {student.joinedAt || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={tagColor(status)}>{status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <RelatedTable
            title="Courses"
            icon={<BookOutlined />}
            rows={related.courses}
            columns={[
              { title: "Code", dataIndex: "code" },
              { title: "Course", dataIndex: "title" },
              { title: "Credits", dataIndex: "credits" },
            ]}
          />
          <RelatedTable
            title="Assignments"
            icon={<BookOutlined />}
            rows={related.assignments}
            columns={[
              { title: "Title", dataIndex: "title" },
              { title: "Due", dataIndex: "dueDate" },
              {
                title: "Status",
                dataIndex: "status",
                render: (v) => <Tag color={tagColor(v)}>{v || "To do"}</Tag>,
              },
            ]}
          />
          <RelatedTable
            title="Exams"
            icon={<BookOutlined />}
            rows={related.exams}
            columns={[
              { title: "Exam", dataIndex: "title" },
              { title: "Date", dataIndex: "examDate" },
              { title: "Status", dataIndex: "status" },
            ]}
          />
          <RelatedTable
            title="Attendance"
            icon={<BookOutlined />}
            rows={related.attendance}
            columns={[
              { title: "Course", dataIndex: "course" },
              { title: "Attended", dataIndex: "attended" },
              { title: "Total", dataIndex: "total" },
            ]}
          />
          <RelatedTable
            title="Results / CGPA"
            icon={<BookOutlined />}
            rows={related.results}
            columns={[
              { title: "Term", dataIndex: "term" },
              { title: "Course", dataIndex: "course" },
              { title: "GPA", dataIndex: "gpa" },
            ]}
          />
        </Col>
        <Col xs={24} lg={12}>
          <RelatedTable
            title="Hostel applications"
            icon={<HomeOutlined />}
            rows={related.applications}
            columns={[
              {
                title: "Status",
                dataIndex: "status",
                render: (v) => <Tag color={tagColor(v)}>{v}</Tag>,
              },
              { title: "Fees", dataIndex: "feesStatus" },
            ]}
          />
          <RelatedTable
            title="Hostel allocations"
            icon={<HomeOutlined />}
            rows={related.allocations}
            columns={[
              { title: "Room", dataIndex: "roomId" },
              { title: "Term", dataIndex: "term" },
              { title: "Status", dataIndex: "status" },
            ]}
          />
          <RelatedTable
            title="Hostel fees"
            icon={<HomeOutlined />}
            rows={related.fees}
            columns={[
              { title: "Term", dataIndex: "term" },
              { title: "Amount", dataIndex: "amount" },
              { title: "Status", dataIndex: "status" },
            ]}
          />
          <RelatedTable
            title="Complaints"
            icon={<WarningOutlined />}
            rows={related.complaints}
            columns={[
              { title: "Title", dataIndex: "title" },
              {
                title: "Status",
                dataIndex: "status",
                render: (v) => <Tag color={tagColor(v)}>{v}</Tag>,
              },
            ]}
          />
          <RelatedTable
            title="Expenses"
            icon={<DollarOutlined />}
            rows={related.expenses}
            columns={[
              { title: "Title", dataIndex: "title" },
              {
                title: "Amount",
                dataIndex: "amount",
                render: (v) => `$${Number(v || 0).toFixed(2)}`,
              },
              { title: "Status", dataIndex: "status" },
            ]}
          />
        </Col>
      </Row>
      <RelatedTable
        title="Notifications"
        icon={<NotificationOutlined />}
        rows={related.notifications}
        columns={[
          { title: "Title", dataIndex: "title" },
          { title: "Type", dataIndex: "type" },
        ]}
      />
      <RelatedTable
        title="Recent admin activity"
        icon={<NotificationOutlined />}
        rows={related.activity}
        columns={[
          { title: "Activity", dataIndex: "title" },
          { title: "Module", dataIndex: "module" },
          { title: "Date", dataIndex: "createdAt" },
        ]}
      />
    </div>
  );
}
