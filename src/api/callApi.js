import { clearAuthData } from "../utils/authUtils.js";

export default async function handleApiCall(apiCall, defaultMessage) {
  try {
    const response = await apiCall();
    if (response.config.url.includes("/logout")) {
      clearAuthData();
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("API error:", error);
    const isTimeoutError =
      error.code === "ECONNABORTED" ||
      error.message?.toLowerCase().includes("timeout");
    const isNetworkError =
      error.message?.toLowerCase().includes("network error") &&
      !error.response;

    // Capture more details from the axios error response so callers can debug
    const errorData = error.response?.data;
    const errorStatus = error.response?.status || (isTimeoutError ? 408 : undefined);
    const errorMessage =
      (isTimeoutError &&
        "Hệ thống phản hồi chậm. OTP có thể đã được gửi, vui lòng kiểm tra email.") ||
      (isNetworkError &&
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.") ||
      (errorData && (errorData.message || JSON.stringify(errorData))) ||
      defaultMessage;

    return {
      success: false,
      message: errorMessage,
      status: errorStatus,
      errorData: errorData,
    };
  }
}
