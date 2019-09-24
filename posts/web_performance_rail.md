---
title: Measure Performance with the RAIL Model
published: true
date: 2019-09-23 22:00:00
tags: web, performance, rail
description:
image:
---

Đây là bài trong chuỗi bài ngâm cứu về hiệu năng ứng dụng web

- [Why Performance Matters](https://thunguyen1012.github.io/posts/web_performance_why_it_matters.html)
- **[Measure Performance with the RAIL Model](https://thunguyen1012.github.io/posts/web_performance_rail.html)**
- [Loading Performance](https://thunguyen1012.github.io/posts/web_performance_loading_performance.html)
- [Rendering Performance](https://thunguyen1012.github.io/posts/web_performance_rendering_performance.html)

RAIL là một mô hình hiệu suất lấy người dùng làm trọng tâm, nó chia nhỏ trãi nghiệm của người dùng thành các hoạt động chính. Các mục tiêu và hướng dẫn của RAIL nhằm mục đích giúp các lập trình viên và designer đảm bảo một trãi nghiệm người dùng tốt. Bỡi đặt ra một cấu trúc cho việc suy nghĩ về hiệu năng, RAIL cho phép các designer và các lập trình viên chắc chắn hướng đến công việc có tác động cao nhất trên trãi nghiệm người dùng.

Mỗi web app có bốn khía cạnh rõ ràng trong vòng đời của nó và hiệu năng phân bổ vào từng khía cạnh theo các cách khác nhau:
![4 part of RAIL performance model](./img/rail.png '4 part of RAIL performance model')

## Goals and guidelines

- Goal: các thang đo hiệu năng chính liên quan đến trãi nghiệm người dùng. Những thang này có tính ổn định cao.
- Guideline: các khuyến khích để đạt được goal. Có thể cụ thể đến các điều kiện thiết bị, mạng. Có tính thay đổi cao.

## Focus on the user

Làm người dùng trở thành tâm điểm của nỗ lực hiệu năng của bạn. Bảng sau mô tả thang đo chính về nhận thức của người dùng vè performance delay:

<table>
  <thead>
      <tr>
          <th colspan=2>User Perception Of Performance Delays</th>
      </tr>
  </thead>
  <tbody>
    <tr>
      <td>0 to 16ms</td>
      <td>Người dùng nhạy cảm trong việc theo dõi chuyển động và không thích animation không mượt. Sẽ là mượt nếu 60 khung hình mới được render mỗi giây. 16ms/frame, kể cả thời gian cho trình duyệt vẽ frame lên màn hình, giành cho app khoản 10ms để tạo một frame</td>
    </tr>
    <tr>
      <td>0 to 100ms</td>
      <td>Phản hồi tương tác người dùng trong khoảng thời gian này, người dùng cảm thấy kết quả là tức thì</td>
    </tr>
    <tr>
      <td>100 to 300ms</td>
      <td>Một chút chậm</td>
    </tr>
    <tr>
      <td>300 to 1000ms</td>
      <td>Cảm giác như là tự nhiên và đang thực thi các task.</td>
    </tr>
    <tr>
      <td>1000ms or more</td>
      <td>Người dùng không tập trung vào việc họ đang làm trên web</td>
    </tr>
    <tr>
      <td>10000ms or more</td>
      <td>Người dùng bế tắc và muốn từ bỏ, có thể không muốn quay lại web này nữa</td>
    </tr>
  </tbody>
</table>

Người dùng có vẻ kiên nhẫn hơn khi dùng mobile so với máy tính.

## Response: process events in under 50ms

Goal: Hoàn tất công việc liên quan đến việc nhập dữ liệu của người dùng trong 100ms.
Guidelines:

- Xử lý các user input event trong 50ms để đảm bảo một phản hồi trực quan trong 100ms. Cái này áp dụng cho phần lớn các input như click button, toggling form controls, hay bắt đầu các animation, không áp dụng cho touch drag hay scroll.
- Có thể nghe không thuận tai: không luôn phản hồi ngay lập tức với user input. Bạn có thể sử dụng 100ms này để làm những việc tốn công khác, nhưng không được block người dùng. Nếu có thể thì xử lý ở background.
- Với các hành động lâu hơn 50ms thì luôn cung cấp feedback.

**50ms hay 100ms?**
Goal là dưới 100ms, vậy sao budget chỉ là 50ms? Vì thường có nhiều công việc khác đang được xử lý ngoài việc xử lý input và công việc đó chiếm một phần thời gian có sẵn để đáp ứng input có thể chấp nhận được. Nếu một ứng dụng đang thực hiện công việc trong các khoảng thời gian 50ms trong lúc idle, điều đó có nghĩa là input có thể vào hàng đợi và đợi tối đa đến 50ms nếu nó xảy ra trong quá trình thực hiện một chunk của công việc. Giải quyết điều này, sẽ là an toàn để giả định rằng chỉ có 50ms còn lại để xử lý input trong thực tế.

![How idle tasks affect input response budget.](./img/rail-response-details.png 'How idle tasks affect input response budget.')

## Animation: produce a frame in 10ms

Goals:

- Tạo mỗi frame trong một animation tối đa là 10ms. Về kỹ thuật, budget tối đa cho mỗi frame là 16ms (1000ms / 60 frames per second ~ 16ms), nhưng các trình duyệt cần khoảng 6ms cho mỗi frame.
- Sự mịn màng thị giác. Người dùng sẽ chú ý khi tốc độ khung hình khác nhau.

Guidelines:

- Với các điểm áp lực cao như animation thì key là đừng làm gì không cần thiết và nếu phải làm thì làm tối thiểu. Khi có thể, hãy sử dụng phản hồi 100ms để tính toán trước công việc nặng ký để có thể đảm bảo được mốc 60fps.
- Tham khảo [Rendering Performance](https://thunguyen1012.github.io/posts/web_performance_rendering_performance.html) để xem các chiến thuật tối ưu animation.
- Nhận biết các dạng animation. Animation không chỉ là các hiệu ứng UI đặc biệt. Các tương tác sau cũng được xem là animation
  - Visual animation: vào, ra, xoay, loading indicator.
  - Scrolling: bắt đầu scroll, scroll
  - Dragging

## Idle: maximize idle time
Goal: Tối đa idle time để tăng cơ hội để trang phản hồi input người dùng trong 50ms.
Guidelines:
- Dùng idle time để hoàn tất deferred work. Như cho việc load trang ban đầu, load tối thiểu data có thể, sau đó dùng idle time để load phần còn lại.
- Thực hiện công việc trong idle time tối đa là 50ms.
- Nếu người dùng tương tác với trang trong quá trình idle time work thì tương tác của người dùng luôn ở độ ưu tiên cao nhất và interrupt the idle time work.

## Load: deliver content and become interactive in under 5 seconds


## Tools for measuring RAIL

## REF

- https://developers.google.com/web/fundamentals/performance/rail
