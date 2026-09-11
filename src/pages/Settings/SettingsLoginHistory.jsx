import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Empty, List, Spin, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { adminRequest } from "../../api/client";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./SettingsLoginHistory.css";

const loginHistoryCache = new Map();

export default function SettingsLoginHistory() {
  const { selectedStudentId, selectedStudentName, selectedStudent } =
    useAdminWorkspace();
  const [messageApi, holder] = message.useMessage();
  const [loginHistory, setLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const requestedStudentRef = useRef(null);

  const loadLoginHistory = useCallback(
    async (force = false) => {
      if (!selectedStudentId) {
        setLoginHistory([]);
        return;
      }
      if (!force && loginHistoryCache.has(selectedStudentId)) {
        setLoginHistory(loginHistoryCache.get(selectedStudentId));
        return;
      }
      setHistoryLoading(true);
      try {
        const result = await adminRequest(
          `/admin/students/${encodeURIComponent(selectedStudentId)}/login-history`,
        );
        const history = result.history || [];
        loginHistoryCache.set(selectedStudentId, history);
        setLoginHistory(history);
      } catch (error) {
        setLoginHistory([]);
        messageApi.error(error.message || "Unable to load student login history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [messageApi, selectedStudentId],
  );

  useEffect(() => {
    if (requestedStudentRef.current === selectedStudentId) return;
    requestedStudentRef.current = selectedStudentId;
    queueMicrotask(() => void loadLoginHistory());
  }, [loadLoginHistory, selectedStudentId]);

  return (
    <div className="settings-login-history">
      {holder}
      <Card className="admin-panel settings-login-history-card">
        <div className="settings-login-history-heading">
          <div>
            <Typography.Title level={3}>Login History</Typography.Title>
            <Typography.Paragraph type="secondary">
              {selectedStudentId
                ? `Login and security history for ${selectedStudent?.name || selectedStudentName}.`
                : "Choose a student to view login and security history."}
            </Typography.Paragraph>
          </div>
          <div className="settings-login-history-actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadLoginHistory(true)}
              loading={historyLoading}
              disabled={!selectedStudentId || historyLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Spin spinning={historyLoading} description="Loading login history...">
          {!historyLoading && loginHistory.length ? (
            <List
              dataSource={loginHistory}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.eventType || item.status} — ${new Date(item.createdAt).toLocaleString()}`}
                    description={item.userAgent || item.ipAddress || ""}
                  />
                </List.Item>
              )}
            />
          ) : !historyLoading && selectedStudentId ? (
            <Empty description="No login activity found" />
          ) : !historyLoading ? (
            <Empty description="Choose a student to view login history" />
          ) : null}
        </Spin>
      </Card>
    </div>
  );
}
