---
title: Why Performance Matters
published: true
date: 2019-09-23 22:00:00
tags: web, performance
description: Sự quan trọng của hiệu năng...
image:
---

Đây là bài đầu tiên trong chuỗi bài ngâm cứu về hiệu năng ứng dụng web

- **[Why Performance Matters](https://thunguyen1012.github.io/posts/web_performance_why_it_matters.html)**
- [Measure Performance with the RAIL Model](https://thunguyen1012.github.io/posts/web_performance_rail.html)
- [Loading Performance](https://thunguyen1012.github.io/posts/web_performance_loading_performance.html)
- [Rendering Performance](https://thunguyen1012.github.io/posts/web_performance_rendering_performance.html)

## Performance

Hiệu năng là vấn đề phổ biến của ứng dung web. Site có nhiều tính năng hơn, phải đáp ứng với dãy các điều kiện mạng, thiết bị khác nhau.
Các vấn đề hiệu năng rất rộng, từ chậm xíu cho đến không truy cập được hay không phản hồi.

Người dùng thường sẽ không quay lại site đã cung cấp hiệu năng tệ: quá chậm để hiện nội dung, tương tác không mịn, tốn quá nhiều tài nguyên mạng. Điều này ảnh hưởng đến mong muốn người dùng tương tác với site: không bán được sản phẩm, không xem bài viết,..

## Where to go from here

Một vài điểm bạn cần chú ý khi nói về hiệu năng.

### Mind what resources you send

Kiểm tra xem bạn gởi gì đến người dùng.

- Có đáng để sử dụng những thư viện UI lớn để xây dựng website của bạn? CSS is a render blocking resource, với lượng lớn CSS có thể làm giảm quá trình render đáng kể. Loại bỏ những cái không cần thiết khi có thể.

- Có đáng để sử dụng những thư viện JS lớn? Nếu có thể nên tận dụng browser APIs (Ví dụ: `querySelector, addEventListener,...`)

- Không phải web nào cũng nên là SPA. SPA cần dùng nhiều javascript: phải được tải về, parsed, compiled, và thực thi. Với các site tin tức, blog nên là multipage truyền thống và được tối ưu tốt.

### Mind how you send resources

Truyền tải hiệu quả là yếu tố sống còn để xây dựng trải nghiệm:

- Sử dụng HTTP/2. Giải quyết những vấn đề hiệu năng của HTTP/1.1 như hạn chế request đồng thời và không nén header.

- Tải sớm các tài nguyên. ```rel=preload``` cho phép tải sớm các tài nguyên quan trọng trước. Điều này có thể tác động tích cực đến page rendering, và giảm Time to Interactive. ```rel=preconnect``` dùng để hoãn mở các connection mới cho các tài nguyên được host trên các third party domain.

- Các site hiện đại dùng rất nhiều JS và CSS. Từng thịnh hành việc bundle các style và JS vào các bundle trong môi trường HTTP/1. Thực hiện điều này là để giảm số lượng request. Điều này không còn là vấn đề với HTTP/2, hỗ trợ các request đồng thời. Cân nhắc phân tách tài nguyên thành nhiều bundle nhỏ (đủ dùng cho trang hiện tại).

### Mind how much data you send
- Minify text assets: loại bỏ những khoảng trắng không cần thiết, các comment, và những tài nguyên dạng text khác. Uglification in JS để rút ngắn tên biến và tên phương thức. SVGO cho SVG.

- Cấu hình server để nén tài nguyên. GZIP, Brotli.

- Tối ưu image để đảm bảo dùng ít dữ liệu hình khi có thể.

- Dùng định dạng image khác: WebP (ít data hơn JPEG, PNG trong khi vẫn duy trì chất lượng hiển thị cao), JPEG XR

- Deliver images responsively. Dùng thuộc tính ```srcset``` trong thẻ ```<img>``` để chỉ định mảng các image để cho trình duyệt chọn khi thể hiện trên các kích thước khác nhau. Có thể dùng ```<picture>``` để giúp trình duyệt chọn định dạng hình tối ưu nhất (ví dụ: WebP thay vì JPEG hay PNG), hay các đối xử khác nhau cho hình với các kích thước màn hình khác nhau.

- Dùng video thay cho GIF. Với cùng chất lượng, video thường chỉ nặng 80% so với GIF.

- Client hint: hướng dẫn trình duyệt load resource dựa trên điều kiện mạng và thiết bị. Các thông tin ```DPR, Width, và Viewport-Width``` trên header có thể giúp bạn cung cấp hình ảnh tốt nhất cho thiết bị và lượng markup phù hợp. ```Save-Data``` có thể giúp deilver ứng dụng nhẹ ký hơn.

- ```NetworkInformation``` API cung cấp thông tin mạng của người dùng.

## REF

- https://developers.google.com/web/fundamentals/performance/why-performance-matters/
