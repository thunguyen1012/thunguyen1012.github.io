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

## Định nghĩa một element mới 

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
Ngay cả khi element bạn định nghĩa có style riêng bỡi dùng Shadow DOM, người vẫn có thể style custom element của bạn trên trang của họ. Gọi là "user-defined styles"

```html
<!-- user-defined styling -->
<style>
  app-drawer {
    display: flex;
  }
  panel-item {
    transition: opacity 400ms ease-in-out;
    opacity: 0.3;
    flex: 1;
    text-align: center;
    border-radius: 50%;
  }
  panel-item:hover {
    opacity: 1.0;
    background: rgb(255, 0, 255);
    color: white;
  }
  app-panel > panel-item {
    padding: 5px;
    list-style: none;
    margin: 0 7px;
  }
</style>

<app-drawer>
  <panel-item>Do</panel-item>
  <panel-item>Re</panel-item>
  <panel-item>Mi</panel-item>
</app-drawer>
```
User style luôn thắng style đã định nghĩa bên trong Shadow DOM.

### Pre-styling unregistered elements
Trước khi một element được upgraded, bạn có thể style nó bỡi dùng ```:defined``` pseudo-class. Cái này hữu dụng cho việc pre-styling một component. Ví dụ, bạn có thể muốn giữ layout khi custom element chưa được định nghĩa.

Ví dụ: ẩn ```<app-drawer>``` trước khi nó được định nghĩa:
```css
app-drawer:not(:defined) {
  /* Pre-style, give layout, replicate app-drawer's eventual styles, etc. */
  display: inline-block;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
```
Sau khi ```<app-drawer>``` được định nghĩa, selector trên không còn tác dụng.

## Extending elements

### Extending a custom element
Thông qua extend định nghĩa lớp của custom element.
Ví dụ:

```javascript
class FancyDrawer extends AppDrawer {
  constructor() {
    super(); // always call super() first in the constructor. This also calls the extended class' constructor.
    ...
  }

  toggleDrawer() {
    // Possibly different toggle implementation?
    // Use ES2015 if you need to call the parent method.
    // super.toggleDrawer()
  }

  anotherMethod() {
    ...
  }
}

customElements.define('fancy-app-drawer', FancyDrawer);
```

### Extending native HTML elements
Cũng có thể mở rộng HTML element bỡi kế thừa DOM interface phù hợp. Ví dụ một custom element mở rộng ```<button>``` cần kế thừa ```HTMLButtonElement``` thay vì ```HTMLElement```.

Ví dụ:
```javascript
// See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
// for the list of other DOM interfaces.
class FancyButton extends HTMLButtonElement {
  constructor() {
    super(); // always call super() first in the constructor.
    this.addEventListener('click', e => this.drawRipple(e.offsetX, e.offsetY));
  }

  // Material design ripple animation.
  drawRipple(x, y) {
    let div = document.createElement('div');
    div.classList.add('ripple');
    this.appendChild(div);
    div.style.top = `${y - div.clientHeight/2}px`;
    div.style.left = `${x - div.clientWidth/2}px`;
    div.style.backgroundColor = 'currentColor';
    div.classList.add('run');
    div.addEventListener('transitionend', e => div.remove());
  }
}

customElements.define('fancy-button', FancyButton, {extends: 'button'});
```

Lưu ý có sự thay đổi trong việc gọi ```define()``` để extend một native element. Tham số bắt buộc thứ ba cho browser biết tag bạn đang extending. Vì có nhiều HTML tag chia sẻ cùng DOM interface. ```<section>, <address>, và <em>``` cùng extend ```HTMLElement```.

Sử dụng custom của một native element cũng có nhiều cách. Có thể dùng ```is=""``` trên native tag:
```html
<!-- This <button> is a fancy button. -->
<button is="fancy-button" disabled>Fancy button!</button>
```

Trong javascript
```javascript
// Custom elements overload createElement() to support the is="" attribute.
let button = document.createElement('button', {is: 'fancy-button'});
button.textContent = 'Fancy button!';
button.disabled = true;
document.body.appendChild(button);
```

Hay dùng ```new```
```javascript
let button = new FancyButton();
button.textContent = 'Fancy button!';
button.disabled = true;
```

## Mics details

### Unknown elements vs. undefined custom elements
Những element chưa được định nghĩa sẽ được parse như ```HTMLUnknownElement```. Nhưng nếu custom element được khai báo với tên hợp lệ (có '-') thì custom element sẽ được parsed như là một ```HTMLElement```.

```javascript
// "tabs" is not a valid custom element name
document.createElement('tabs') instanceof HTMLUnknownElement === true

// "x-tabs" is a valid custom element name
document.createElement('x-tabs') instanceof HTMLElement === true
```

## API reference
```customElement``` có các phương thức hữu ích trong xử lý custom element.
```define(tagName, constructor, options)```
Định nghĩa custom element.

Ví dụ:
```javascript
customElements.define('my-app', class extends HTMLElement { ... });
customElements.define(
  'fancy-button', class extends HTMLButtonElement { ... }, {extends: 'button'});
```

```get(tagName)```
Trả về constructor của custom element. ```undefined``` nếu định nghĩa của element chưa được đăng ký.

Ví dụ:
```javascript
let Drawer = customElements.get('app-drawer');
let drawer = new Drawer();
```

```whenDefined(tagName)```
Trả về một Promise, promise này resolve khi custom element được định nghĩa. Nếu element đã định nghĩa thì resolve ngay lập tức. Reject nếu tag name không là một tên hợp lệ.

Ví dụ:
```javascript
customElements.whenDefined('app-drawer').then(() => {
  console.log('ready!');
});
```

## History and browser support

### Browser support
Dùng script để detect
```javascript
const supportsCustomElementsV1 = 'customElements' in window;
```

### Polyfill
Từ package
```npm install --save @webcomponents/webcomponentsjs```

Sử dụng
```html
<!-- Use the custom element on the page. -->
<my-element></my-element>

<!-- Load polyfills; note that "loader" will load these async -->
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js" defer></script>

<!-- Load a custom element definitions in `waitFor` and return a promise -->
<script type="module">
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  WebComponents.waitFor(() => {
    // At this point we are guaranteed that all required polyfills have
    // loaded, and can use web components APIs.
    // Next, load element definitions that call `customElements.define`.
    // Note: returning a promise causes the custom elements
    // polyfill to wait until all definitions are loaded and then upgrade
    // the document in one batch, for better performance.
    return loadScript('my-element.js');
  });
</script>
```

## Conclusion
Custom element cho phép tạo HTML tag mới. Kết hợp với Shadow DOM và ```<template>```, có thể định hình bức tranh của Web Components:
- Cross-browser (web standard) for creating and extending reusable components.
- Requires no library or framework to get started. Vanilla JS/HTML FTW!
- Provides a familiar programming model. It's just DOM/CSS/HTML.
- Works well with other new web platform features (Shadow DOM, <template>, CSS custom properties, etc.)
- Tightly integrated with the browser's DevTools.
- Leverage existing accessibility features.

## REF
https://developers.google.com/web/fundamentals/web-components/customelements