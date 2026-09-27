# Tuần 3-4-5 — Đăng nhập & Quản lý User (Angular)

Ứng dụng Angular gồm các trang đăng nhập / đăng ký / quên-đổi mật khẩu và CRUD user, gọi API thật của [reqres.in](https://reqres.in). Giao diện sử dụng NG-ZORRO, còn RxJS xử lý HTTP, trạng thái loading và tìm kiếm người dùng.

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
  reqresApiUrl: "https://reqres.in/api",
  reqresApiKey: "YOUR_REQRES_API_KEY", // lấy free tại reqres.in
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

| Trang          | Route             | Mô tả                                                 |
| -------------- | ----------------- | ----------------------------------------------------- |
| Đăng nhập      | `/dang-nhap`      | Gọi `POST /api/login`, giới hạn 5 lần thử sai         |
| Đăng ký        | `/dang-ky`        | Gọi `POST /api/register`                              |
| Quên mật khẩu  | `/quen-mat-khau`  | Form yêu cầu đặt lại mật khẩu                         |
| Đổi mật khẩu   | `/doi-mat-khau`   | Form đổi mật khẩu                                     |
| Danh sách user | `/users`          | `GET /api/users`, phân trang, yêu cầu đăng nhập       |
| Thêm user      | `/users/add`      | `POST /api/users`, yêu cầu đăng nhập                  |
| Sửa user       | `/users/edit/:id` | `PUT /api/users/:id`, yêu cầu đăng nhập               |
| Chi tiết user  | `/users/:id`      | Xem thông tin user từ cache hoặc `GET /api/users/:id` |

Các route `/users*` được bảo vệ bởi `authGuard` (`core/guards/auth-guard.ts`), dựa trên trạng thái `AuthService.isAuthenticated` (lưu trong `sessionStorage`).

Danh sách user hỗ trợ tìm theo họ, tên hoặc họ tên đầy đủ. Tìm kiếm có debounce 300 ms, không phân biệt chữ hoa/thường và dấu tiếng Việt, kể cả `đ/Đ`. Do ReqRes không có API tìm kiếm, kết quả được lọc trên dữ liệu của trang hiện tại.

## RxJS đã áp dụng

| RxJS API/operator        | Vị trí                                  | Mục đích                                                                                 |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Observable`             | `AuthService`, `UserService`            | Kiểu dữ liệu cho các request đăng nhập và CRUD user                                      |
| `pipe()`                 | Các service và component                | Ghép nhiều operator thành một luồng xử lý                                                |
| `map()`                  | `AuthService`, `UserService`, tìm kiếm  | Chuyển response API sang model `User`, kết quả đăng nhập và chuẩn hoá từ khoá            |
| `tap()`                  | `AuthService`, `UserService`            | Cập nhật Signals, session và cache cục bộ mà không đổi dữ liệu trong stream              |
| `catchError()`           | `AuthService`, `UserService.fetchOne()` | Chuyển lỗi đăng nhập thành `LoginResult`, xử lý user không tồn tại                       |
| `of()`                   | Các service                             | Trả Observable cho dữ liệu cache, user cục bộ và giá trị fallback                        |
| `throwError()`           | `UserService.fetchOne()`                | Phát lại các lỗi HTTP không phải 404                                                     |
| `finalize()`             | Login, danh sách, form và chi tiết user | Luôn tắt trạng thái loading/submitting dù request thành công hay lỗi                     |
| `debounceTime(300)`      | `UserList`                              | Chờ người dùng ngừng gõ 300 ms trước khi lọc                                             |
| `distinctUntilChanged()` | `UserList`                              | Không lọc lại khi từ khoá chuẩn hoá không thay đổi                                       |
| `startWith('')`          | `UserList`                              | Khởi tạo luồng tìm kiếm với từ khoá rỗng                                                 |
| `toSignal()`             | `UserList`                              | Chuyển `FormControl.valueChanges` từ Observable sang Signal và tự cleanup theo lifecycle |

Luồng tìm kiếm:

```text
FormControl.valueChanges
  → debounceTime(300)
  → map(chuẩn hoá từ khoá)
  → distinctUntilChanged()
  → startWith('')
  → toSignal()
  → computed(filteredUsers)
```

Signals tiếp tục được dùng để lưu state đồng bộ như danh sách user, trang hiện tại, loading và lỗi. RxJS được dùng cho các luồng bất đồng bộ; không thay Signals bằng `BehaviorSubject` khi chưa cần thiết.

## NG-ZORRO đã áp dụng

Dự án dùng `ng-zorro-antd@22`, cùng major version với Angular 22. Locale được đặt thành `vi_VN` trong `app.config.ts`; màu chủ đạo `#ee0033` được cấu hình tại `src/theme.less`.

| Module/component                | Màn hình                           | Mục đích                                |
| ------------------------------- | ---------------------------------- | --------------------------------------- |
| `NzFormModule`, `NzInputModule` | Đăng nhập, thêm/sửa user, tìm kiếm | Form và input theo Ant Design           |
| `NzButtonModule`                | Đăng nhập và quản lý user          | Button primary, link, danger và loading |
| `NzCheckboxModule`              | Đăng nhập                          | Tuỳ chọn lưu mật khẩu                   |
| `NzAlertModule`                 | Đăng nhập và các trang user        | Hiển thị lỗi API/form                   |
| `NzTableModule`                 | Danh sách user                     | Bảng dữ liệu, loading và empty state    |
| `NzPaginationModule`            | Danh sách user                     | Phân trang dữ liệu ReqRes               |
| `NzPopconfirmModule`            | Danh sách user                     | Xác nhận trước khi xoá                  |
| `NzAvatarModule`                | Danh sách, form và chi tiết user   | Avatar và ảnh xem trước                 |
| `NzCardModule`                  | Các trang user                     | Khung nội dung thống nhất               |
| `NzSpinModule`                  | Form và chi tiết user              | Trạng thái đang tải                     |
| `NzDescriptionsModule`          | Chi tiết user                      | Hiển thị thông tin user dạng mô tả      |

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

| Thao tác   | API                 | Xử lý cục bộ                                                |
| ---------- | ------------------- | ----------------------------------------------------------- |
| **Create** | `POST /users`       | Gán id âm tạm thời, thêm vào đầu danh sách (`localCreated`) |
| **Read**   | `GET /users`        | Lọc user đã xoá, ghép đè user đã sửa, chèn user vừa tạo     |
| **Update** | `PUT /users/:id`    | Lưu bản ghi mới vào `localUpdates`, áp lại mỗi lần fetch    |
| **Delete** | `DELETE /users/:id` | Lưu id vào `localDeletes`, loại khỏi danh sách hiển thị     |

### Avatar qua proxy local và production

ReqRes trả avatar với policy có thể khiến browser chặn tải ảnh cross-origin trực tiếp. `UserService` đổi URL avatar sang dạng `/avatars/...`, sau đó:

- Local: `proxy.conf.json` proxy `/avatars/*` → `https://reqres.in/img/faces/*` khi chạy `ng serve`.
- Vercel: `vercel.json` rewrite `/avatars/:path*` → `https://reqres.in/img/faces/:path*` trước SPA fallback.

Nhờ vậy avatar được tải qua cùng origin ở cả môi trường local và production.

### Header API key

`reqresApiKeyInterceptor` (`core/interceptors/reqres-api-key-interceptor.ts`) tự đính kèm `environment.reqresApiKey` vào header `x-api-key` cho mọi request tới `reqresApiUrl`.

## Cấu trúc thư mục

```
angular-app/
├── proxy.conf.json                 # proxy avatar khi chạy ng serve
├── vercel.json                     # build, SPA fallback và proxy avatar production
└── src/
    ├── theme.less                  # theme NG-ZORRO, màu primary
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
        │       ├── user-form/
        │       └── user-detail/
        └── shared/
            ├── auth-layout/        # layout dùng chung cho các trang auth
            └── styles/_auth-form.scss
```
