import apiRequest from "./api";

export const purchaseRequestService = {
  async getMyRequests() {
    // apiRequest already attaches base URL and token header
    const res = await apiRequest(`/PurchaseRequests/my-requests`, {
      method: "GET",
    });
    // Controller wraps responses in ApiResponse<T> { success, message, data }
    return res?.data || res;
  },

  async getByStatus(status) {
    const res = await apiRequest(
      `/PurchaseRequests/by-status/${encodeURIComponent(status)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getAll() {
    const res = await apiRequest(`/PurchaseRequests`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async create(request) {
    const res = await apiRequest(`/PurchaseRequests`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    // For create endpoint controller returns ApiResponse<PurchaseRequestDTO>
    return res?.data || res;
  },
  async approve(requestId) {
    const res = await apiRequest(
      `/PurchaseRequests/${encodeURIComponent(requestId)}/approve`,
      {
        method: "POST",
      }
    );
    return res?.data || res;
  },

  async reject(requestId, payload) {
    // optional payload may contain { reason or notes }
    const res = await apiRequest(
      `/PurchaseRequests/${encodeURIComponent(requestId)}/reject`,
      {
        method: "POST",
        body: payload ? JSON.stringify(payload) : undefined,
      }
    );
    return res?.data || res;
  },
};
