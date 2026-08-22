import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Form,
  Input,
  Row,
  Button,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Profile.css";
const defaultProfile = {
  id: "USR-001",
  name: "SLMS Administrator",
  email: "admin@slms.edu.pk",
  role: "System Administrator",
  status: "Active",
};
export default function Profile() {
  const navigate = useNavigate();
  const { data, commit } = useAdminWorkspace();
  const [form] = Form.useForm();
  const [messageApi, holder] = message.useMessage();
  const profile = useMemo(
    () => ({ ...defaultProfile, ...(data.admin?.users?.[0] || {}) }),
    [data.admin?.users],
  );
  useEffect(() => {
    form.setFieldsValue(profile);
  }, [form, profile]);
  const save = (values) => {
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          users: [
            { ...profile, ...values },
            ...(current.admin.users || []).slice(1),
          ],
        },
      }),
      {
        module: "profile",
        title: "Administrator profile saved",
        notify: false,
      },
    );
    messageApi.success("Profile saved.");
  };
  return (
    <div className="admin-page profile-page">
      {holder}
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">ADMINISTRATION</Tag>
          <h1>Profile</h1>
          <p>
            Manage the primary administrator profile for this independent Admin
            Panel.
          </p>
          <Space wrap>
            <Button type="primary" onClick={() => form.submit()}>
              Save profile
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => navigate("/settings")}
            >
              Open settings
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <UserOutlined />
          </div>
          <h3>{profile.name}</h3>
          <Tag color="blue">{profile.role}</Tag>
          <div className="dashboard-stat-hint">{profile.email}</div>
        </div>
      </section>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card className="admin-panel profile-summary">
            <div className="profile-large-avatar">
              <UserOutlined />
            </div>
            <Typography.Title level={3}>{profile.name}</Typography.Title>
            <Tag color="blue">{profile.role}</Tag>
            <Typography.Paragraph type="secondary">
              {profile.email}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={15}>
          <Card className="admin-panel" title="Profile details">
            <Form form={form} layout="vertical" onFinish={save}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="role" label="Role">
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Save profile
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
