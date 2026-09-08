import { adminRequest, isAdminApiConfigured } from "../api/client";
import { apiPayload, idOf, makeId } from "./adminWorkspace";

const mongoIdPattern = /^[a-f\d]{24}$/i;
const mongoIdOf = (record) => {
  const value = idOf(record);
  return mongoIdPattern.test(value) ? value : "";
};

export const saveAdminEntity = async (entity, record) => {
  if (!isAdminApiConfigured) {
    throw new Error("Admin API is not configured; changes were not saved.");
  }
  const id = mongoIdOf(record);
  if (entity === "attendance") {
    const workspaceId = id || idOf(record) || makeId("ATT");
    const result = await adminRequest(
      `/admin/workspace/attendance/${encodeURIComponent(workspaceId)}`,
      {
        method: "PUT",
        body: { record: { ...apiPayload(record), id: workspaceId } },
      },
    );
    return result?.record || { ...record, id: workspaceId };
  }
  const result = await adminRequest(
    id ? `/admin/entities/${entity}/${encodeURIComponent(id)}` : `/admin/entities/${entity}`,
    { method: id ? "PATCH" : "POST", body: apiPayload(record) },
  );
  return result?.record || result?.[entity.slice(0, -1)] || record;
};

export const deleteAdminEntity = async (entity, record) => {
  if (!isAdminApiConfigured) {
    throw new Error("Admin API is not configured; changes were not deleted.");
  }
  const id = mongoIdOf(record);
  if (entity === "attendance") {
    const workspaceId = id || idOf(record);
    if (!workspaceId) return;
    await adminRequest(`/admin/workspace/attendance/${encodeURIComponent(workspaceId)}`, {
      method: "DELETE",
    });
    return;
  }
  if (!id) return;
  await adminRequest(`/admin/entities/${entity}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};
