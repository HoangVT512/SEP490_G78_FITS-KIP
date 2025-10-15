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

  async create(request) {
    const res = await apiRequest(`/PurchaseRequests`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    // For create endpoint controller returns ApiResponse<PurchaseRequestDTO>
    return res?.data || res;
  },
};
