import { useMemo, useState } from "react";
import {
  Card, Empty, Input, Select, Space, Table,
} from "antd";
import {
  belongsToStudent,
  rollNoForRecord,
  studentNameForRecord,
  useAdminWorkspace,
} from "../../lib/adminWorkspace";
import "./Applications.css";

const statuses = ["Pending", "Approved", "Rejected"];
const applicationId = (application) => application?._id || application?.id;
const nameOf = (application, students) => studentNameForRecord(
  students,
  application,
  application?.studentId?.name || application?.applicantDetails?.name ||
    application?.applicantDetails?.fullName || application?.fullName || "—",
);
const emailOf = (a) => a?.studentId?.email || a?.applicantDetails?.email || a?.email || "—";
const studentInformationOf = (application) => ({
  fullName: application?.studentInformation?.fullName ||
    application?.applicantDetails?.fullName || application?.fullName || "—",
  studentId: application?.studentInformation?.studentId ||
    application?.applicantDetails?.studentId || application?.studentId || "—",
  email: application?.studentInformation?.email ||
    application?.applicantDetails?.email || application?.email || "—",
  phone: application?.studentInformation?.phone ||
    application?.applicantDetails?.phone || application?.phone || "—",
  program: application?.studentInformation?.program ||
    application?.applicantDetails?.program || application?.program || "—",
  semester: application?.studentInformation?.semester ||
    application?.applicantDetails?.semester || application?.semester || "—",
  gender: application?.studentInformation?.gender ||
    application?.applicantDetails?.gender || application?.gender || "—",
});
const guardianInformationOf = (application) => ({
  guardianName: application?.guardianInformation?.guardianName ||
    application?.applicantDetails?.guardianName || application?.guardianName || "—",
  guardianPhone: application?.guardianInformation?.guardianPhone ||
    application?.applicantDetails?.guardianPhone || application?.guardianPhone || "—",
  emergencyName: application?.guardianInformation?.emergencyName ||
    application?.applicantDetails?.emergencyName || application?.emergencyName || "—",
  emergencyPhone: application?.guardianInformation?.emergencyPhone ||
    application?.applicantDetails?.emergencyPhone || application?.emergencyPhone || "—",
});

export default function Applications() {
  const {
    data,
    selectedStudentId,
    admin: workspaceAdmin,
    studentSelectionLoading,
  } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    const sourceApplications = data.hostelApplications || [];
    const belongsToSelectedStudent = (application) => {
      if (!selectedStudentId) return true;
      return belongsToStudent(application, selectedStudentId);
    };
    return sourceApplications.filter(belongsToSelectedStudent).filter((application) => {
      const matchesStatus = status === "All" || application.status === status;
      const text = [
        nameOf(application, workspaceAdmin.students), emailOf(application),
        application.studentId?.profile?.studentId,
        application.applicantDetails?.studentId, application.status,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!search || text.includes(search));
    });
  }, [
    data.hostelApplications,
    query,
    status,
    selectedStudentId,
    workspaceAdmin.students,
  ]);

  const studentInformationColumns = [
    { title: "Student Name", key: "fullName", render: (_, a) => nameOf(a, workspaceAdmin.students) },
    { title: "Student ID", key: "studentId", render: (_, a) => rollNoForRecord(workspaceAdmin.students, a) },
    { title: "Email", key: "email", render: (_, a) => studentInformationOf(a).email },
    { title: "Phone", key: "phone", render: (_, a) => studentInformationOf(a).phone },
    { title: "Department / Program", key: "program", render: (_, a) => studentInformationOf(a).program },
    { title: "Semester", key: "semester", render: (_, a) => studentInformationOf(a).semester },
    { title: "Gender", key: "gender", render: (_, a) => studentInformationOf(a).gender },
  ];

  const guardianColumns = [
    { title: "Student Name", key: "fullName", render: (_, a) => nameOf(a, workspaceAdmin.students) },
    { title: "Guardian Name", key: "guardianName", render: (_, a) => guardianInformationOf(a).guardianName },
    { title: "Guardian Phone", key: "guardianPhone", render: (_, a) => guardianInformationOf(a).guardianPhone },
    { title: "Emergency Contact", key: "emergencyName", render: (_, a) => guardianInformationOf(a).emergencyName },
    { title: "Emergency Phone", key: "emergencyPhone", render: (_, a) => guardianInformationOf(a).emergencyPhone },
  ];

  return <Card className="record-workspace hostel-applications-feature" title="Applications"
    extra={<Space wrap className="record-workspace-actions">
      <Input.Search allowClear placeholder="Search applications" value={query}
        onChange={(event) => setQuery(event.target.value)} />
      <Select value={status} onChange={setStatus}
        options={[{ value: "All", label: "All statuses" },
          ...statuses.map((item) => ({ value: item, label: item }))]} />
    </Space>}>
    <Card size="small" title="Saved Hostel Applications" style={{ marginBottom: 16 }}>
      <Table
        rowKey={applicationId}
        columns={studentInformationColumns}
        dataSource={visible}
        loading={studentSelectionLoading || !Array.isArray(data.hostelApplications)}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        scroll={{ x: 1000 }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hostel information found" /> }}
      />
    </Card>
    <Card size="small" title="Parents/Guardians" style={{ marginBottom: 16 }}>
      <Table
        rowKey={applicationId}
        columns={guardianColumns}
        dataSource={visible}
        loading={studentSelectionLoading || !Array.isArray(data.hostelApplications)}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        scroll={{ x: 900 }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No guardian information found" /> }}
      />
    </Card>
  </Card>;
}
