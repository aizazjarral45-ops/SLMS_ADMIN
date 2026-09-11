import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Spin,
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
  createDefaultSharedData,
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
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound";
import { adminRequest, isAdminApiConfigured } from "./api/client";
import SessionExpiryHandler from "./components/SessionExpiryHandler";

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
          onFinish={async ({ email }) => {
            try {
              await adminRequest("/auth/password-reset/request", {
                method: "POST",
                body: { email },
              });
              messageApi.success("If the account exists, a reset code has been sent.");
              navigate("/login");
            } catch (error) {
              messageApi.error(error.message || "Unable to request password reset.");
            }
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
  const [selectedStudentId, setSelectedStudentId] = useState(
    () => window.sessionStorage.getItem("slms-selected-student-id") || "",
  );
  const [selectedStudentName, setSelectedStudentName] = useState(
    () => window.sessionStorage.getItem("slms-selected-student-name") || "",
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(isAdminApiConfigured);
  const [workspaceError, setWorkspaceError] = useState("");
  const selectionRequestRef = useRef(0);
  const restoredSelectionRef = useRef(false);

  // Load shared data on mount (kept synchronous but wrapped to allow a loading UI)
  useEffect(() => {
    try {
      const loaded = isAdminApiConfigured
        ? createDefaultSharedData()
        : loadSharedData();
      // Defer setState to avoid synchronous state updates within the effect
      setTimeout(() => setData(loaded), 0);
    } catch (e) {
      // Fall back to empty normalized data
      setTimeout(() => setData(loadSharedData()), 0);
      console.error("Failed to load shared data:", e);
    } finally {
      setTimeout(() => setInitialLoading(false), 120);
    }
  }, []);

  const { isAuthenticated } = useAuth();
  const [globalLoading, setGlobalLoading] = useState(false);

  const updateData = useCallback((nextValue) => {
    setGlobalLoading(true);
    setData((current) => {
      const nextRaw =
        typeof nextValue === "function" ? nextValue(current) : nextValue;
      let next = isAdminApiConfigured ? nextRaw : persistSharedData(nextRaw);

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
      }

      return next;
    });

    setTimeout(() => setGlobalLoading(false), 180);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    Promise.allSettled([
      adminRequest("/admin/workspace"),
      adminRequest("/complaints"),
      adminRequest("/expenses"),
      adminRequest("/hostel"),
      adminRequest("/notifications"),
      adminRequest("/assignments"),
      adminRequest("/settings/admin"),
    ]).then((results) => {
      if (cancelled) return;
      const [
        workspace,
        complaints,
        expenses,
        hostel,
        notifications,
        assignments,
        adminSettings,
      ] = results;
      const workspaceData =
        workspace.status === "fulfilled" ? workspace.value : null;
      updateData((current) => ({
        ...current,
        ...(workspaceData || {}),
        complaints:
          complaints.status === "fulfilled"
            ? complaints.value.complaints || current.complaints
            : current.complaints,
        expenses:
          expenses.status === "fulfilled"
            ? expenses.value.expenses || current.expenses
            : current.expenses,
        hostelApplications:
          workspaceData?.hostelApplications ||
          (hostel.status === "fulfilled"
            ? hostel.value.records || current.hostelApplications
            : current.hostelApplications),
        notifications:
          notifications.status === "fulfilled"
            ? notifications.value.notifications || current.notifications
            : current.notifications,
        academic: {
          ...current.academic,
          assignments:
            assignments.status === "fulfilled"
              ? assignments.value.assignments ||
                assignments.value.data?.assignments ||
                assignments.value.records ||
                current.academic?.assignments ||
                []
              : current.academic?.assignments || [],
        },
        settings:
          adminSettings.status === "fulfilled"
            ? {
                ...current.settings,
                ...(adminSettings.value.settings || {}),
              }
            : current.settings,
        account:
          adminSettings.status === "fulfilled"
            ? adminSettings.value.account || current.account
            : current.account,
      }));
    }).finally(() => {
      if (!cancelled) setWorkspaceLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, updateData]);

  const selectStudent = useCallback(async (studentId, studentName = "") => {
    const requestId = selectionRequestRef.current + 1;
    selectionRequestRef.current = requestId;
    const nextId = String(studentId || "");
    const nextName = nextId ? String(studentName || "Student") : "All Students";
    setSelectedStudentId(nextId);
    setSelectedStudentName(nextName);
    window.sessionStorage.setItem("slms-selected-student-id", nextId);
    window.sessionStorage.setItem("slms-selected-student-name", nextName);
    setWorkspaceError("");
    setWorkspaceLoading(true);
    if (requestId !== selectionRequestRef.current) return;
    setData((current) => ({
      ...createDefaultSharedData(),
      admin: { ...(current?.admin || {}), students: current?.admin?.students || [] },
    }));
    try {
      const result = nextId
        ? await adminRequest(`/admin/students/${encodeURIComponent(nextId)}`)
        : await adminRequest("/admin/workspace");
      const scoped = nextId ? result.workspace : result;
      if (nextId && result.student?.name) {
        setSelectedStudentName(result.student.name);
        window.sessionStorage.setItem("slms-selected-student-name", result.student.name);
      }
      setData((current) => ({
        ...current,
        ...scoped,
        admin: {
          ...(scoped.admin || {}),
          students: current?.admin?.students || scoped.admin?.students || [],
        },
      }));
    } catch (error) {
      if (requestId === selectionRequestRef.current) {
        setWorkspaceError(error.message || "Unable to load student data.");
      }
    } finally {
      if (requestId === selectionRequestRef.current) setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      !isAuthenticated ||
      workspaceLoading ||
      !selectedStudentId ||
      restoredSelectionRef.current
    ) return;
    restoredSelectionRef.current = true;
    selectStudent(selectedStudentId, selectedStudentName);
  }, [
    isAuthenticated,
    workspaceLoading,
    selectedStudentId,
    selectedStudentName,
    selectStudent,
  ]);

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

  if (initialLoading || workspaceLoading || !data || globalLoading) {

    return (
      <div className="app-shell loading-shell">
        <div className="loading-center">
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#1e3a8a" }}>SLMS Admin</h1>
            <p style={{ color: "#6b7280" }}>
              {workspaceLoading && data ? "Loading Student Data..." : "Preparing admin workspace…"}
            </p>
            <div style={{ marginTop: 16 }}>
              <Spin size="large" />
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
            width={200}
            theme="dark"
            className="app-sidebar app-desktop-sidebar"
          >
            <Sidebar />
          </Sider>
        ) : null}
        <Content className="app-content">
          <Outlet context={{
            data,
            updateData,
            selectedStudentId,
            selectedStudentName,
            setSelectedStudentId,
            selectStudent,
            workspaceError,
            studentSelectionLoading: workspaceLoading,
          }} />
        </Content>
      </Layout>
      <Drawer
        className="mobile-sidebar-drawer"
        rootClassName="mobile-sidebar-drawer-root"
        title="Navigation"
        placement="left"
        width={200}
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
          <SessionExpiryHandler />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
