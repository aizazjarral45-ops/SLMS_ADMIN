import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./SettingsSecurity.css";

const defaultSecurity = {
  mfaEnabled: true,
  sessionTimeoutMinutes: 30,
  passwordRotationDays: 90,
  loginAlerts: true,
  auditLogging: true,
  suspiciousActivityBlocking: true,
  passwordPolicy: "High",
};

export default function SettingsSecurity() {
  const { data, commit } = useAdminWorkspace();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const security = useMemo(
    () => ({ ...defaultSecurity, ...(data?.settings?.security || {}) }),
    [data],
  );

  useEffect(() => {
    form.setFieldsValue(security);
  }, [form, security]);

  const saveSecurity = (values) => {
    commit(
      (current) => ({
        ...current,
        settings: {
          ...current.settings,
          security: { ...defaultSecurity, ...(current.settings?.security || {}), ...values },
        },
      }),
      {
        module: "security",
        title: "Security settings updated",
        notify: false,
      },
    );
  };

  const resetSecurity = () => {
    form.setFieldsValue(defaultSecurity);
    saveSecurity(defaultSecurity);
  };

  return (
    <div className="settings-security">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="admin-panel settings-security-status">
            <div className="settings-summary-icon security-status-icon">
              <SafetyCertificateOutlined />
            </div>
            <Tag className="dashboard-eyebrow settings-card-tag">ACTIVE</Tag>
            <h3>Protection layer</h3>
            <p>
              {security.mfaEnabled ? "Multi-factor authentication is active." : "MFA is disabled."}
            </p>
            <ul>
              <li>{security.loginAlerts ? "Login alerts enabled" : "Login alerts off"}</li>
              <li>{security.auditLogging ? "Audit logs recording" : "Audit history paused"}</li>
              <li>{security.suspiciousActivityBlocking ? "Suspicious activity blocking" : "Manual review required"}</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card className="admin-panel" title="Security controls">
            <Form form={form} layout="vertical" onFinish={saveSecurity}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="passwordPolicy" label="Password policy">
                    <Select
                      options={[
                        { value: "Standard", label: "Standard" },
                        { value: "High", label: "High" },
                        { value: "Strict", label: "Strict" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="sessionTimeoutMinutes" label="Session timeout (minutes)">
                    <InputNumber min={5} max={240} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="passwordRotationDays" label="Password rotation (days)">
                    <InputNumber min={30} max={365} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="mfaEnabled" label="Multi-factor authentication" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="loginAlerts" label="Login alerts" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="auditLogging" label="Audit logging" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="suspiciousActivityBlocking" label="Suspicious activity blocking" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Space wrap>
                <Button type="primary" icon={<LockOutlined />} htmlType="submit">
                  Save changes
                </Button>
                <Button onClick={resetSecurity}>Reset to defaults</Button>
                <Button className="dashboard-secondary-btn" onClick={() => navigate("/notifications")}>
                  View alerts
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
