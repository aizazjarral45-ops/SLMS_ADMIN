import React, { useMemo, useState, useImperativeHandle } from "react";
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

import { useCallback } from "react";

function FieldControl({ field, value, onChange }) {
  const handleValue = (nextValue) => onChange?.(nextValue);

  if (field.type === "select")
    return (
      <Select
        value={value ?? undefined}
        onChange={handleValue}
        options={(field.options || []).map((item) =>
          typeof item === "object"
            ? item
            : { value: item, label: String(item) },
        )}
      />
    );
  if (field.type === "number")
    return (
      <InputNumber
        min={field.min ?? 0}
        style={{ width: "100%" }}
        value={value ?? undefined}
        onChange={handleValue}
      />
    );
  if (field.type === "textarea")
    return (
      <Input.TextArea
        rows={3}
        value={value ?? ""}
        onChange={(event) => handleValue(event.target.value)}
      />
    );
  return (
    <Input
      type={field.type === "date" ? "date" : "text"}
      value={value ?? ""}
      onChange={(event) => handleValue(event.target.value)}
    />
  );
}

const RecordWorkspace = React.forwardRef(function RecordWorkspace({
  title,
  rows = [],
  fields,
  prefix,
  onSave,
  onDelete,
  onView,
  addText,
  renderValue,
  additionalRowActions,
}, ref) {
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
  const resetForm = useCallback(() => {
    setTimeout(() => {
      try {
        form.resetFields();
      } catch {
        // Ignore reset before the modal is mounted.
      }
    }, 0);
  }, [form]);

  const startCreate = useCallback(() => {
    setEditing({});
    resetForm();
  }, [resetForm]);

  // Expose a programmatic handle so parent pages can open the create modal
  useImperativeHandle(ref, () => ({
    openCreate: startCreate,
  }), [startCreate]);

  // Display value helper (row parameter removed because it's unused)

  const save = (values) => {
    const old = editing || {};
    const id = idOf(old) || makeId(prefix);
    onSave({ ...old, ...values, id });
    messageApi.success(idOf(old) ? "Record updated." : "Record created.");
    setEditing(null);
    resetForm();
  };
  const displayValue = (field, value) => {
    const empty = value === null || value === undefined || value === "";
    if (empty) {
      if (field.name === "status") return "Pending";
      return "—";
    }

    return value;
  };

  const columns = [
    ...fields.slice(0, 6).map((field) => ({
      title: field.short || field.label,
      dataIndex: field.name,
      key: field.name,
      ellipsis: true,
      render: (value, row) => {
        const explicit = renderValue?.(field, value, row);
        if (explicit !== undefined && explicit !== null && explicit !== "") return explicit;
        const display = displayValue(field, value, row);
        return field.name === "status" ? (
          <Tag color={tagColor(value)}>{display}</Tag>
        ) : (
          display
        );
      },
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
          {additionalRowActions ? additionalRowActions(row) : null}
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
          resetForm();
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
});

export default RecordWorkspace;
