import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Progress,
  Statistic,
  Typography,
} from "antd";
import { useAdminWorkspace, money } from "../../lib/adminWorkspace";
import "./MonthlyBudget.css";

export default function MonthlyBudget() {
  const { data, commit } = useAdminWorkspace();
  const [form] = Form.useForm();
  const budget = Number(data.monthlyBudget || 0);
  const spent = (data.expenses || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0,
  );
  const percent = budget
    ? Math.min(100, Math.round((spent / budget) * 100))
    : 0;
  useEffect(() => {
    form.setFieldsValue({ budget });
  }, [budget, form]);
  return (
    <Card className="admin-panel expense-budget-feature" title="Monthly budget">
      <div className="budget-layout">
        <div>
          <Statistic title="Budget" prefix="$" value={budget} precision={2} />
          <Progress
            percent={percent}
            strokeColor={spent > budget && budget ? "#dc2626" : "#1e3a8a"}
          />
          <Typography.Text type="secondary">
            {money(spent)} recorded ·{" "}
            {budget
              ? spent > budget
                ? "Over budget"
                : "Within budget"
              : "Set a target to track utilization"}
          </Typography.Text>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={({ budget: next }) =>
            commit(
              (current) => ({
                ...current,
                monthlyBudget: Number(next || 0),
                budgetHistory: [
                  ...(current.budgetHistory || []),
                  Number(next || 0),
                ],
              }),
              {
                module: "expense",
                title: "Monthly budget updated",
                notify: true,
              },
            )
          }
        >
          <Form.Item
            name="budget"
            label="Monthly target"
            rules={[{ required: true, message: "Enter a monthly target." }]}
          >
            <InputNumber
              min={0}
              precision={2}
              prefix="$"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Save budget
          </Button>
        </Form>
      </div>
    </Card>
  );
}
