import { useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Modal, Space, Spin } from "antd";
import { CheckOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { idOf, useAdminWorkspace } from "../../lib/adminWorkspace";
import { adminRequest, isAdminApiConfigured } from "../../api/client";
import "./StudentSelector.css";

export default function StudentSelector({ onSelect }) {
  const {
    selectedStudentId,
    selectedStudentName,
    selectedStudent: contextStudent,
    selectStudent,
    workspaceError,
  } = useAdminWorkspace();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const selected =
    students.find((student) => idOf(student) === String(selectedStudentId)) ||
    contextStudent;
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return students;
    return students.filter((student) =>
      [student.name, student.fullName, student.email, student.studentId, student.id, student._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query, students]);

  return (
    <>
      <Button
        className="hero-student-selector"
        icon={<UserOutlined />}
        onClick={async () => {
          setOpen(true);
          if (!isAdminApiConfigured) {
            setListError("Admin API is not configured.");
            return;
          }
          setLoading(true);
          setListError("");
          try {
            const result = await adminRequest("/admin/students");
            setStudents(result.students || []);
          } catch (error) {
            setListError(error.message || "Unable to load students.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {selectedStudentId
          ? selected?.name ||
            selected?.fullName ||
            selectedStudentName ||
            "Student"
          : selectedStudentName === "All Students"
            ? "All Students"
            : "Choose Student"}
      </Button>
      <Modal
        title="Choose Student"
        open={open}
        onCancel={() => {
          setOpen(false);
          setQuery("");
        }}
        footer={null}
        destroyOnClose
      >
        <Input
          allowClear
          autoFocus
          prefix={<SearchOutlined />}
          placeholder="Search name, student ID, user ID, or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="student-selector-list">
          <button
            type="button"
            className={`student-selector-option${!selectedStudentId ? " is-selected" : ""}`}
            onClick={async () => {
              await selectStudent?.("", "All Students");
              onSelect?.(null);
              setOpen(false);
              setQuery("");
            }}
          >
            <Space>
              <UserOutlined />
              <span><strong>All Students</strong><small>Show all database records</small></span>
            </Space>
            {!selectedStudentId ? <CheckOutlined /> : null}
          </button>
          {loading ? <div className="student-selector-loading"><Spin /></div> : null}
          {listError || workspaceError ? (
            <Alert type="error" showIcon message={listError || workspaceError} />
          ) : null}
          {!loading && !listError && !workspaceError && !filtered.length ? (
            <Empty description="No students found." />
          ) : null}
          {!loading && filtered.map((student) => {
            const identifier = idOf(student);
            const isSelected = identifier === String(selectedStudentId);
            return (
              <button
                type="button"
                className={`student-selector-option${isSelected ? " is-selected" : ""}`}
                key={identifier}
                onClick={async () => {
                  await selectStudent?.(
                    identifier,
                    student.name || student.fullName || "Student",
                  );
                  onSelect?.(student);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Space>
                  <UserOutlined />
                  <span>
                    <strong>{student.name || student.fullName || "Unnamed student"}</strong>
                    <small>{student.rollNo || "No roll number"} · {student.email || "No email"}</small>
                  </span>
                </Space>
                {isSelected ? <CheckOutlined /> : null}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
