import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  BarChartOutlined,
  FileTextOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic, Tag } from "antd";
import { useAdminWorkspace, money } from "../../lib/adminWorkspace";
import MonthlyBudget from "./MonthlyBudget";
import Categories from "./Categories";
import Expenses from "./Expenses";
import ExpenseRecords from "./ExpenseRecords";
import "../../components/Admin/AdminShared.css";
import "./Expense.css";

const panels = ["overview", "budget", "categories", "expenses", "records"];
const normalize = (value) => (panels.includes(value) ? value : "overview");
function Hero({ panel, setPanel }) {
  return (
    <section className="module-hero expense-hero">
      <div>
        <Tag className="dashboard-eyebrow">EXPENSE OPERATIONS</Tag>
        <h1>Expense</h1>
        <p>
          Review student spending, categories, monthly targets, and auditable
          expense records.
        </p>
        <Space wrap>
          <Button type="primary" onClick={() => setPanel("expenses")}>
            Add expense
          </Button>
          <Button
            className="dashboard-secondary-btn"
            onClick={() => setPanel("overview")}
          >
            View overview
          </Button>
        </Space>
      </div>
      <div className="module-hero-panel">
        <div className="module-hero-icon">
          <WalletOutlined />
        </div>
        <h3>Budget and spending</h3>
        <span>Connected finance data is ready for review.</span>
        <Button
          type="link"
          onClick={() => setPanel(panel === "overview" ? "budget" : "overview")}
        >
          {panel === "overview" ? "Open budget" : "Back to overview"}
        </Button>
      </div>
    </section>
  );
}
function Overview({ data, setPanel }) {
  const expenses = data.expenses || [];
  const total = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const cards = [
    ["Expense records", expenses.length, <WalletOutlined />, "records"],
    ["Student spend", money(total), <BarChartOutlined />, "expenses"],
    ["Monthly budget", money(data.monthlyBudget), <WalletOutlined />, "budget"],
    [
      "Categories",
      (data.admin?.categories || []).length,
      <FileTextOutlined />,
      "categories",
    ],
  ];
  return (
    <>
      <Row gutter={[16, 16]}>
        {cards.map(([title, value, icon, target]) => (
          <Col xs={24} sm={12} xl={6} key={title}>
            <button className="stat-link" onClick={() => setPanel(target)}>
              <Card className="admin-stat-card">
                <div className="admin-stat-icon">{icon}</div>
                <Statistic title={title} value={value} />
                <div className="dashboard-stat-hint">Open workspace</div>
              </Card>
            </button>
          </Col>
        ))}
      </Row>
      <Card className="admin-panel" title="Spending snapshot">
        <div className="related-grid">
          <div>
            <strong>
              {expenses.filter((r) => r.status === "Approved").length}
            </strong>
            <div className="dashboard-stat-hint">Approved records</div>
          </div>
          <div>
            <strong>
              {expenses.filter((r) => r.status === "Logged").length}
            </strong>
            <div className="dashboard-stat-hint">Awaiting review</div>
          </div>
          <div>
            <strong>
              {data.monthlyBudget
                ? `${Math.min(100, Math.round((total / data.monthlyBudget) * 100))}%`
                : "—"}
            </strong>
            <div className="dashboard-stat-hint">Budget utilization</div>
          </div>
        </div>
      </Card>
    </>
  );
}
export default function Expense() {
  const location = useLocation();
  const { panel: routePanel } = useParams();
  const { data } = useAdminWorkspace();
  const requested =
    location.state?.panel?.split?.("/")?.[0] ||
    location.state?.panel ||
    routePanel ||
    "overview";
  const [panel, setPanel] = useState(() => normalize(requested));
  useEffect(() => {
    if (location.state?.panel)
      setTimeout(
        () =>
          setPanel(
            normalize(
              String(location.state.panel).split("/")[0] === "expenseRecords"
                ? "records"
                : String(location.state.panel).split("/")[0],
            ),
          ),
        0,
      );
  }, [location.state?.panel]);
  const content = useMemo(
    () =>
      ({
        overview: <Overview data={data} setPanel={setPanel} />,
        budget: <MonthlyBudget />,
        categories: <Categories />,
        expenses: <Expenses />,
        records: <ExpenseRecords />,
      })[panel],
    [data, panel],
  );
  return (
    <div className="admin-page finance-page">
      <Hero panel={panel} setPanel={setPanel} />
      <nav className="module-tabs" aria-label="Expense workspaces">
        {panels.map((item) => (
          <Button
            key={item}
            type={panel === item ? "primary" : "default"}
            onClick={() => setPanel(item)}
          >
            {item === "records"
              ? "Expense Records"
              : item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </nav>
      {content}
    </div>
  );
}
