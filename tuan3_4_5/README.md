# Tuần 5 — Đăng nhập & Quản lý User

Angular app port lại các trang đăng nhập/đăng ký/quên-đổi mật khẩu + CRUD user, gọi API thật [reqres.in](https://reqres.in).

## Chạy app

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
