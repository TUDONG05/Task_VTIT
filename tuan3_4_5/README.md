# Tuần 3-4-5 — Đăng nhập & Quản lý User (Angular)

Ứng dụng Angular gồm các trang đăng nhập / đăng ký / quên-đổi mật khẩu và CRUD user, gọi API thật của [reqres.in](https://reqres.in).

## Yêu cầu

- Node.js + npm (dùng `npm@11.16.0` theo `packageManager` trong `package.json`)
- Angular CLI 22 (đi kèm qua `devDependencies`, không cần cài global)

## Cài đặt & chạy

```bash
cd angular-app
npm install
npm start        # ng serve, mở http://localhost:4200
```

Trước khi chạy, tạo file cấu hình từ mẫu và điền API key:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

```ts
// src/environments/environment.ts
export const environment = {
  reqresApiUrl: 'https://reqres.in/api',
  reqresApiKey: 'YOUR_REQRES_API_KEY' // lấy free tại reqres.in
};
```

### Các lệnh khác

```bash
npm run build   # build production vào dist/
npm run watch   # build lại khi có thay đổi (development)
npm test        # unit test (Vitest)
```

## Tài khoản đăng nhập

App gọi thật `POST /api/login`, reqres.in chỉ chấp nhận đúng 1 email:

```
Email:    eve.holt@reqres.in
Mật khẩu: bất kỳ, tối thiểu 6 ký tự (ví dụ: cityslicka)
```

Email khác sẽ bị API trả lỗi "user not found". Đăng nhập sai quá 5 lần liên tiếp sẽ khoá form — đếm ở phía client trong `AuthService` (`core/services/auth.ts`), reset khi đăng nhập thành công.

## Chức năng

| Trang | Route | Mô tả |
| --- | --- | --- |
| Đăng nhập | `/dang-nhap` | Gọi `POST /api/login`, giới hạn 5 lần thử sai |
| Đăng ký | `/dang-ky` | Gọi `POST /api/register` |
| Quên mật khẩu | `/quen-mat-khau` | Form yêu cầu đặt lại mật khẩu |
| Đổi mật khẩu | `/doi-mat-khau` | Form đổi mật khẩu |
| Danh sách user | `/users` | `GET /api/users`, phân trang, yêu cầu đăng nhập |
| Thêm user | `/users/add` | `POST /api/users`, yêu cầu đăng nhập |
| Sửa user | `/users/edit/:id` | `PUT /api/users/:id`, yêu cầu đăng nhập |

Các route `/users*` được bảo vệ bởi `authGuard` (`core/guards/auth-guard.ts`), dựa trên trạng thái `AuthService.isAuthenticated` (lưu trong `sessionStorage`).

### Kiến trúc luồng dữ liệu user

```
                     Angular
                        │
                 UserComponent
                        │
                inject UserService
                        │
                        ▼
                ┌───────────────┐
                │  UserService  │
                └───────┬───────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
      RxJS/HttpClient              Signals
          │                           │
    GET POST PUT DELETE          users()
          │                      total()
          ▼                           │
      ReqRes API                      │
          │                           │
          └─────────────┬─────────────┘
                        ▼
                     UI update
```

### Ghi chú về dữ liệu user

Các thao tác ghi (create/update/delete) của reqres.in là API giả lập, **không lưu lại thật** nên sẽ không thấy trong lần `GET /users` tiếp theo. `UserService` (`core/services/user.ts`) tự lưu các thay đổi cục bộ và ghép chồng lên kết quả từ server để hiển thị đúng ngay sau khi thao tác:

| Thao tác | API | Xử lý cục bộ |
| --- | --- | --- |
| **Create** | `POST /users` | Gán id âm tạm thời, thêm vào đầu danh sách (`localCreated`) |
| **Read** | `GET /users` | Lọc user đã xoá, ghép đè user đã sửa, chèn user vừa tạo |
| **Update** | `PUT /users/:id` | Lưu bản ghi mới vào `localUpdates`, áp lại mỗi lần fetch |
| **Delete** | `DELETE /users/:id` | Lưu id vào `localDeletes`, loại khỏi danh sách hiển thị |

### Avatar qua proxy dev-server

reqres.in trả avatar với header `Cross-Origin-Resource-Policy: same-origin` khiến browser chặn tải ảnh cross-origin trực tiếp. Dev-server (`proxy.conf.json`) proxy `/avatars/*` → `https://reqres.in/img/faces`, giúp ảnh được tải cùng-origin với app. `UserService` tự đổi URL avatar sang dạng `/avatars/...`.

### Header API key

`reqresApiKeyInterceptor` (`core/interceptors/reqres-api-key-interceptor.ts`) tự đính kèm `environment.reqresApiKey` vào header `x-api-key` cho mọi request tới `reqresApiUrl`.

## Cấu trúc thư mục

```
angular-app/
├── proxy.conf.json                 # proxy avatar khi chạy ng serve
└── src/
    ├── environments/               # environment.ts (bỏ qua git) + file mẫu
    └── app/
        ├── core/
        │   ├── guards/auth-guard.ts
        │   ├── interceptors/reqres-api-key-interceptor.ts
        │   ├── models/user.ts
        │   └── services/           # AuthService, UserService
        ├── features/
        │   ├── login/
        │   ├── register/
        │   ├── forgot-password/
        │   ├── change-password/
        │   └── users/
        │       ├── user-list/
        │       └── user-form/
        └── shared/
            ├── auth-layout/        # layout dùng chung cho các trang auth
            └── styles/_auth-form.scss
```
