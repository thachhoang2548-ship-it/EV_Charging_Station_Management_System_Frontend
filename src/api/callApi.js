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
        "He thong phan hoi cham. OTP co the da duoc gui, vui long kiem tra email.") ||
      (isNetworkError &&
        "Khong the ket noi den may chu. Vui long kiem tra mang va thu lai.") ||
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
