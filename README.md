# 🎮 Cờ Caro Pro - Game Cờ Caro Thông Minh

Một trò chơi cờ caro (Gomoku) hiện đại với AI thông minh, giao diện đẹp mắt và nhiều tính năng nâng cao.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Tính Năng Nổi Bật

### 🤖 AI Thông Minh
- **Thuật toán Minimax** với Alpha-Beta pruning
- **3 mức độ khó:**
  - **Dễ**: Đi ngẫu nhiên, phù hợp cho người mới
  - **Trung bình**: Kết hợp 50% ngẫu nhiên và 50% thông minh
  - **Khó**: Sử dụng đầy đủ thuật toán Minimax, rất khó thắng!
- Heuristic evaluation thông minh dựa trên:
  - Số quân liên tiếp
  - Số đầu mở (open ends)
  - Vị trí chiến lược

### 🎯 Chế Độ Chơi
- **Người vs Người**: Chơi với bạn bè trên cùng một thiết bị
- **Người vs Máy**: Thách thức với AI thông minh

### 🎨 Giao Diện Đẹp Mắt
- **Dark Mode**: Chế độ tối bảo vệ mắt
- **Animations mượt mà**: Hiệu ứng đặt quân, thắng/thua
- **Particles**: Hiệu ứng pháo hoa màu sắc khi thắng
- **Responsive**: Tối ưu cho mọi thiết bị (Desktop, Tablet, Mobile)

### 📐 Tùy Chọn Linh Hoạt
- **Kích thước bàn cờ**: 10×10, 15×15, hoặc 19×19
- **Âm thanh**: Bật/tắt hiệu ứng âm thanh
- **Đồng hồ**: Theo dõi thời gian chơi

### ⚡ Tính Năng Nâng Cao
- **↶↷ Undo/Redo**: Hoàn tác và làm lại nước đi không giới hạn
- **💡 Gợi ý**: Nhận gợi ý nước đi tốt nhất từ AI
- **📜 Lịch sử**: Xem lại toàn bộ lịch sử nước đi
- **📊 Thống kê**: Theo dõi tỷ lệ thắng/thua/hòa
- **💾 Auto-save**: Tự động lưu game, tiếp tục sau

### ⌨️ Phím Tắt
- `Ctrl + Z`: Undo (Hoàn tác)
- `Ctrl + Y` hoặc `Ctrl + Shift + Z`: Redo (Làm lại)
- `H`: Hiển thị gợi ý nước đi

## 🚀 Cách Sử Dụng

### Cài Đặt
```bash
# Clone repository
git clone https://github.com/thanhinfore/cocaro.git

# Mở file index.html trong trình duyệt
open index.html
```

### Chơi Game
1. **Chọn cài đặt**: Chế độ chơi, độ khó AI, kích thước bàn cờ
2. **Nhấn "Bắt Đầu Game Mới"** để bắt đầu
3. **Đặt quân**: Click vào ô trống để đặt quân
4. **Chiến thắng**: Xếp 5 quân liên tiếp (ngang, dọc, hoặc chéo)

## 🎯 Luật Chơi

- Hai người chơi lần lượt đặt quân **X** và **O** trên bàn cờ
- Người đầu tiên xếp được **5 quân liên tiếp** (ngang, dọc, hoặc chéo) sẽ **thắng**
- Nếu bàn cờ đầy mà không ai thắng thì kết quả là **hòa**

## 🛠️ Công Nghệ

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling với CSS Variables và Animations
- **JavaScript (Vanilla)**: Game logic và AI
- **Web Audio API**: Hiệu ứng âm thanh
- **Canvas API**: Hiệu ứng particles
- **LocalStorage**: Lưu trữ game state và statistics

## 📱 Responsive Design

Game được tối ưu cho mọi kích thước màn hình:
- **Desktop**: Trải nghiệm đầy đủ với lịch sử nước đi bên cạnh
- **Tablet**: Layout điều chỉnh phù hợp với màn hình trung bình
- **Mobile**: Giao diện thu gọn, dễ sử dụng trên điện thoại

## 🧠 Thuật Toán AI

### Minimax với Alpha-Beta Pruning
AI sử dụng thuật toán Minimax với Alpha-Beta pruning để tìm nước đi tốt nhất:

```javascript
function minimax(depth, alpha, beta, isMaximizing) {
    // Check terminal states
    if (winner) return score;
    if (depth === 0) return evaluateBoard();

    // Minimax with pruning
    if (isMaximizing) {
        // Maximize score for AI
    } else {
        // Minimize score for opponent
    }
}
```

### Heuristic Evaluation
- **5 quân liên tiếp**: 100,000 điểm (thắng)
- **4 quân + 2 đầu mở**: 10,000 điểm (rất nguy hiểm)
- **4 quân + 1 đầu mở**: 1,000 điểm (cần chặn)
- **3 quân + 2 đầu mở**: 1,000 điểm (tiềm năng cao)
- **3 quân + 1 đầu mở**: 100 điểm
- **2 quân + 2 đầu mở**: 100 điểm

### Tối Ưu Hóa
- **Relevant Cells**: Chỉ xét các ô gần quân đã đặt (trong bán kính 2 ô)
- **Alpha-Beta Pruning**: Cắt tỉa các nhánh không cần thiết
- **Depth Limiting**: Giới hạn độ sâu tìm kiếm để AI phản hồi nhanh

## 💾 Lưu Trữ Dữ Liệu

Game sử dụng LocalStorage để lưu:
- **Game State**: Trạng thái bàn cờ hiện tại
- **Move History**: Lịch sử tất cả các nước đi
- **Statistics**: Thống kê thắng/thua/hòa
- **Settings**: Cài đặt người dùng (dark mode, âm thanh)

## 🎨 Themes

### Light Mode (Mặc định)
- Nền gradient tím-xanh
- Màu sáng, dễ nhìn ban ngày

### Dark Mode
- Nền tối, giảm ánh sáng xanh
- Phù hợp cho chơi ban đêm
- Bảo vệ mắt

## 🔊 Âm Thanh

Hiệu ứng âm thanh được tạo bằng Web Audio API:
- **Move**: Âm thanh khi đặt quân (600 Hz beep)
- **Win**: Giai điệu chiến thắng (C-E-G chord)
- **Draw**: Âm thanh hòa
- **Hint**: Âm thanh gợi ý (800 Hz beep)

## 🤝 Đóng Góp

Contributions, issues và feature requests đều được chào đón!

1. Fork dự án
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License.

## 👤 Tác Giả

**Thanh**
- GitHub: [@thanhinfore](https://github.com/thanhinfore)

## 🙏 Cảm Ơn

- Cảm ơn thuật toán Minimax và Alpha-Beta Pruning
- Cảm ơn Web Audio API cho hiệu ứng âm thanh
- Cảm ơn Canvas API cho hiệu ứng particles

## 📝 Changelog

### Version 2.0 (Current)
- ✅ Thêm AI thông minh với Minimax algorithm
- ✅ Thêm 3 mức độ khó
- ✅ Thêm Undo/Redo
- ✅ Thêm lịch sử nước đi
- ✅ Thêm gợi ý nước đi
- ✅ Thêm Dark Mode
- ✅ Thêm hiệu ứng âm thanh
- ✅ Thêm particles animation
- ✅ Thêm đồng hồ đếm giờ
- ✅ Thêm thống kê
- ✅ Thêm tùy chọn kích thước bàn cờ
- ✅ Cải thiện UI/UX
- ✅ Auto-save với LocalStorage

### Version 1.0
- ✅ Game cờ caro cơ bản
- ✅ Chế độ 2 người chơi
- ✅ Kiểm tra thắng/thua
- ✅ UI đơn giản

---

**Chúc bạn chơi game vui vẻ! 🎮🎯**
