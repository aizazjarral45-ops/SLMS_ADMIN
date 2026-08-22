import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Form, Row, Space, Switch, Tag } from "antd";
import { SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Settings.css";
export default function Settings() {
  const navigate = useNavigate();
  const { data, commit } = useAdminWorkspace();
  const [form] = Form.useForm();
  const preferences = data.admin?.preferences;
  useEffect(() => {
    form.setFieldsValue(preferences || {});
  }, [form, preferences]);
  return (
    <div className="admin-page settings-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">ADMINISTRATION</Tag>
          <h1>Settings</h1>
          <p>Tune administrative workspace preferences and data behavior.</p>
          <Space wrap>
            <Button type="primary" onClick={() => form.submit()}>
              Save preferences
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() =>
                navigate("/notifications", { state: { panel: "preferences" } })
              }
            >
              Notification preferences
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <SettingOutlined />
          </div>
          <h3>Workspace configuration</h3>
          <span>Preferences persist in the Admin local workspace.</span>
          <Button type="link" onClick={() => navigate("/")}>
            Back to dashboard
          </Button>
        </div>
      </section>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="admin-panel" title="Workspace preferences">
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) =>
                commit(
                  (current) => ({
                    ...current,
                    admin: {
                      ...current.admin,
                      preferences: { ...current.admin.preferences, ...values },
                    },
                  }),
                  {
                    module: "settings",
                    title: "Workspace preferences saved",
                    notify: false,
                  },
                )
              }
            >
              <Form.Item
                name="compactTables"
                label="Compact table density"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="weeklyDigest"
                label="Weekly operational digest"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="autoAssignComplaints"
                label="Auto-assign new complaints"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                Save settings
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="admin-panel" title="Data connection">
            <Alert
              showIcon
              type="info"
              message="Shared SLMS data is active"
              description="All Admin modules use the shared local workspace and unique module keys, ready for a later API connection."
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
