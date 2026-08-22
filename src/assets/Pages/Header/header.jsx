import { Avatar, Badge, Button, Space, Typography } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MenuOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./header.css";

const { Text } = Typography;

function Header({ unreadCount = 0, onToggleSidebar, updateData }) {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  // Derive the visible badge value from the prop supplied by App shell
  const [notificationCount, setNotificationCount] = useState(unreadCount || 0);

  useEffect(() => {
    // Defer the state update to avoid synchronous setState within an effect
    setTimeout(() => setNotificationCount(unreadCount || 0), 0);
  }, [unreadCount]);

  const openNotifications = () => {
    // Mark all notifications as read when opening the notification center
    if (updateData) {
      updateData((current) => {
        const ids = (current.notifications || [])
          .map((n) => n.id)
          .filter(Boolean);
        const prev =
          (current.settings && current.settings.readNotificationIds) || [];
        const merged = Array.from(new Set([...(prev || []), ...ids]));
        return {
          ...current,
          settings: {
            ...(current.settings || {}),
            readNotificationIds: merged,
          },
        };
      });
    }
    // navigate after marking read
    navigate("/notifications");
  };
  const initials = (admin?.name || "SLMS Administrator")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <div className="header-brand">
        <Button
          className="header-menu-toggle"
          type="text"
          icon={<MenuOutlined />}
          aria-label="Open navigation menu"
          onClick={onToggleSidebar}
        />
        <button
          className="admin-wordmark"
          onClick={() => navigate("/")}
          aria-label="Open dashboard"
        >
          <span className="admin-wordmark-mark">S</span>
          <span>
            <strong>SLMS</strong>
            <small>ADMIN PORTAL</small>
          </span>
        </button>
      </div>

      <Space className="icons" size="middle">
        <Button
          onClick={() => navigate("/copilot")}
          className="header-icon-button"
          type="text"
          icon={<RobotOutlined />}
          aria-label="Open AI Copilot"
        />
        <Badge
          className="header-notification-badge"
          count={notificationCount}
          overflowCount={99}
          size="small"
        >
          <Button
            className="header-icon-button"
            type="text"
            icon={<BellOutlined />}
            aria-label="Open notifications"
            onClick={openNotifications}
          />
        </Badge>
        <div className="profile-parent">
          <Avatar className="profile-avatar" size={40}>
            {initials}
          </Avatar>
          <div className="header-profile-copy">
            <Text className="student-name">
              {admin?.name || "SLMS Administrator"}
            </Text>
            <Text className="student-dept">
              {admin?.role || "System Administrator"}
            </Text>
          </div>
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="header-icon-button header-settings-button"
            aria-label="Admin settings"
            onClick={() => navigate("/settings")}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            className="header-icon-button header-logout-button"
            aria-label="Log out"
            onClick={handleLogout}
          />
        </div>
      </Space>
    </header>
  );
}

export default Header;
