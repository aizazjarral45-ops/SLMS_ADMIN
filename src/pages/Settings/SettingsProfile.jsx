import { Avatar, Card, Col, Descriptions, Empty, Image, Row, Spin, Typography } from "antd";
import { PhoneFilled, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { adminRequest } from "../../api/client";
import { useAdminWorkspace } from "../../lib/adminWorkspace";
import "./SettingsProfile.css";

const displayValue = (value) => {
  if (!value) return "Not provided";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
};

const profileRequests = new Map();
const requestProfile = (studentId) => {
  const key = String(studentId);
  if (!profileRequests.has(key)) {
    const request = adminRequest(`/admin/students/${encodeURIComponent(key)}/profile`)
      .then((result) => result.profile || null)
      .finally(() => profileRequests.delete(key));
    profileRequests.set(key, request);
  }
  return profileRequests.get(key);
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "");

const profileSections = (profile) => [
  {
    title: "Personal Information",
    icon: <UserOutlined />,
    fields: [
      ["Full Name", profile.fullName],
      ["Father's Name", profile.fatherName],
      ["Gender", profile.gender],
      ["Date of Birth", formatDate(profile.dob)],
      ["CNIC", profile.cnic],
      ["Blood Group", profile.bloodGroup],
      ["Nationality", profile.nationality],
      ["Marital Status", profile.maritalStatus],
    ],
  },
  {
    title: "Contact Information",
    icon: <PhoneFilled />,
    fields: [
      ["University Email", profile.universityEmail],
      ["Personal Email", profile.personalEmail],
      ["Phone", profile.phone],
      ["Emergency Contact", profile.emergencyContact],
      ["Current Address", profile.currentAddress],
      ["Permanent Address", profile.permanentAddress],
    ],
  },
];

export default function SettingsProfile() {
  const { selectedStudentId } = useAdminWorkspace();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!selectedStudentId) {
      return undefined;
    }

    requestProfile(selectedStudentId)
      .then((nextProfile) => {
        if (!cancelled) setProfile(nextProfile);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setProfile(null);
          setError(requestError.message || "Unable to load student profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  if (!selectedStudentId) {
    return (
      <Card className="admin-panel settings-profile-card">
        <Empty description="Choose a student to view profile information" />
      </Card>
    );
  }

  if (
    loading ||
    !error && !profile ||
    (profile && String(profile.userId) !== String(selectedStudentId))
  ) {
    return (
      <Card className="admin-panel settings-profile-card">
        <Spin tip="Loading profile data..." />
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="admin-panel settings-profile-card">
        <Empty description={error || "Profile not found"} />
      </Card>
    );
  }

  return (
    <div className="settings-profile">
      <Card className="admin-panel settings-profile-card" bordered={false}>
        <div className="settings-profile-header">
          <div className="settings-profile-banner" aria-hidden="true" />
          <div className="settings-profile-header-content">
            <div className="settings-profile-photo">
              {profile.profileImage ? (
                <Image
                  className="settings-profile-image"
                  src={profile.profileImage}
                  alt={`${displayValue(profile.fullName)} profile`}
                  preview
                />
              ) : (
                <Avatar className="settings-profile-avatar" size={112} icon={<UserOutlined />} />
              )}
            </div>
            <Typography.Paragraph className="settings-profile-name">
              {displayValue(profile.fullName)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              {displayValue(profile.department)} Student
            </Typography.Paragraph>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              className="settings-profile-academic-card"
              title={
                <span className="settings-profile-section-title">
                  <Avatar size={32} icon={<UserOutlined />} />
                  Profile Information
                </span>
              }
            >
              <Descriptions column={1} size="small">
                {[
                  ["Student ID", profile.studentId],
                  ["Roll No", profile.rollNo],
                  ["Department", profile.department],
                  ["Semester", profile.semester],
                  ["Batch", profile.batch],
                  ["Sessions", profile.sessions],
                ].map(([label, value]) => (
                  <Descriptions.Item label={label} key={label}>
                    {displayValue(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </Col>
          {profileSections(profile).map((section) => (
            <Col xs={24} lg={8} key={section.title}>
              <Card
                className="settings-profile-info-card"
                title={
                  <span className="settings-profile-section-title">
                    <Avatar size={32} icon={section.icon} />
                    {section.title}
                  </span>
                }
              >
                <Descriptions column={1} size="small">
                  {section.fields.map(([label, value]) => (
                    <Descriptions.Item label={label} key={label}>
                      {displayValue(value)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
