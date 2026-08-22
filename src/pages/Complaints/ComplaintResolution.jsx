import { useEffect } from "react";
import { Button, Card, Form, Input, Select, Empty } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./ComplaintResolution.css";
export default function ComplaintResolution({ selectedId, onSaved }) {
  const { data, commit } = useAdminWorkspace();
  const [form] = Form.useForm();
  const rows = data.complaints || [];
  const row = rows.find((item) => String(item.id) === String(selectedId));
  useEffect(() => {
    form.setFieldsValue(row || {});
  }, [form, row]);
  if (!row)
    return (
      <Card className="admin-panel complaint-resolution-feature">
        <Empty description="Select a complaint to record its resolution." />
      </Card>
    );
  const save = (values) => {
    commit(
      (current) => ({
        ...current,
        complaints: current.complaints.map((item) =>
          item.id === row.id
            ? { ...item, ...values, updatedAt: new Date().toISOString() }
            : item,
        ),
      }),
      {
        module: "complaints",
        title: `${row.title || "Complaint"} resolution updated`,
        studentId: row.studentId,
        refId: row.id,
        notify: true,
      },
    );
    onSaved?.();
  };
  return (
    <Card
      className="admin-panel complaint-resolution-feature"
      title={`Resolution · ${row.title || "Complaint"}`}
    >
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item name="resolution" label="Resolution notes">
          <Input.TextArea
            rows={4}
            placeholder="Document the action taken and outcome."
          />
        </Form.Item>
        <Form.Item name="status" label="Final status">
          <Select
            options={["Submitted", "In Progress", "Resolved", "Closed"].map(
              (value) => ({ value, label: value }),
            )}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Save resolution
        </Button>
      </Form>
    </Card>
  );
}
