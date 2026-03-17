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
  const response = await fetch("http://localhost:8080/api/files/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName,
      contentType,
      folder
    })
  });

  if (!response.ok) {
    throw new Error("Không lấy được URL upload");
  }
  return response.json();
}

export async function uploadFileToS3(file, uploadUrl) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Không upload được file lên S3");
  }

  return true;
}

export async function deleteFileFromS3(s3Key) {
  const response = await fetch(`http://localhost:8080/api/files/delete?s3Key=${encodeURIComponent(s3Key)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Không xóa được file");
  }
  return response.text();
}

export async function getFileUrlFromS3(s3Key) {
  const response = await fetch(`http://localhost:8080/api/files/url?s3Key=${encodeURIComponent(s3Key)}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Không lấy được URL file");
  }
  return response.text();
}
