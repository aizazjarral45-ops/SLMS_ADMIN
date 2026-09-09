import { Card, Progress, Statistic, Typography } from "antd";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./MonthlyBudget.css";

export default function MonthlyBudget() {
  const { data, filterByStudent, selectedStudentId } = useAdminWorkspace();
  const budget = Number(
    data.monthlyBudget ?? data.settings?.monthlyBudget ?? 0,
  );
  const spent = filterByStudent(data.expenses).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0,
  );
  const usedPercent = budget
    ? Math.round((spent / budget) * 100)
    : 0;
  const available = budget - spent;
  const availablePercent = budget
    ? Math.round((available / budget) * 100)
    : 0;
  const usedProgress = Math.min(100, Math.max(0, usedPercent));
  const availableProgress = Math.min(100, Math.max(0, availablePercent));
  return (
    <Card className="admin-panel expense-budget-feature" title="Monthly budget">
      <div className="budget-layout">
        <div className="budget-summary">
          <div className="budget-heading">
            <div>
              <Typography.Text className="budget-kicker">
                Spending overview
              </Typography.Text>
              <Typography.Title level={3}>Monthly budget</Typography.Title>
              <Typography.Text type="secondary">
                Track this student&apos;s spending against the saved budget.
              </Typography.Text>
            </div>
            <div className="budget-total">
              <Typography.Text type="secondary">Total budget</Typography.Text>
              <Statistic prefix="$" value={budget} precision={2} />
              <Typography.Text>100% total</Typography.Text>
            </div>
          </div>
          <div className="budget-progress">
            <div className="budget-progress-labels">
              <Typography.Text strong>Budget usage</Typography.Text>
              <Typography.Text type="secondary">{usedPercent}% used</Typography.Text>
            </div>
            <Progress
              percent={usedProgress}
              showInfo={false}
              strokeColor={spent > budget && budget ? "#dc2626" : "#1e3a8a"}
            />
            <Typography.Text type="secondary">
              {spent > budget ? "Over budget" : "Current budget usage"}
            </Typography.Text>
          </div>
          <div className="budget-metrics">
            <div className="budget-metric-card budget-metric-total">
              <div>
                <Typography.Text type="secondary">Total budget</Typography.Text>
                <Statistic prefix="$" value={budget} precision={2} />
              </div>
              <Progress type="circle" percent={100} size={54} showInfo={false} />
            </div>
            <div className="budget-metric-card budget-metric-spent">
              <div>
                <Typography.Text type="secondary">Total spent</Typography.Text>
                <Statistic prefix="$" value={spent} precision={2} />
                <Typography.Text>{usedPercent}% used</Typography.Text>
              </div>
              <Progress type="circle" percent={usedProgress} size={54} showInfo={false} />
            </div>
            <div className="budget-metric-card budget-metric-available">
              <div>
                <Typography.Text type="secondary">Available balance</Typography.Text>
                <Statistic
                  prefix="$"
                  value={available}
                  precision={2}
                  valueStyle={{ color: available < 0 ? "#dc2626" : undefined }}
                />
                <Typography.Text>{availablePercent}% available</Typography.Text>
              </div>
              <Progress
                type="circle"
                percent={availableProgress}
                size={54}
                showInfo={false}
                strokeColor="#2563eb"
              />
            </div>
          </div>
        </div>
      </div>
      {!selectedStudentId ? (
        <Typography.Text type="secondary">
          Choose a student to view their saved monthly budget.
        </Typography.Text>
      ) : null}
    </Card>
  );
}
