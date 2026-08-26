import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ConfigProvider,
  Drawer,
  Layout,
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
} from "antd";
import { CloseOutlined, LockOutlined } from "@ant-design/icons";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  SHARED_DATA_STORAGE_KEY,
  loadSharedData,
  persistSharedData,
} from "./data/sharedData";
import Header from "./assets/Pages/Header/header";
import Sidebar from "./assets/Pages/sidebar/sidebar";
import Login from "./assets/Pages/Login/login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import StudentDetails from "./pages/StudentDetails/StudentDetails";
import Academic from "./pages/Academic/Academic";
import AICopilot from "./pages/AICopilot/AICopilot";
import Hostel from "./pages/Hostel/Hostel";
import Expense from "./pages/Expense/Expense";
import Complaints from "./pages/Complaints/Complaints";
import Notifications from "./pages/Notifications/Notifications";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound";

const { Title, Paragraph } = Typography;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function ForgotPage() {
  const navigate = useNavigate();
  const [messageApi, holder] = message.useMessage();
  return (
    <main className="forgot-page">
      {holder}
      <Card className="forgot-card">
        <Title level={2}>Reset administrator password</Title>
        <Paragraph type="secondary">
          Enter your administrator email and we will prepare a secure reset
          link.
        </Paragraph>
        <Form
          layout="vertical"
          onFinish={() => {
            messageApi.success(
              "Reset request recorded for this local preview.",
            );
            navigate("/login");
          }}
        >
          <Form.Item
            name="email"
            label="Email address"
            rules={[{ required: true, type: "email" }]}
          >
            <Input prefix={<LockOutlined />} />
          </Form.Item>
          <Button htmlType="submit" type="primary" block>
            Send reset link
          </Button>
        </Form>
      </Card>
    </main>
  );
}

function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [data, setData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load shared data on mount (kept synchronous but wrapped to allow a loading UI)
  useEffect(() => {
    try {
      const loaded = loadSharedData();
      // Defer setState to avoid synchronous state updates within the effect
      setTimeout(() => setData(loaded), 0);
    } catch (e) {
      // Fall back to empty normalized data
      setTimeout(() => setData(loadSharedData()), 0);
      console.error("Failed to load shared data:", e);
    } finally {
      // Defer removal of loading to ensure a smooth transition
      setTimeout(() => setInitialLoading(false), 120);
    }
  }, []);

  const updateData = useCallback((nextValue) => {
    setData((current) => {
      const nextRaw =
        typeof nextValue === "function" ? nextValue(current) : nextValue;
      // Persist the candidate next state to normalize it first
      let next = persistSharedData(nextRaw);

      // Helper to create a notification entry
      const makeId = () => `N-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const pushNotification = (title, type, refId) => ({ id: makeId(), title: String(title || type || "Notification"), type: type || "general", refId: refId || null, createdAt: new Date().toISOString() });

      const addedNotifications = [];

      // Detect added reminders
      const prevReminders = current?.settings?.reminders || [];
      const nextReminders = next?.settings?.reminders || [];
      if (nextReminders.length > prevReminders.length) {
        nextReminders.forEach((r) => {
          const exists = prevReminders.some((p) => p.id && r.id && p.id === r.id);
          if (!exists) addedNotifications.push(pushNotification(r.title || "Reminder", "reminder", r.id || null));
        });
      }

      // Detect added complaints
      const prevComplaints = current?.complaints || [];
      const nextComplaints = next?.complaints || [];
      if (nextComplaints.length > prevComplaints.length) {
        nextComplaints.forEach((c) => {
          const exists = prevComplaints.some((p) => p.id && c.id && p.id === c.id);
          if (!exists) addedNotifications.push(pushNotification(c.title || "Complaint", "complaint", c.id || null));
        });
      }

      // Detect added expenses
      const prevExpenses = current?.expenses || [];
      const nextExpenses = next?.expenses || [];
      if (nextExpenses.length > prevExpenses.length) {
        nextExpenses.forEach((e) => {
          const exists = prevExpenses.some((p) => String(p.key || p.id || "") === String(e.key || e.id || ""));
          if (!exists) addedNotifications.push(pushNotification(e.title || "Expense", "expense", e.key || null));
        });
      }

      // Detect copilot messages
      const prevCopilot = current?.copilotMessages || [];
      const nextCopilot = next?.copilotMessages || [];
      if (nextCopilot.length > prevCopilot.length) {
        nextCopilot.forEach((m) => {
          const exists = prevCopilot.some((p) => (p.id && m.id && p.id === m.id));
          if (!exists) addedNotifications.push(pushNotification(m.title || m.message || "Copilot", "ai", m.id || null));
        });
      }

      if (addedNotifications.length) {
        next = persistSharedData({ ...next, notifications: [...(next.notifications || []), ...addedNotifications] });
        // Dispatch a lightweight event for any other listeners (backwards compatibility)
        try {
          window.dispatchEvent(new CustomEvent("slms-notification-created", { detail: { count: addedNotifications.length } }));
        } catch (e) {
          // Ignore errors when dispatching the event in restricted environments
          // Log at debug level to aid local troubleshooting if needed
          console.debug("slms notification dispatch failed", e);
        }
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      setIsMobile(mobile);
      setCollapsed(tablet);
      if (!mobile) setMobileOpen(false);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const sync = (event) => {
      if (event.key === SHARED_DATA_STORAGE_KEY && event.newValue)
        setData(loadSharedData());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  
  useEffect(() => {
    if (!data) return;
    if ((data.notifications || []).length) return;
    const derived = [];
    (data.settings?.reminders || []).forEach((r) => derived.push({ id: `init-rem-${r.id || Math.random().toString(36).slice(2,8)}`, title: r.title || 'Reminder', type: 'reminder', refId: r.id || null, createdAt: r.when || new Date().toISOString() }));
    (data.complaints || []).filter(c=> c.status !== 'Resolved').forEach((c) => derived.push({ id: `init-comp-${c.id || Math.random().toString(36).slice(2,8)}`, title: c.title || 'Complaint', type: 'complaint', refId: c.id || null, createdAt: c.createdAt || new Date().toISOString() }));
    if (derived.length) {
      // Defer the update to avoid synchronous setState inside the effect
      // which can trigger cascading renders in some React setups.
      setTimeout(() => {
        updateData((current) => ({ ...current, notifications: [...(current.notifications || []), ...derived] }));
      }, 0);
    }
  }, [data, updateData]);

  const unreadCount = useMemo(() => {
    const notifications = data?.notifications || [];
    const readIds = data?.settings?.readNotificationIds || [];
    return notifications.filter((n) => !readIds.includes(n.id)).length;
  }, [data]);

  if (initialLoading || !data) {
    // Global initial loading screen (keeps Dashboard design language)
    return (
      <div className="app-shell loading-shell">
        <div className="loading-center">
          <div style={{ textAlign: "center" }}>
            <img
              src="/Sitelogo.png"
              alt="SLMS"
              style={{ width: 96, height: 96, marginBottom: 16 }}
            />
            <h2 style={{ margin: 0, color: "#1e3a8a" }}>SLMS Admin</h2>
            <p style={{ color: "#6b7280" }}>Preparing admin workspace…</p>
            <div style={{ marginTop: 16 }}>
              <span className="ant-spin">
                <span className="ant-spin-dot ant-spin-dot-spin">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={"app-shell " + (mobileOpen ? "mobile-navigation-open" : "")}
    >
      <Header
        unreadCount={unreadCount}
        onToggleSidebar={() => setMobileOpen(true)}
        updateData={updateData}
      />
      <Layout className="app-body">
        {!isMobile ? (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={100}
            theme="dark"
            className="app-sidebar app-desktop-sidebar"
          >
            <Sidebar />
          </Sider>
        ) : null}
        <Content className="app-content">
          <Outlet context={{ data, updateData }} />
        </Content>
      </Layout>
      <Drawer
        className="mobile-sidebar-drawer"
        rootClassName="mobile-sidebar-drawer-root"
        title="Navigation"
        placement="left"
        width={100}
        closable
        closeIcon={<CloseOutlined />}
        open={isMobile && mobileOpen}
        onClose={() => setMobileOpen(false)}
        styles={{
          header: { background: "#1e3a8a", color: "#fff" },
          body: { padding: 0, background: "#1e3a8a" },
        }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route index element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/academic/:panel" element={<Academic />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="/copilot/:panel" element={<AICopilot />} />
          <Route path="/hostel" element={<Hostel />} />
          <Route path="/hostel/:panel" element={<Hostel />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/expense/:panel" element={<Expense />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/:panel" element={<Complaints />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/:panel" element={<Notifications />} />
          <Route path="/reminders" element={<Navigate to="/settings/reminders" replace />} />
          <Route path="/analytics" element={<Navigate to="/settings/analytics" replace />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/:panel" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1e3a8a",
          borderRadius: 10,
          fontFamily: "Arial, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
