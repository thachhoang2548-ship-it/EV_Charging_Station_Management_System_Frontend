Login với API POST /api/users/login - Khóa tài khoản khi nhập sai mật khẩu
Sau 3 lần nhập sai: Cảnh báo người dùng
Lần 4 nhập sai → Khóa lần 1: 1 phút
Lần khóa thứ 2: 5 phút
Lần khóa thứ 3: 30 phút
Lần khóa thứ 4+: Khóa vĩnh viễn, yêu cầu Admin mở khóa



Kịch bản 1: Đăng nhập sai mật khẩu
Lần 1 sai: "Mật khẩu không chính xác. Bạn còn 2 lần thử."
Lần 2 sai: "Mật khẩu không chính xác. Bạn còn 1 lần thử."
Lần 3 sai: "Bạn đã nhập sai 3 lần. Nếu nhập sai thêm 1 lần nữa, tài khoản sẽ bị khóa."
Lần 4 sai: "Tài khoản đã bị khóa 1 phút..." → lockCount = 1


Kịch bản 2: Bị khóa và thử lại
Sau 1 phút → Tự động unlock → Nhập sai 4 lần nữa
→ "Tài khoản đã bị khóa 5 phút..." → lockCount = 2

Sau 5 phút → Tự động unlock → Nhập sai 4 lần nữa
→ "Tài khoản đã bị khóa 30 phút..." → lockCount = 3

Sau 30 phút → Tự động unlock → Nhập sai 4 lần nữa
→ "Tài khoản đã bị khóa vĩnh viễn. Vui lòng liên hệ Admin." → Khóa vĩnh viễn

Kịch bản 3: Đăng nhập thành công
Nhập đúng mật khẩu → Reset tất cả (failedAttempts = 0) → Đăng nhập thành công