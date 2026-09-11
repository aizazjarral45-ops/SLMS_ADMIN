import { Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./SettingsSecurity.css";

export default function SettingsSecurity() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="settings-security">
      <div className="settings-action-cards" aria-label="Logout actions">
        <button
          type="button"
          className="settings-action-card settings-logout-card"
          onClick={() =>
            Modal.confirm({
              title: "Do you want to log out?",
              content: "If you log out, you will need to log in again to access the Admin Panel.",
              okText: "Logout",
              cancelText: "Cancel",
              okButtonProps: { danger: true },
              onOk: handleLogout,
            })
          }
        >
          <span className="settings-action-icon" aria-hidden="true">
            <LogoutOutlined />
          </span>
          <span>
            <strong>Logout</strong>
            <small>End this administrator session securely.</small>
            <small className="settings-logout-note">
              You can safely end the current administrator session here. You
              will need to log in again to return to the Admin Panel.
            </small>
          </span>
        </button>
      </div>
    </div>
  );
}
