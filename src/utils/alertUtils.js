import Swal from 'sweetalert2';

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 * @param {string} title - Tiêu đề (mặc định: 'Thành công!')
 */
export const showSuccess = (message, title = 'Thành công!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#16a34a',
    timer: 3000,
    timerProgressBar: true,
  });
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo
 * @param {string} title - Tiêu đề (mặc định: 'Lỗi!')
 */
export const showError = (message, title = 'Lỗi!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626',
  });
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung thông báo
 * @param {string} title - Tiêu đề (mặc định: 'Cảnh báo!')
 */
export const showWarning = (message, title = 'Cảnh báo!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  });
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông báo
 * @param {string} title - Tiêu đề (mặc định: 'Thông báo')
 */
export const showInfo = (message, title = 'Thông báo') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
  });
};

/**
 * Hiển thị dialog xác nhận
 * @param {string} message - Nội dung câu hỏi xác nhận
 * @param {string} title - Tiêu đề (mặc định: 'Xác nhận')
 * @param {string} confirmButtonText - Text nút xác nhận (mặc định: 'Có')
 * @param {string} cancelButtonText - Text nút hủy (mặc định: 'Không')
 * @returns {Promise<boolean>} - true nếu user chọn xác nhận, false nếu hủy
 */
export const showConfirm = async (
  message, 
  title = 'Xác nhận', 
  confirmButtonText = 'Có',
  cancelButtonText = 'Không'
) => {
  const result = await Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });
  
  return result.isConfirmed;
};

/**
 * Hiển thị dialog xác nhận với icon cảnh báo (dùng cho các hành động nguy hiểm)
 * @param {string} message - Nội dung câu hỏi xác nhận
 * @param {string} title - Tiêu đề (mặc định: 'Cảnh báo!')
 * @param {string} confirmButtonText - Text nút xác nhận (mặc định: 'Xác nhận')
 * @param {string} cancelButtonText - Text nút hủy (mặc định: 'Hủy')
 * @returns {Promise<boolean>} - true nếu user chọn xác nhận, false nếu hủy
 */
export const showConfirmWarning = async (
  message,
  title = 'Cảnh báo!',
  confirmButtonText = 'Xác nhận',
  cancelButtonText = 'Hủy'
) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });
  
  return result.isConfirmed;
};

/**
 * Hiển thị dialog xác nhận xóa
 * @param {string} itemName - Tên item cần xóa
 * @returns {Promise<boolean>} - true nếu user xác nhận xóa
 */
export const showDeleteConfirm = async (itemName = 'mục này') => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Xác nhận xóa',
    html: `Bạn có chắc chắn muốn xóa <strong>${itemName}</strong>?<br/><span style="color: #dc2626;">Hành động này không thể hoàn tác!</span>`,
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });
  
  return result.isConfirmed;
};
