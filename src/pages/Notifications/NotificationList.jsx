import { Button, Card, Empty, List, Popconfirm, Tag } from "antd";
import { BellOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAdminWorkspace, displayDate } from "../../lib/adminWorkspace";
import "./NotificationList.css";
export default function NotificationList() {
  const { data, commit } = useAdminWorkspace();
  const read = data.settings?.readNotificationIds || [];
  const notifications = data.notifications || [];
  const mark = (id, value) =>
    commit((current) => ({
      ...current,
      settings: {
        ...current.settings,
        readNotificationIds: value
          ? [...new Set([...(current.settings.readNotificationIds || []), id])]
          : (current.settings.readNotificationIds || []).filter(
              (item) => item !== id,
            ),
      },
    }));
  const remove = (id) =>
    commit((current) => ({
      ...current,
      notifications: (current.notifications || []).filter(
        (item) => item.id !== id,
      ),
      settings: {
        ...current.settings,
        readNotificationIds: (
          current.settings.readNotificationIds || []
        ).filter((item) => item !== id),
      },
    }));
  return (
    <Card
      className="admin-panel notification-list-feature"
      title="Notification center"
      extra={
        <Button
          onClick={() =>
            commit((current) => ({
              ...current,
              settings: {
                ...current.settings,
                readNotificationIds: (current.notifications || [])
                  .map((item) => item.id)
                  .filter(Boolean),
              },
            }))
          }
        >
          Mark all read
        </Button>
      }
    >
      <List
        dataSource={notifications}
        rowKey={(row) => row.id}
        locale={{ emptyText: <Empty description="No active notifications" /> }}
        renderItem={(row) => {
          const isRead = read.includes(row.id);
          return (
            <List.Item
              className={isRead ? "notification-read" : "notification-unread"}
              actions={[
                <Button
                  key="toggle"
                  type="link"
                  onClick={() => mark(row.id, !isRead)}
                >
                  {isRead ? "Mark unread" : "Mark read"}
                </Button>,
                <Popconfirm
                  key="remove"
                  title="Delete this notification?"
                  onConfirm={() => remove(row.id)}
                >
                  <Button danger type="link" icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="list-icon">
                    <BellOutlined />
                  </div>
                }
                title={
                  <span>
                    {row.title || "Notification"}{" "}
                    <Tag>{row.type || "general"}</Tag>
                    {isRead ? (
                      <Tag>Read</Tag>
                    ) : (
                      <Tag color="processing">New</Tag>
                    )}
                  </span>
                }
                description={`${displayDate(row.createdAt)}${row.refId ? ` · ${row.refId}` : ""}`}
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
}
