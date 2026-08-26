import {
  AppstoreOutlined,
  BookOutlined,
  HomeOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const navigationItems = [
  { key: "/", icon: <AppstoreOutlined />, label: "Dashboard" },
  { key: "/students", icon: <TeamOutlined />, label: "Students" },
  { key: "/academic", icon: <BookOutlined />, label: "Academic" },
  { key: "/copilot", icon: <RobotOutlined />, label: "AI Copilot" },
  { key: "/hostel", icon: <HomeOutlined />, label: "Hostel" },
  { key: "/expense", icon: <WalletOutlined />, label: "Expense" },
  {
    key: "/complaints",
    icon: <SafetyCertificateOutlined />,
    label: "Complaints",
  },
  { key: "/users", icon: <UserOutlined />, label: "Users" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
  { key: "/settings", icon: <SettingOutlined />, label: "Settings" },
];

function getSelectedKey(pathname) {
  if (pathname.startsWith("/students/")) return "/students";
  if (pathname.startsWith("/complaints/")) return "/complaints";
  if (pathname.startsWith("/settings/")) return "/settings";
  return pathname;
}

function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="sidebar-navigation" aria-label="Main navigation">
      <div className="sidebar-menu-label">MENU</div>
      <Menu
        theme="dark"
        selectedKeys={[getSelectedKey(pathname)]}
        defaultOpenKeys={[
          "academic-menu",
          "copilot-menu",
          "hostel-menu",
          "finance-menu",
          "access-menu",
        ]}
        mode="inline"
        items={navigationItems}
        onClick={({ key }) => {
          if (key.startsWith("/")) {
            const parts = String(key).split("/").filter(Boolean);
            const parent = parts.length ? `/${parts[0]}` : key;
            const child = parts.length > 1 ? parts.slice(1).join("/") : null;
            if (child) navigate(parent, { state: { panel: child } });
            else navigate(parent);
            onNavigate?.();
          }
        }}
      />
    </nav>
  );
}

export default Sidebar;
