---
title: Custom web component
published: true
date: 2019-09-13 12:00:00
tags: html, custom, component
description: Tùy chỉnh và tạo mới thẻ html là cơ sở để tái sử dụng code, code có module...
image:
---
Trình duyệt cung cấp một công cụ tuyệt vời để cấu trúc các ứng dụng web - HTML. HTML là declarative, portable, được hỗ trợ tốt và dễ làm việc. Thế nhưng các thẻ của HTML lại hạn chế và khó mở rộng.

Custom element là câu trả lời cho HTML hiện đại. Custom element hướng dẫn trình duyệt các kỹ thuật mới trong khi vẫn bảo tồn được các tiện ích của HTML.

## Phần 1: Định nghĩa một element mới 

Để định nghĩa custom element chúng ta sử dụng javascript.
Đối tượng toàn cục ```customElements``` được dùng để tạo mới một tag.

```javascript
class AppDrawer extends HTMLElement {...}
window.customElements.define('app-drawer', AppDrawer);

// Or use an anonymous class if you don't want a named constructor in current scope.
window.customElements.define('app-drawer', class extends HTMLElement {...});
```
Sử dụng
```html
<app-drawer></app-drawer>
```

### Định nghĩa Javascript API cho element
Chức năng của một tag được định nghĩa bỡi dùng một ```class``` kế thừa ```HTMLElement```. Kế thừa ```HTMLElement``` đảm bảo tag kế thừa toàn bộ DOM API

Ví dụ: định nghĩa DOM interface của ```<app-drawer>```:
```javascript
class AppDrawer extends HTMLElement {

  // A getter/setter for an open property.
  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
    this.toggleDrawer();
  }

  // A getter/setter for a disabled property.
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    // Reflect the value of the disabled property as an HTML attribute.
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // Can define constructor arguments if you wish.
  constructor() {
    // If you define a constructor, always call super() first!
    // This is specific to CE and required by the spec.
    super();

    // Setup a click listener on <app-drawer> itself.
    this.addEventListener('click', e => {
      // Don't toggle the drawer if it's disabled.
      if (this.disabled) {
        return;
      }
      this.toggleDrawer();
    });
  }

  toggleDrawer() {
    ...
  }
}

customElements.define('app-drawer', AppDrawer);
```

Trong ví dụ này, chúng ta tạo một drawer có thuộc tính ```open```, ```disabled```, và ```toggleDrawer()```. Nó cũng phản ánh các thuộc tính như là các HTML attributes.

```this``` trong định nghĩa lớp trỏ tới chính DOM element.

#### Các quy tắc trong việc tạo custom element
1. Tên của phải có một gạch ngang **-**. Nhằm phân biệt với những element có sẵn và cũng để đảm bảo tương thích ngược khi tag mới được thêm vào HTML.
2. Không thể khai báo trùng tag. Nếu trùng sẽ có ```DOMException```
3. Custom element không thể tự đóng. Luôn viết thẻ đóng (```<app-drawer></app-drawer>```)

## Custom element reactions
Custom tag có các lifecycle hooks - được gọi là custom element reactions

| Name | Called when |
| ----------- | ----------- |
| ```constructor``` | Một thực thê được tạo hay nâng cấp. Nơi để khởi tạo state, thiết lập các event listener, hay tạo shadow dom |
| ```connectedCallback``` | Được gọi mỗi khi element được chèn vào DOM. Hữu ích cho thiết lập như tải resource hay rendering. Nên trì hoãn xử lý cho đến lúc này |
| ```disconnectedCallback``` | Được gọi mỗi khi element bị loại ra khỏi DOM. Dùng cho việc dọn dẹp. |
| ```attributeChangedCallback(attrName, oldVal, newVal)``` | Được gọi khi một thuộc tính được thêm, loại, cập nhật, hay thay thế. Cũng được gọi khi khởi tạo giá trị khi element được tạo bỡi parser hay nâng cấp. **Note**: chỉ các thuộc tính được liệt kê trong ```observedAttributes``` mới tương tác với callback này |
| ```adoptedCallback``` | Custom element được chuyển vào trong một ```document``` mới |

**Các reaction callback là các xử lý đồng bộ.** Ví dụ, nếu ai đó gọi ```el.setAttribute()``` trên element của bạn, trình duyệt sẽ lập tức gọi ```attributeChangedCallback()```.
```disconnectedCallback()``` sẽ không được gọi khi người dùng tắt tab.

Ví dụ:
```javascript
class AppDrawer extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.
    ...
  }
  connectedCallback() {
    ...
  }
  disconnectedCallback() {
    ...
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    ...
  }
}
```

## Properties và attributes

### Refecting properties to attributes
Thường các thuộc tính HTML đều được phản ánh vào DOM như là thuộc tính của HTML. Ví dụ trên javascript

```javasrcipt
div.id = 'my-id';
div.hidden = true;
```
các giá trị được phản ánh lên live DOM dưới dạng các attribute

```<div id="my-id" hidden>```

Đây là reflecting properties to attributes. Với custom element, chúng ta khai báo setter/getter cho thuộc tính cần mapping. Ví dụ cho ```disabled```

```javascript
...

get disabled() {
  return this.hasAttribute('disabled');
}

set disabled(val) {
  // Reflect the value of `disabled` as an attribute.
  if (val) {
    this.setAttribute('disabled', '');
  } else {
    this.removeAttribute('disabled');
  }
  this.toggleDrawer();
}
```

### Observing changes to attributes
Các element có thể phản ánh các sự thay đổi của attribute bỡi sử dụng ```attributeChangedCallback()``` và mảng ```observedAttributes```

```javascript
class AppDrawer extends HTMLElement {
  ...

  static get observedAttributes() {
    return ['disabled', 'open'];
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  // Only called for the disabled and open attributes due to observedAttributes
  attributeChangedCallback(name, oldValue, newValue) {
    // When the drawer is disabled, update keyboard/screen reader behavior.
    if (this.disabled) {
      this.setAttribute('tabindex', '-1');
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
    // TODO: also react to the open attribute changing.
  }
}
```

## Element upgrades

### Progressively enhanced HTML
Chúng ta không cần đăng ký trước custom element rồi mới sử dụng. Lúc này custom element được xem như là unknown tags. Khi định nghĩa custom element được đăng ký thì sẽ diễn ra "element upgrades".

Để biết khi nào một tag name bắt đầu được định nghĩa, có thể dùng ```window.customElements.whenDefined('tên custom element')```. Hàm trả về một promise và được resolve khi element được định nghĩa.

```javascript
customElements.whenDefined('app-drawer').then(() => {
  console.log('app-drawer defined');
});
```

Ví dụ: đợi cho đến khi các elements con được upgraded
```javascript
<share-buttons>
  <social-button type="twitter"><a href="...">Twitter</a></social-button>
  <social-button type="fb"><a href="...">Facebook</a></social-button>
  <social-button type="plus"><a href="...">G+</a></social-button>
</share-buttons>



// Fetch all the children of <share-buttons> that are not defined yet.
let undefinedButtons = buttons.querySelectorAll(':not(:defined)');

let promises = [...undefinedButtons].map(socialButton => {
  return customElements.whenDefined(socialButton.localName);
));

// Wait for all the social-buttons to be upgraded.
Promise.all(promises).then(() => {
  // All social-button children are ready.
});
```

## Element-defined content
Custom element có thể quản lý nội dung của nó bỡi sử dụng các DOM API bên trong element code

Ví dụ: tạo một custom element có nội dung mặc định
```javascript
customElements.define('x-foo-with-markup', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
  }
  ...
});
```

HTML được tạo ra
```html
<x-foo-with-markup>
 <b>I'm an x-foo-with-markup!</b>
</x-foo-with-markup>
```

### Create an element that uses Shadow DOM
Shaw DOM cung cấp cách để element sở hữu, render, và style một khối DOM tách biệt với phần còn lại của trang

```html
<!-- chat-app's implementation details are hidden away in Shadow DOM. -->
<chat-app></chat-app>
```

Để dùng Shadow DOM trong một custom element, gọi ```this.attachShadow``` trong ```constructor```:

```javascript
let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>:host { ... }</style> <!-- look ma, scoped styles -->
  <b>I'm in shadow dom!</b>
  <slot></slot>
`;

customElements.define('x-foo-shadowdom', class extends HTMLElement {
  constructor() {
    super(); // always call super() first in the constructor.

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
  }
  ...
});
```

Sử dụng

```html
<x-foo-shadowdom>
  <p><b>User's</b> custom text</p>
</x-foo-shadowdom>

<!-- renders as -->
<x-foo-shadowdom>
  #shadow-root
    <b>I'm in shadow dom!</b>
    <slot></slot> <!-- slotted content appears here -->
</x-foo-shadowdom>
```

### Create elements from a ```<template>```
Ôn bài, ```<template>``` element cho phép khai báo các fragment của DOM, những cái này được parsed và có thể được kích hoạt trễ (lúc thực thi). **Template là placeholder lý tưởng cho việc khai báo cấu trúc của một custom element.**

Ví dụ: đăng ký một element với nội dung Shadow DOM từ một ```<template>```

```html
<template id="x-foo-from-template">
  <style>
    p { color: green; }
  </style>
  <p>I'm in Shadow DOM. My markup was stamped from a &lt;template&gt;.</p>
</template>

<script>
  let tmpl = document.querySelector('#x-foo-from-template');
  // If your code is inside of an HTML Import you'll need to change the above line to:
  // let tmpl = document.currentScript.ownerDocument.querySelector('#x-foo-from-template');

  customElements.define('x-foo-from-template', class extends HTMLElement {
    constructor() {
      super(); // always call super() first in the constructor.
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
    }
    ...
  });
</script>
```

## Styling a custom element

### Pre-styling unregistered elements

## Extending elements

### Extending a custom element

### Extending native HTML elements

## Mics details

### Unknown elements vs. undefined custom elements

## API reference

## History and browser support

### Browser support

## Conclusion