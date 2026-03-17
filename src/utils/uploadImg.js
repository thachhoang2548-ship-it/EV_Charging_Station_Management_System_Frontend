import { toast } from 'react-toastify';
import { getPresignedUploadUrl, uploadFileToS3 } from '../api/uploadApi.js';

export const uploadImageToS3 = async (file, folder = "vehicle_models") => {
  if (!file) {
    toast.error('Đang không có file nào được chọn.');
    throw new Error('No file selected for upload.');
  }

  try {
    // 1. Gọi BE để lấy presigned URL
    const s3Data = await getPresignedUploadUrl({
      fileName: file.name,
      contentType: file.type,
      folder: folder
    });

    const { presignedUrl, s3Key, publicUrl } = s3Data;

    // 2. Upload trực tiếp từ client lên S3
    await uploadFileToS3(file, presignedUrl);

    // 3. Trả về public object tựa như format Uploading để không phá vỡ logic cũ quá nhiều
    return {
      success: true,
      data: {
        secure_url: publicUrl,
        public_id: s3Key
      }
    };

  } catch (error) {
    console.error('Error during image upload process:', error);
    toast.error('Không thể upload ảnh, vui lòng thử lại.');
    throw new Error('Image upload failed.');
  }
};