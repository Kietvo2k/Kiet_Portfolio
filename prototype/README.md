# Kiet — Creative Portfolio

Một prototype portfolio thiên về công nghệ, có thể đổi thành portfolio của bất kỳ ai. Giao diện tiếng Việt với các nhãn thiết kế tiếng Anh. Tông kem, typography lớn, điểm nhấn cam và artwork chrome được tạo riêng.

## Chạy ngay, không cần build

Giải nén rồi mở **`index.html`** bằng Chrome, Edge, Safari hoặc Firefox hiện đại. Không cần tài khoản, API key hay Node.js để xem.

Nếu trình duyệt hạn chế clipboard khi mở file trực tiếp, bạn có thể dùng máy chủ tĩnh:

```sh
# Chạy trong thư mục prototype
python -m http.server 5173
```

Mở http://localhost:5173. Có thể dùng `python3` thay `python` tùy máy.

Hoặc với Node.js 20+:

```sh
npm install
npm start
```

Đây là thư mục độc lập. Website cũ ở thư mục gốc repository không bị thay thế. Để đưa prototype lên làm website chính, dùng **nội dung bên trong `prototype/`** làm thư mục publish.

## Cá nhân hóa trong 5 phút

Mở **`site.config.js`** bằng VS Code hoặc bất kỳ trình soạn thảo code nào, lưu lại rồi refresh trình duyệt.

| Bạn muốn đổi | Trường trong cấu hình |
| --- | --- |
| Họ tên, logo chữ, chữ cái đại diện | `name`, `shortName`, `initials` |
| Ảnh đại diện | `avatar: "assets/avatar.webp"` (để trống sẽ dùng chữ cái) |
| Chức danh và nơi sống | `role`, `location`, `timezone` |
| Trạng thái nhận hợp tác | `available`, `availability` |
| Tiêu đề và lời giới thiệu đầu trang | `hero` |
| Artwork đầu trang | `hero.artwork`, `hero.artworkAlt` |
| Câu chuyện, nguyên tắc, hành trình | `about` |
| Bộ công cụ | `skills` |
| Sản phẩm | `projects` |
| Email và GitHub | `email`, `emailIsPlaceholder`, `github` |
| Màu, chế độ mặc định | `theme.accent`, `theme.mode` |

Ví dụ:

```js
name: "Tên của bạn",
shortName: "YourName",
initials: "Y",
avatar: "assets/avatar.webp",
role: "Product Designer & Developer",
location: "Đà Nẵng",
timezone: "Asia/Ho_Chi_Minh",
email: "you@yourdomain.com",
emailIsPlaceholder: false,
github: "https://github.com/your-account",
theme: { accent: "violet", mode: "light" },
```

`accent` hỗ trợ `orange`, `violet`, `blue`, `green`; `mode` là `light` hoặc `dark`. Lựa chọn từ Design Studio được lưu riêng trong trình duyệt và ưu tiên hơn cấu hình mặc định; dùng **Khôi phục mặc định** để xem cấu hình mới.

### Thêm sản phẩm

Sao chép một object trong `projects`. Mỗi `id` phải khác nhau, nên dùng chữ thường không dấu và dấu gạch ngang, ví dụ `my-new-app`. Danh mục và số lượng trên giao diện tự cập nhật.

```js
{
  id: "my-new-app",
  title: "Tên sản phẩm",
  category: "Web & Trải nghiệm",
  subtitle: "Một dòng mô tả ngắn.",
  description: "Sản phẩm giúp ai và giải quyết điều gì?",
  year: "2026",
  status: "Đang phát triển",
  visual: "garden",
  image: "assets/my-app.webp", // Không bắt buộc; ưu tiên ảnh này nếu có.
  featured: true,             // Trang chủ lấy tối đa 3 sản phẩm nổi bật.
  tags: ["React", "TypeScript"],
  role: "Vai trò của bạn",
  challenge: "Bài toán cần giải quyết.",
  approach: "Cách bạn giải quyết bài toán.",
  learning: "Kết quả hoặc điều đã học, nên dùng thông tin thực tế.",
  url: "https://your-product.example",
  linkLabel: "Trải nghiệm sản phẩm",
}
```

Nếu không có ảnh, `visual` hỗ trợ 6 minh họa dựng bằng CSS: `garden`, `thermal`, `memories`, `chess`, `orbit`, `particles`. Các minh họa được gắn nhãn **UI CONCEPT**, không phải ảnh chụp thật của dự án. Thay ảnh bằng đường dẫn `assets/...` (tên không có khoảng trắng) hoặc URL HTTPS. Ảnh đại diện và ảnh dự án hỗ trợ WebP, PNG, JPG, SVG, AVIF.

4 liên kết GitHub lấy từ các repository của chủ tài khoản. Nội dung case study là bản nháp có thể sửa, cần đối chiếu và thay bằng vai trò, kết quả, công nghệ thực tế trước khi dùng chính thức. Orbit Notes là ý tưởng mẫu; Particle Field là demo Canvas có sẵn trong prototype.

## Các trang và tương tác

- **Tổng quan:** artwork có parallax theo con trỏ, nhãn nổi, sản phẩm nổi bật, giới thiệu và lời mời kết nối.
- **Sản phẩm:** lọc danh mục, tìm theo tên/mô tả/stack, lưu sản phẩm, case study và sao chép liên kết tới dự án.
- **Về tôi:** profile, nguyên tắc, timeline và bộ công cụ.
- **Playground:** hạt Canvas 3D với hình cầu/vòng xoắn, tốc độ, mật độ, tạm dừng; terminal mô phỏng hỗ trợ `help`, `whoami`, `projects`, `skills`, `contact`, `theme`, `surprise`, `clear`.
- **Kết nối:** kiểm tra trường bắt buộc, sao chép email, soạn email từ form.
- **Command palette:** `Ctrl+K` hoặc `⌘+K`, tìm dự án/trang/lệnh; `↑`, `↓`, `Enter`, `Escape`.
- **Design Studio:** 4 accent, sáng/tối, bật/tắt chuyển động, Design X-ray để hiển thị ranh giới component.

Điều hướng bằng hash (`#work`, `#about`, `#project/smartgarden`…) nên chạy được trên hosting tĩnh, đường dẫn thư mục con và file tải về, không cần cấu hình rewrite. Form dùng `mailto:` hoặc sao chép nội dung, **không có backend gửi thư**. Khi `emailIsPlaceholder: true`, nút soạn email chỉ sao chép bản nháp, không mở email mẫu.

Không có API AI đang chạy trong website. AI là lĩnh vực nội dung của portfolio; terminal chỉ nhận danh sách lệnh có sẵn và không thực thi shell. Màu sắc, chế độ chuyển động và bookmark được lưu cục bộ, không gửi dữ liệu tới máy chủ.

Hoạt ảnh tôn trọng `prefers-reduced-motion`; có thể chủ động bật lại trong Design Studio. Canvas tự dừng khi đổi tab hoặc rời Playground. Font, favicon và artwork đã được đóng gói cục bộ để có thể xem offline.

## Sửa sâu hơn

```text
index.html        Khung trang, menu, footer và dialog
site.config.js    Nội dung cá nhân, dự án và mặc định giao diện
app.js            Render trang, router, Canvas, tìm kiếm và tương tác
styles.css        Design tokens, bố cục, hiệu ứng, minh họa CSS và responsive
assets/           Font, giấy phép font, favicon, artwork và ảnh của bạn
types.d.ts        Kiểu dữ liệu cấu hình, gợi ý khi chỉnh bằng editor
tests/            Kiểm thử DOM và logic bằng Node.js + jsdom
```

Đổi văn bản giao diện cố định trong `index.html` / các hàm `*Page()` của `app.js`. Đổi màu tùy ý trong biến CSS đầu `styles.css`. Đổi favicon trong `assets/favicon.svg`. Kiểm tra trên điện thoại sau khi thay các tiêu đề dài.

## Kiểm tra khi phát triển

```sh
npm install
npm run lint
npm run typecheck
npm test
```

Không có build step hay runtime dependency. Các package npm chỉ phục vụ máy chủ tĩnh và kiểm tra mã. Có thể bỏ `node_modules`, `tests` và các file cấu hình công cụ khi publish.

## Publish

Dùng Netlify, Vercel, Cloudflare Pages hoặc hosting tĩnh bất kỳ:

- Thư mục publish: `prototype` nếu dùng cả repository; `.` nếu dùng bản ZIP đã giải nén.
- Build command: để trống.
- Website chạy bằng `index.html`; không cần cấu hình SPA rewrite.

Với GitHub Pages từ repository gốc, có thể truy cập đường dẫn `/prototype/` nếu cả thư mục được xuất bản. Nếu muốn làm trang gốc, đưa nội dung thư mục này vào nguồn publish của bạn.

## Thiết kế & tài nguyên

Lấy cảm hứng từ tinh thần component tương tác, hero động và card của [21st.dev](https://21st.dev/). Không sao chép component trả phí hoặc mã từ registry. Các tương tác và artwork CSS được viết riêng.

Artwork chrome/cam được tạo bằng AI cho prototype. Font DM Sans và Space Grotesk theo SIL Open Font License; giấy phép có trong `assets/`. Không sử dụng analytics hoặc CDN bên ngoài.
