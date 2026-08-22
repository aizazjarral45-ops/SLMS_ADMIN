import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Categories.css";

export default function Categories() {
  const { data, commit } = useAdminWorkspace();
  const [form] = Form.useForm();
  const [messageApi, holder] = message.useMessage();
  const [editing, setEditing] = useState(null);
  const rows = useMemo(
    () =>
      (data.admin?.categories || []).map((item) =>
        typeof item === "string" ? { id: `CAT-${item}`, name: item } : item,
      ),
    [data.admin?.categories],
  );
  const save = ({ name }) =>
    commit(
      (current) => {
        const values = (current.admin.categories || []).map((item) =>
          typeof item === "string" ? item : item.name,
        );
        const normalized = name.trim();
        const next = editing?.id
          ? values.map((item) => (item === editing.name ? normalized : item))
          : [
              normalized,
              ...values.filter(
                (item) => item.toLowerCase() !== normalized.toLowerCase(),
              ),
            ];
        return { ...current, admin: { ...current.admin, categories: next } };
      },
      {
        module: "expense",
        title: `Category ${editing?.id ? "updated" : "created"}`,
        notify: true,
      },
    );
  const remove = (row) =>
    commit(
      (current) => ({
        ...current,
        admin: {
          ...current.admin,
          categories: (current.admin.categories || []).filter(
            (item) =>
              (typeof item === "string" ? item : item.name) !== row.name,
          ),
        },
      }),
      { module: "expense", title: `${row.name} category removed` },
    );
  return (
    <Card
      className="admin-panel expense-categories-feature"
      title="Categories"
      extra={
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setEditing({});
          }}
        >
          Add category
        </Button>
      }
    >
      {holder}
      <Table
        rowKey="id"
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: <Empty description="No categories yet" /> }}
        columns={[
          {
            title: "Category",
            dataIndex: "name",
            render: (value) => <Tag color="blue">{value}</Tag>,
          },
          {
            title: "Actions",
            width: 120,
            render: (_, row) => (
              <Space>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditing(row);
                    form.setFieldsValue(row);
                  }}
                />
                <Popconfirm
                  title="Delete this category?"
                  onConfirm={() => {
                    remove(row);
                    messageApi.success("Category deleted.");
                  }}
                >
                  <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={`${editing?.id ? "Edit" : "Add"} category`}
        open={editing !== null}
        onCancel={() => setEditing(null)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            save(values);
            setEditing(null);
            form.resetFields();
            messageApi.success("Category saved.");
          }}
        >
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
