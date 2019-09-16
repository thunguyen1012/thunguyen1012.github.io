---
title: Shadow DOM
published: true
date: 2019-09-15 22:00:00
tags: html, shadow dom, component
description: Shadow DOM là một chuẫn web cung cấp đóng gói style và markup...
image:
---
## what is shadow DOM?
Shadow DOM loại bỏ tính dễ vỡ của xây dựng ứng dụng web. Dễ vỡ từ tính tự nhiên của HTML, CSS, và JS. Ví dụ, khi tạo mới một HTML id/class, không ai cho bạn biết có conflict nào không. Rồi ```!important``` trong CSS.

Shadow DOM fixes CSS and DOM. Shadow DOM giới thiệu scoped style. Bạn có thể đóng gói CSS với markup, ẩn chi tiết, và author self-contained components trong JS.

Shadow DOM là một trong bốn chuẩn Web Component: HTML template, Shadow DOM, [Custom element](https://thunguyen1012.github.io/posts/web_components_customelements.html), và HTML import.

Shadow DOM được thiết kế như là một tool để xây dựng component-based app. Vì thế, nó cung cấp giải pháp cho các vấn đề phổ biến trong lập trình web:
- Isolated DOM: DOM của component là tự quản lý (ví dụ: ```document.querySelector()``` sẽ không trả về các node trong shadow DOM của component.)
- Scoped CSS: CSS định nghĩa trong shadow DOM được scope trong đó. Nội bất xuất, ngoại bất nhập.
- Composition: declarative, markup-based API
- Simplifies CSS: Scoped DOM cho phép bạn tạo các CSS selector đơn giản. Ít lo lắng về conflict.
- Productivity: App sẽ là tổng hợp các DOM thay vì một DOM siêu bự.

## Create shadow DOM
HTML dễ cho người đọc hiểu, nhưng khó cho máy - DOM xuất hiện. Khi trình duyệt tải một trang web, có nhiều việc diễn ra. Một trong số đó là chuyển HTML thành một live document. Cơ bản, để hiểu cấu trúc của trang, trình duyệt parse HTML thành một data model. Trình duyệt thể hiện cấu trúc của HTML bỡi tạo một cấu trúc cây: DOM. DOM có các thuộc tính, phương thức, và có thể được xử lý bỡi lập trình.

```javascript
const header = document.createElement('header');
const h1 = document.createElement('h1');
h1.textContent = 'Hello DOM';
header.appendChild(h1);
document.body.appendChild(header);
```

Tạo HTML
```html
<body>
  <header>
    <h1>Hello DOM</h1>
  </header>
</body>
```

DOM...in the shadows
Shadow DOM là DOM với 2 điểm khác: 1) Cách nó được tạo và sử dụng. 2) Mối tương quan của nó với phần còn lại của trang.
Cơ bản, bạn tạo các DOM node và append chúng như là con của element khác. Với shadow DOM, bạn tạo một scoped DOM tree và gắn nó với một element, nhưng phân tách với các của thực sự của element. Tree này được gọi là **shadow tree**. Element được gắn shadow tree vào gọi là **shadow host**. Mọi thứ bạn thêm trong shadow trở nên cục bộ trong hosting element, kể cả ```<style>```.

### Creating shadow DOM for a custom element

## Composition and slots
### Terminology: light DOM vs. shadow DOM
### The <slot> element

## Styling
### Component-defined styles
### Styling based on context
### Styling distributed nodes
### Styling a component from the outside

## Advanced topics
### Creating closed shadow roots (should avoid)
### Working with slots in JS
### The Shadow DOM event model
### Handling focus

## Tips & Tricks
### Use CSS containment
### Resetting inheritable styles
### Finding all the custom elements used by a page
### Creating elements from a ```<template>```

## History & browser support

## Conclusion