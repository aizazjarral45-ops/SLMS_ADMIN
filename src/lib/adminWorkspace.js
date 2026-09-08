import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";

// Accept both the local identifier convention and Mongo/API records. Keeping
// this in one place prevents edits/deletes from silently creating duplicates
// when a record came from an API response using `_id`.
export const idOf = (row) =>
  String(row?._id ?? row?.id ?? row?.key ?? row?.applicationNo ?? "");
export const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
export const timestamp = () => new Date().toISOString();
export const displayDate = (value) =>
  value ? new Date(value).toLocaleString() : "—";
export const tagColor = (value) => {
  const status = String(value || "").toLowerCase();
  if (
    [
      "active",
      "approved",
      "resolved",
      "paid",
      "completed",
      "available",
      "open",
    ].includes(status)
  )
    return "green";
  if (
    ["in progress", "processing", "logged", "assigned", "read"].includes(status)
  )
    return "blue";
  if (["rejected", "overdue", "inactive", "closed"].includes(status))
    return "red";
  return "gold";
};
export const money = (value) => `$${Number(value || 0).toFixed(2)}`;
export const apiPayload = (record = {}) => {
  const payload = { ...record };
  delete payload.id;
  delete payload.key;
  return payload;
};

const referenceValues = (row = {}) => [
  row.studentId,
  row.userId,
  row.targetUserId,
  row.id,
  row._id,
  row.student?.id,
  row.student?._id,
  row.applicantDetails?.studentId,
  row.studentInformation?.studentId,
].filter(Boolean).map(String);

export const belongsToStudent = (row, studentId) => {
  if (!studentId) return true;
  return referenceValues(row).includes(String(studentId));
};

export const filterByStudent = (rows, studentId) =>
  (rows || []).filter((row) => belongsToStudent(row, studentId));

export const saveRecord = (rows, record) => {
  const recordId = idOf(record);
  const existing = recordId
    ? (rows || []).find((item) => idOf(item) === recordId)
    : undefined;
  const next = {
    ...existing,
    ...record,
    createdAt: existing?.createdAt || timestamp(),
    updatedAt: timestamp(),
  };
  // API records are Mongo documents. Do not create a second client id when
  // an edit payload already has the authoritative _id.
  if (next._id !== undefined && next._id !== null) {
    delete next.id;
    delete next.key;
  }
  return existing
    ? (rows || []).map((item) => (idOf(item) === idOf(next) ? next : item))
    : [next, ...(rows || [])];
};
export const deleteRecord = (rows, record) =>
  (rows || []).filter((item) => idOf(item) !== idOf(record));

export const withActivity = (data, activity) => {
  if (!activity) return data;
  const event = { id: makeId("ACT"), createdAt: timestamp(), ...activity };
  const notifications = activity.notify
    ? [
        {
          id: makeId("NTF"),
          title: activity.title,
          type: activity.module,
          refId: activity.refId || null,
          studentId: activity.studentId || null,
          createdAt: event.createdAt,
        },
        ...(data.notifications || []),
      ]
    : data.notifications || [];
  return {
    ...data,
    notifications,
    activity: [event, ...(data.activity || [])].slice(0, 100),
  };
};

export function useAdminWorkspace() {
  const context = useOutletContext();
  const data = context?.data || {};
  const updateData = context?.updateData;
  const selectedStudentId = context?.selectedStudentId || "";
  const selectedStudentName = context?.selectedStudentName || "";
  const setSelectedStudentId = context?.setSelectedStudentId;
  const selectStudent = context?.selectStudent;
  const studentSelectionLoading = Boolean(context?.studentSelectionLoading);
  const studentSelectionError = context?.workspaceError || "";
  const selectedStudent = (data.admin?.students || []).find(
    (student) => idOf(student) === String(selectedStudentId),
  );
  const scopedFilter = useCallback(
    (rows) => filterByStudent(rows, selectedStudentId),
    [selectedStudentId],
  );
  const commit = useCallback(
    (mutate, activity) => {
      updateData?.((current) => withActivity(mutate(current), activity));
    },
    [updateData],
  );
  return {
    data,
    updateData,
    commit,
    admin: data.admin || {},
    selectedStudentId,
    selectedStudentName,
    setSelectedStudentId,
    selectStudent,
    selectedStudent,
    studentSelectionLoading,
    studentSelectionError,
    filterByStudent: scopedFilter,
  };
}
