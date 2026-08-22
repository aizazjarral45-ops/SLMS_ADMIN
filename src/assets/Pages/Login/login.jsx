import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Space,
  Typography,
  message,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./login.css";

const { Title, Paragraph, Text } = Typography;

function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = ({ email, password, rememberMe }) => {
    if (!email || !password) return;
    if (rememberMe)
      window.localStorage.setItem("slms_admin_remembered_email", email);
    login({
      email,
      name:
        email === "admin@slms.edu.pk"
          ? "SLMS Administrator"
          : email.split("@")[0].replace(/[._-]/g, " "),
    });
    message.success("Welcome to the SLMS Admin Portal.");
    navigate("/", { replace: true });
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-intro">
        <div className="login-brand">
          <span>S</span>
          <strong>SLMS</strong>
        </div>
        <Text className="login-eyebrow">ADMINISTRATIVE WORKSPACE</Text>
        <Title>Guide every part of the student experience.</Title>

        <div className="login-feature">
          <SafetyCertificateOutlined /> Role-aware administration
        </div>
        <div className="login-feature">
          <SafetyCertificateOutlined /> Live shared SLMS records
        </div>
      </section>
      <Card className="admin-login-card">
        <Text className="login-eyebrow login-card-eyebrow">SECURE SIGN IN</Text>
        <Title level={2}>Welcome back</Title>
        <Paragraph type="secondary">
          Use your administrator credentials to continue.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            email:
              window.localStorage.getItem("slms_admin_remembered_email") ||
              "admin@slms.edu.pk",
            rememberMe: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="Email address"
            rules={[
              {
                required: true,
                type: "email",
                message: "Enter a valid email address.",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              size="large"
              placeholder="admin@slms.edu.pk"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Enter your password." }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="Enter password"
            />
          </Form.Item>
          <Space className="login-options" direction="horizontal">
            <Form.Item name="rememberMe" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot">Forgot password?</Link>
          </Space>
          <Button htmlType="submit" type="primary" size="large" block>
            Sign in to Admin
          </Button>
        </Form>
        <Paragraph className="login-demo-note">
          Use any password to open Admin pannel
        </Paragraph>
      </Card>
    </main>
  );
}

export default Login;
