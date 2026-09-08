import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Progress,
  Statistic,
  Typography,
  message,
} from "antd";
import { useAdminWorkspace, money } from "../../lib/adminWorkspace";
import { adminRequest, isAdminApiConfigured } from "../../api/client";
import "./MonthlyBudget.css";

export default function MonthlyBudget() {
  const { data, commit, updateData } = useAdminWorkspace();
  const [form] = Form.useForm();
  const [messageApi, holder] = message.useMessage();
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
  useEffect(() => {
    if (!isAdminApiConfigured) return undefined;
    let cancelled = false;
    adminRequest("/users/me/preferences")
      .then((result) => {
        if (cancelled) return;
        const preferences = result?.preferences || result;
        const savedBudget = Number(preferences?.monthlyBudget);
        if (!Number.isFinite(savedBudget)) return;
        updateData?.((current) => ({
          ...current,
          monthlyBudget: savedBudget,
          budgetHistory: Array.isArray(preferences?.budgetHistory)
            ? preferences.budgetHistory
            : current.budgetHistory,
        }));
      })
      .catch((error) => {
        if (!cancelled) {
          messageApi.error(error.message || "Unable to load monthly budget.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [messageApi, updateData]);
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
          onFinish={async ({ budget: next }) => {
            const nextBudget = Number(next || 0);
            const nextHistory = [
              ...(data.budgetHistory || []),
              nextBudget,
            ];
            try {
              if (isAdminApiConfigured) {
                await adminRequest("/expenses/budget/update", {
                  method: "PUT",
                  body: {
                    monthlyBudget: nextBudget,
                    budgetHistory: nextHistory,
                  },
                });
              }
              commit(
                (current) => ({
                  ...current,
                  monthlyBudget: nextBudget,
                  budgetHistory: nextHistory,
                }),
                {
                  module: "expense",
                  title: "Monthly budget updated",
                  notify: true,
                },
              );
            } catch (error) {
              messageApi.error(error.message || "Unable to save monthly budget.");
            }
          }}
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
      {holder}
    </Card>
  );
}
