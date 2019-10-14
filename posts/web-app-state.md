---
title: Web application state
published: true
date: 2019-10-14 22:00:00
tags: web, cookie, session
description: State of web application and using them
image:
---

## Cookie
Lưu trữ thông tin trong trình duyệt của người dùng. Trình duyệt đính kèm cookie trong mỗi request. Vì thế thông tin lưu trong cookie nên tối thiểu. Phần lớn kích thước cookie là 4KB và có số lượng hạn chế cho mỗi domain. Cookie có thời hạn sử dụng.

Thường lưu thông tin cơ bản, không quan trọng như theme name.

Với ASP.NET CORE và C#.
- Get: ```Request.Cookies```
- Set: ```Response.Cookies```

## Query string
Có giới hạn kích thức query string và tùy thuộc trình duyệt

## Hidden Fields

## TempData
TempData được implemented giựa trên cookie hay session state.
Truyền data qua các actions, views.

```TempData.Keep() hay TempData.Peek()```

## ViewData/ViewBag
Truyền data từ action lên view.

## Session state
Trong ASP.NET Core, session state dùng để lưu trữ dữ liệu user trong khi sử dụng ứng dụng. Nó cùng một store được quản lý bỡi application để persist data qua các request từ một client. Thường cache thông tin quan trọng trong session để tối ưu hiệu năng.

ASP.NET Core quản lý session state vỡi cung cấp một cookie cho client, cookie này lưu một session ID.

Vài lưu ý khi làm việc với session:
- Một session cookie là cụ thể cho browser session
- Khi một browser session kết thúc, nó xóa session cookie.
- Khi ứng dụng nhận một cookie cho một session đã hết hạn, nó tạo một session mới và dùng lại session cookie đó.
- Ứng dụng không duy trì các session rỗng.
- Ứng dụng duy trì một session trong một quảng thời gian sau lần request cuối. Mặc định là 20 phút.
- Session state là lý tưởng để lưu thông tin người dùng cụ thể cho một phiên, nhưng không yêu cầu lưu trữ lâu dài - dùng giữa các phiên.
- Không có cơ chế mặc định để thông báo ứng dụng khi client đóng trình duyệt hay xóa session cookie, hay nó hết hạn.

Cấu hình session state trong ```ConfigureServices()```, enable session state trong ```Configure()``` trong ```Startup.cs```. Thứ tự cấu hình là quan trọng: ```UseSession()``` trước ```UseMVC()```.

```HttpContext.Session```