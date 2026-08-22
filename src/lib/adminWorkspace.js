import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";

export const idOf = (row) => String(row?.id || row?.key || "");
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

export const saveRecord = (rows, record) => {
  const existing = (rows || []).find((item) => idOf(item) === idOf(record));
  const next = {
    ...existing,
    ...record,
    createdAt: existing?.createdAt || timestamp(),
    updatedAt: timestamp(),
  };
  return existing
    ? rows.map((item) => (idOf(item) === idOf(next) ? next : item))
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
  const commit = useCallback(
    (mutate, activity) => {
      updateData?.((current) => withActivity(mutate(current), activity));
    },
    [updateData],
  );
  return { data, updateData, commit, admin: data.admin || {} };
}
