import { useNavigate } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import RecordWorkspace from "../../components/Admin/RecordWorkspace";
import {
  deleteRecord,
  makeId,
  saveRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "../../components/Admin/AdminShared.css";
import "./Reminders.css";
export default function Reminders({ embedded = false }) {
  const navigate = useNavigate();
  const { data, commit } = useAdminWorkspace();
  const fields = [
    { name: "title", label: "Reminder title", required: true },
    { name: "type", label: "Type" },
    { name: "when", label: "When", type: "date" },
    {
      name: "done",
      label: "Status",
      type: "select",
      options: ["Pending", "Done"],
    },
  ];
  const save = (row) =>
    commit(
      (current) => ({
        ...current,
        settings: {
          ...current.settings,
          reminders: saveRecord(current.settings.reminders, {
            ...row,
            id: row.id || makeId("REM"),
          }),
        },
      }),
      {
        module: "reminder",
        title: `${row.title || "Reminder"} updated`,
        refId: row.id,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        settings: {
          ...current.settings,
          reminders: deleteRecord(current.settings.reminders, row),
        },
      }),
      {
        module: "reminder",
        title: `${row.title || "Reminder"} removed`,
        refId: row.id,
      },
    );
  return (
    <div className={`admin-page reminders-page${embedded ? " reminders-page-embedded" : ""}`}>
      {!embedded && (
        <section className="module-hero">
          <div>
            <Tag className="dashboard-eyebrow">COMMUNICATIONS</Tag>
            <h1>Reminders</h1>
            <p>
              Maintain deadlines and operational follow-ups in the shared
              notification workspace.
            </p>
            <Space wrap>
              <Button
                type="primary"
                onClick={() =>
                  document
                    .querySelector(".record-workspace .ant-btn-primary")
                    ?.click()
                }
              >
                Add reminder
              </Button>
              <Button
                className="dashboard-secondary-btn"
                onClick={() => navigate("/notifications")}
              >
                Open notifications
              </Button>
            </Space>
          </div>
          <div className="module-hero-panel">
            <div className="module-hero-icon">
              <CheckCircleOutlined />
            </div>
            <h3>Upcoming follow-ups</h3>
            <span>
              {
                (data.settings?.reminders || []).filter(
                  (row) => row.done !== "Done" && row.done !== true,
                ).length
              }{" "}
              reminders need attention.
            </span>
            <Button type="link" onClick={() => navigate("/")}>
              Back to dashboard
            </Button>
          </div>
        </section>
      )}
      <RecordWorkspace
        title="Reminder records"
        rows={data.settings?.reminders || []}
        fields={fields}
        prefix="REM"
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}
