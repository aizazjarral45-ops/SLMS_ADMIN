import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import UserDirectory from "./UserDirectory";
import Roles from "./Roles";
import "../../components/Admin/AdminShared.css";
import "./Users.css";
export default function Users() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState("users");
  return (
    <div className="admin-page users-page">
      <section className="module-hero">
        <div>
          <Tag className="dashboard-eyebrow">ACCESS MANAGEMENT</Tag>
          <h1>Users</h1>
          <p>
            Manage administrator accounts and role definitions for the Admin
            Panel.
          </p>
          <Space wrap>
            <Button type="primary" onClick={() => setPanel("users")}>
              User directory
            </Button>
            <Button
              className="dashboard-secondary-btn"
              onClick={() => setPanel("roles")}
            >
              Manage roles
            </Button>
          </Space>
        </div>
        <div className="module-hero-panel">
          <div className="module-hero-icon">
            <UserOutlined />
          </div>
          <h3>Access controls</h3>
          <span>Keep user access and role membership up to date.</span>
          <Button type="link" onClick={() => navigate("/settings")}>
            Open settings
          </Button>
        </div>
      </section>
      <nav className="module-tabs" aria-label="User workspaces">
        <Button
          type={panel === "users" ? "primary" : "default"}
          onClick={() => setPanel("users")}
        >
          User directory
        </Button>
        <Button
          type={panel === "roles" ? "primary" : "default"}
          onClick={() => setPanel("roles")}
        >
          Roles
        </Button>
      </nav>
      {panel === "users" ? <UserDirectory /> : <Roles />}
    </div>
  );
}
