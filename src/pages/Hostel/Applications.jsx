import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button, Card, Empty, Form, Input, Modal, Popconfirm, Select, Space,
  Spin, Table, Tag, message,
} from "antd";
import { adminRequest } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./Applications.css";

const statuses = ["Pending", "Approved", "Rejected"];
const applicationId = (application) => application?._id || application?.id;
const nameOf = (a) => a.studentId?.name || a.applicantDetails?.name ||
  a.applicantDetails?.fullName || a.fullName || "—";
const emailOf = (a) => a.studentId?.email || a.applicantDetails?.email || a.email || "—";

export default function Applications() {
  const { admin } = useAuth();
  const { updateData } = useAdminWorkspace();
  const [applications, setApplications] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [approval, setApproval] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, holder] = message.useMessage();

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminRequest("/hostel/admin/all");
      const loadedValue =
        result?.applications || result?.records || result?.data?.applications;
      const loaded = Array.isArray(loadedValue) ? loadedValue : [];
      const unique = loaded.filter(
        (item, index, all) =>
          index === all.findIndex((candidate) =>
            applicationId(candidate) && applicationId(candidate) === applicationId(item),
          ),
      );
      setApplications(unique);
      updateData?.((current) => ({ ...current, hostelApplications: unique }));
    } catch (error) {
      messageApi.error(error.message || "Unable to load hostel applications.");
    } finally {
      setLoading(false);
    }
  }, [messageApi, updateData]);

  useEffect(() => {
    if (!admin?.token) return undefined;
    const timer = setTimeout(() => loadApplications(), 0);
    return () => clearTimeout(timer);
  }, [admin?.token, loadApplications]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = status === "All" || application.status === status;
      const text = [
        nameOf(application), emailOf(application),
        application.studentId?.profile?.studentId,
        application.applicantDetails?.studentId, application.status,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!search || text.includes(search));
    });
  }, [applications, query, status]);

  const updateStatus = async (application, nextStatus, allocation = {}) => {
    const id = applicationId(application);
    if (!id) {
      messageApi.error("This application has no ID and cannot be updated.");
      return;
    }
    setUpdating(id);
    try {
      const result = await adminRequest(`/hostel/admin/allocate/${id}`, {
        method: "PUT", body: { status: nextStatus, ...allocation },
      });
      const updated = result?.application;
      setApplications((current) => current.map((item) =>
        applicationId(item) === id
          ? updated || { ...item, status: nextStatus, roomAllocation: allocation }
          : item,
      ));
      updateData?.((current) => ({
        ...current,
        hostelApplications: (current.hostelApplications || []).map((item) =>
          applicationId(item) === id
            ? updated || { ...item, status: nextStatus, roomAllocation: allocation }
            : item,
        ),
      }));
      messageApi.success(`Application ${nextStatus.toLowerCase()}.`);
      setApproval(null);
      form.resetFields();
    } catch (error) {
      messageApi.error(error.message || "Unable to update application status.");
    } finally {
      setUpdating(null);
    }
  };

  const columns = [
    {
      title: "Student", key: "student",
      render: (_, application) => <div><strong>{nameOf(application)}</strong>
        <div className="application-secondary">{emailOf(application)}</div></div>,
    },
    {
      title: "Student ID", key: "studentId",
      render: (_, a) => a.studentId?.profile?.studentId ||
        a.applicantDetails?.studentId || "—",
    },
    {
      title: "Applied", dataIndex: "createdAt", key: "createdAt",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (value) => <Tag color={value === "Approved" ? "green" :
        value === "Rejected" ? "red" : "gold"}>{value}</Tag>,
    },
    {
      title: "Room", key: "room",
      render: (_, a) => a.roomAllocation?.roomNumber
        ? `${a.roomAllocation.roomNumber} · ${a.roomAllocation.block}, floor ${a.roomAllocation.floor}`
        : "—",
    },
    {
      title: "Actions", key: "actions",
      render: (_, application) => <Space size="small">
        {application.status !== "Approved" && application.status !== "Rejected" ? (
          <Button type="link" loading={updating === applicationId(application)} onClick={() => {
            form.resetFields(); setApproval(application);
          }}>Approve</Button>
        ) : null}
        {application.status !== "Rejected" ? (
          <Popconfirm title="Reject this application?" okText="Reject"
            okButtonProps={{ danger: true }}
            onConfirm={() => updateStatus(application, "Rejected")}>
            <Button type="link" danger loading={updating === applicationId(application)}>Reject</Button>
          </Popconfirm>
        ) : null}
      </Space>,
    },
  ];

  return <Card className="record-workspace hostel-applications-feature" title="Applications"
    extra={<Space wrap className="record-workspace-actions">
      <Input.Search allowClear placeholder="Search applications" value={query}
        onChange={(event) => setQuery(event.target.value)} />
      <Select value={status} onChange={setStatus}
        options={[{ value: "All", label: "All statuses" },
          ...statuses.map((item) => ({ value: item, label: item }))]} />
    </Space>}>
    {holder}
    {loading ? <div className="applications-loading"><Spin /></div> :
      <Table rowKey={applicationId} columns={columns} dataSource={visible}
        scroll={{ x: 900 }} pagination={{ pageSize: 8, hideOnSinglePage: true }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No applications found" /> }} />}
    <Modal title={`Approve ${nameOf(approval)}`} open={Boolean(approval)} destroyOnClose
      okText="Approve application" confirmLoading={Boolean(updating)}
      onCancel={() => { setApproval(null); form.resetFields(); }}
      onOk={() => form.submit()}>
      <Form form={form} layout="vertical"
        onFinish={(values) => updateStatus(approval, "Approved", values)}>
        {["roomNumber", "block", "floor"].map((field) => (
          <Form.Item key={field} name={field}
            label={field === "roomNumber" ? "Room number" :
              field[0].toUpperCase() + field.slice(1)}
            rules={[{ required: true, message: `Enter the ${field}.` }]}>
            <Input />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  </Card>;
}
