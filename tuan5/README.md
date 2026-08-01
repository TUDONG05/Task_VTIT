# Tuần 5 — Đăng nhập & Quản lý User

Thư mục này gồm 2 phần độc lập:

1. **Trang tĩnh** (`*.html`, `*.css`, `dang-nhap.js`) — HTML/CSS/JS thuần, validate form phía client.
2. **`angular-app/`** — Angular app port lại các trang trên + thêm CRUD user, gọi API thật [reqres.in](https://reqres.in).

Ảnh dùng chung, nằm ở `../imgs/` (thư mục gốc `Task1/imgs/`), không copy riêng cho từng tuần.

## 1. Trang tĩnh

Mở trực tiếp `dang-nhap.html` bằng trình duyệt (hoặc chạy qua Live Server để tránh lỗi CORS/relative path).

Các trang: `dang-nhap.html`, `dang-ky.html`, `quen-mat-khau.html`, `doi-mat-khau.html`, `danh-sach-nguoi-dung.html`.

**Tài khoản demo** (hardcode trong `dang-nhap.js`, không gọi API):

```
Email:      admin@gmail.com
Mật khẩu:   Admin@123
```

Đăng nhập sai quá 5 lần sẽ khoá nút đăng nhập. Đăng nhập thành công sẽ chuyển sang
`danh-sach-nguoi-dung.html` — trang danh sách user (cột avatar/email/first name/last
name) với thêm/sửa/xoá, hiện chỉ lưu tạm trong bộ nhớ trình duyệt (chưa gọi API).

## 2. Angular app

```bash
cd angular-app
npm install
npm start        # ng serve, mở http://localhost:4200
```

Trước khi chạy, tạo `src/environments/environment.ts` từ `environment.example.ts` và điền `reqresApiKey` (lấy free tại reqres.in).

**Tài khoản đăng nhập** — app gọi thật `POST https://reqres.in/api/login`, reqres.in chỉ chấp nhận đúng 1 email:

```
Email:      eve.holt@reqres.in
Mật khẩu:   bất kỳ, tối thiểu 6 ký tự (ví dụ: cityslicka)
```

Email khác sẽ bị API trả lỗi "user not found". Đăng nhập sai quá 5 lần sẽ khoá form (đếm ở phía client, `AuthService`).

Sau khi đăng nhập thành công sẽ vào `/users` — danh sách user lấy từ `GET /api/users` (reqres.in), có thêm/sửa/xoá qua form (`/users/add`, `/users/edit/:id`). Lưu ý: các thao tác ghi (create/update) của reqres.in là API giả lập, không lưu lại thật nên sẽ không thấy trong lần `GET /users` tiếp theo — code tự chèn dữ liệu vào danh sách cục bộ để hiển thị ngay sau khi thao tác.

### Các lệnh khác

```bash
npm run build   # build production vào dist/
npm test        # unit test (Vitest)
```
