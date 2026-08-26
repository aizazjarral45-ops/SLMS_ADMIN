import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "../components/Admin/AdminShared.css";
const { Title, Paragraph } = Typography;
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="notfound-page">
      <Card className="notfound-card">
        <Title level={2}>Page not found</Title>
        <Paragraph type="secondary">
          The page you're looking for doesn't exist or has been moved. Use the
          navigation to return to the admin Dashboard.
        </Paragraph>
        <Button type="primary" onClick={() => navigate("/")}>Back to dashboard</Button>
      </Card>
    </main>
  );
}
