import apiClient from "./apiUrls.js";
import handleApiCall from "./callApi.js";

// lấy vé (signature) từ BE
export const getUploadSignature = () => {
  return handleApiCall(
    () => apiClient.get('/api/upload/signature'),
    'Không lấy đc vé upload'
  );
};

export async function getPresignedUploadUrl({ fileName, contentType, folder }) {
  try {
    const response = await apiClient.post('/api/files/upload-url', {
      fileName,
      contentType,
      folder
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không lấy được URL upload");
  }
}

export async function uploadFileToS3(file, uploadUrl) {


console.log("file.name =", file.name)
console.log("file.type =", file.type)

  // Dùng trực tiếp fetch để không bị dính Authorization header của apiClient (lỗi S3 Signature)
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("S3 status:", response.status);
    console.error("S3 error body:", errorText);
    throw new Error("Không upload được file lên S3");
  }


  return true;
}

export async function deleteFileFromS3(s3Key) {
  try {
    const response = await apiClient.delete('/api/files/delete', {
      params: { s3Key }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không xóa được file");
  }
}

export async function getFileUrlFromS3(s3Key) {
  try {
    const response = await apiClient.get('/api/files/url', {
      params: { s3Key }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không lấy được URL file");
  }
}
