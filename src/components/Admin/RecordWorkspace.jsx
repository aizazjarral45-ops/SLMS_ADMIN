import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { idOf, makeId, tagColor } from "../../lib/adminWorkspace";
import "./RecordWorkspace.css";

function FieldControl({ field }) {
  if (field.type === "select")
    return (
      <Select
        options={(field.options || []).map((item) =>
          typeof item === "object"
            ? item
            : { value: item, label: String(item) },
        )}
      />
    );
  if (field.type === "number")
    return <InputNumber min={field.min ?? 0} style={{ width: "100%" }} />;
  if (field.type === "textarea") return <Input.TextArea rows={3} />;
  return <Input type={field.type === "date" ? "date" : "text"} />;
}

export default function RecordWorkspace({
  title,
  rows = [],
  fields,
  prefix,
  onSave,
  onDelete,
  onView,
  addText,
  renderValue,
}) {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [messageApi, holder] = message.useMessage();
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return search
      ? rows.filter((row) =>
          Object.values(row).join(" ").toLowerCase().includes(search),
        )
      : rows;
  }, [query, rows]);
  const startCreate = () => {
    form.resetFields();
    setEditing({});
  };
  const save = (values) => {
    const old = editing || {};
    const id = idOf(old) || makeId(prefix);
    onSave({ ...old, ...values, id });
    messageApi.success(idOf(old) ? "Record updated." : "Record created.");
    setEditing(null);
    form.resetFields();
  };
  const columns = [
    ...fields.slice(0, 6).map((field) => ({
      title: field.short || field.label,
      dataIndex: field.name,
      key: field.name,
      ellipsis: true,
      render: (value, row) =>
        renderValue?.(field, value, row) ||
        (field.name === "status" ? (
          <Tag color={tagColor(value)}>{value || "Pending"}</Tag>
        ) : (
          value || "—"
        )),
    })),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: onView ? 178 : 125,
      render: (_, row) => (
        <Space size={0} wrap>
          {onView ? (
            <Button type="link" size="small" onClick={() => onView(row)}>
              View
            </Button>
          ) : null}
          <Button
            type="text"
            size="small"
            aria-label={`Edit ${title}`}
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(row);
              form.setFieldsValue(row);
            }}
          />
          <Popconfirm
            title="Delete this record?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDelete(row);
              messageApi.success("Record deleted.");
            }}
          >
            <Button
              type="text"
              danger
              size="small"
              aria-label={`Delete ${title}`}
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <Card
      className="record-workspace"
      title={title}
      extra={
        <Space wrap className="record-workspace-actions">
          <Input.Search
            allowClear
            placeholder={`Search ${title.toLowerCase()}`}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="primary" onClick={startCreate}>
            {addText || `Add ${title.replace(/s$/, "")}`}
          </Button>
        </Space>
      }
    >
      {holder}
      <Table
        rowKey={idOf}
        columns={columns}
        dataSource={visible}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 6, hideOnSinglePage: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No records yet"
            />
          ),
        }}
      />
      <Modal
        destroyOnClose
        width={560}
        title={`${idOf(editing) ? "Edit" : "Add"} ${title.replace(/s$/, "")}`}
        open={editing !== null}
        onCancel={() => {
          setEditing(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={save}>
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={
                field.required
                  ? [
                      {
                        required: true,
                        message: `Enter ${field.label.toLowerCase()}.`,
                      },
                    ]
                  : []
              }
            >
              <FieldControl field={field} />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </Card>
  );
}
