import { useMemo, useState } from "react";
import { Button, Card, Descriptions, Empty, Modal, Table, Tag } from "antd";
import { useAdminWorkspace, money } from "../../lib/adminWorkspace";
import "./Categories.css";

export default function Categories() {
  const { data, filterByStudent } = useAdminWorkspace();
  const [viewing, setViewing] = useState(null);
  const rows = useMemo(
    () => {
      const categories = (data.admin?.categories || []).map((item) =>
        typeof item === "string" ? { id: `CAT-${item}`, name: item } : item,
      );
      const known = new Set(categories.map((item) => item.name));
      filterByStudent(data.expenses).forEach((expense) => {
        const name = expense.category || "Uncategorized";
        if (!known.has(name)) {
          categories.push({ id: `CAT-${name}`, name });
          known.add(name);
        }
      });
      return categories;
    },
    [data.admin?.categories, data.expenses, filterByStudent],
  );
  const spendingByCategory = useMemo(() => {
    const totals = new Map();
    filterByStudent(data.expenses).forEach((expense) => {
      const category = expense.category || "Uncategorized";
      totals.set(category, (totals.get(category) || 0) + Number(expense.amount || 0));
    });
    return totals;
  }, [data.expenses, filterByStudent]);
  return (
    <Card
      className="admin-panel expense-categories-feature"
      title="Categories"
    >
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
            title: "Amount Spent",
            key: "amountSpent",
            render: (_, row) => `$${(spendingByCategory.get(row.name) || 0).toFixed(2)}`,
          },
          {
            title: "Actions",
            width: 120,
            render: (_, row) => (
              <Button type="link" onClick={() => setViewing(row)}>View</Button>
            ),
          },
        ]}
      />
      <Modal
        title="Category details"
        open={Boolean(viewing)}
        footer={null}
        onCancel={() => setViewing(null)}
      >
        {viewing ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Category">{viewing.name}</Descriptions.Item>
            <Descriptions.Item label="Amount Spent">
              {money(spendingByCategory.get(viewing.name) || 0)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </Card>
  );
}
