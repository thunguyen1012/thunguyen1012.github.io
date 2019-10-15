---
title: ==> React's Notes
published: true
date: 2019-10-06 22:00:00
tags: react, fundamental
description: In deep of react
image:
---

## ```super(props)```
*Tại sao lại gọi ```super```? Không có được không? Không truyền ```props``` có được không? Còn tham số nào khác không?*

```javascript
class Note extends React.Component {
  constructor(props) {
    super(props);
  }
}
```

Bạn không thể dùng ```this``` trước khi gọi ```super()```
Nếu bạn không truyền *props* trong ```super()``` thì bạn vẫn có thể truy cập ```this.props``` trong lifecycle. React luôn gán *props* cho thực thể của component sau khi khởi tạo.

```javascript
// Inside React
const instance = new YourComponent(props);
instance.props = props;
```

Vậy có cần truyền gọi dạng ```super(props)``` không? Cần khi bạn truy cập ```this.props``` trong constructor.

Có còn tham số nào có thể truyền cho ```super()``` không? Còn, đó là ```context```

## React đối xử với functional component và class component như thế nào?
Giả định chúng ta có ```Greeting``` component:
- Theo functional component
```javascript
function Greeting() {
  return <p>Hello</p>;
}
```
- Theo class
```javascript
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

Và sử dụng
```javascript
// Class or function — whatever.
<Greeting />
```

Bên trong react sẽ là
```javascript
// For functional
const result = Greeting(props); // <p>Hello</p>

// For class
// Inside React
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

Chúng ta sẽ đi qua ```new, this, class, arrow function, prototype, __proto__, instanceOf``` để nói về sự khác biệt này.

### ```new```
Bạn có thể dùng bất kỳ function nào theo dạng một class constructor bỡi thêm ```new``` trước lời gọi.
```javascript
// Just a function
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // case1 ✅ Person {name: 'Fred'}
var george = Person('George'); // case2 🔴 Won’t work, george = undefined
```

Case2, ```this``` trỏ đến window (global) hay ```undefined```. Còn case1, sẽ giống như: tạo một {} object, trỏ ```this``` trong hàm ```Person``` tới object này,..., và trả nó về. Nó cũng cung cấp ```Person.prototype``` đến ```fred``` object.

Nếu bạn gọi tạo thực thể của một class mà quên ```new``` thì sao? Sẽ có lỗi.

| | with ```new``` | without ```new``` |
| --- | --- | --- |
| class | ok | error |
| function | ok | ok |

=> React sẽ luôn thực thi tạo mới thực thể với ```new```? Không, vì chúng ta sẽ gặp vấn đề ```this``` trong functional component (kể cả dạng arrow function) - ```this``` ở đây là không cần thiết và không trỏ đến thực thể chúng ta muốn (arrow function).

Vậy không thể ```new``` cho arrow function. Làm sao để detect arrow function?

```javascript
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Note: chạy với babel thì kết quả không như thế.

Không thể ```new``` cho functional component, cái trả về giá trị nguyên bản: chuỗi, số,..

```javascript
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

Note: một trick ở đây, dùng ```new``` để thay đổi giá trị trả về của 1 hàm khi được gọi với ```new```.

```javascript
// Created lazily
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Reuse the same instance
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

Luyên thuyên quá, câu hỏi vẫn tồn tại, nhắc lại: Làm sao React biết dùng ```new``` cho class component và không dùng ```new``` cho functional component (kể cả đã được parsed bỡi babel)?

Dựa vào ```prorotype``` chain.

```javascript
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Found on c.__proto__ (Greeting.prototype)
c.setState();    // Found on c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Found on c.__proto__.__proto__.__proto__ (Object.prototype)

console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ We start here)
//     .__proto__ → React.Component.prototype (✅ Found it!)
//       .__proto__ → Object.prototype
```

Nói vậy chứ sẽ chết khi có nhiều phiên bản React trên trang - instant được tạo bỡi ```React.Component``` khác với cái nó đi kiểm tra. React dùng cách khác: dùng flag

```javascript
// Inside React
class Component {}
Component.prototype.isReactComponent = {};

// We can check it like this
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Yes
```

Câu hỏi đặt ra: tại sao lại đưa vào ```prototype```? Vì có thể mất khi mình định nghĩa class và không muốn copy các thuộc tính tĩnh.

Đôi khi code chạy ngon, đơn giản thì tốt hơn là cố code theo bài bản.

## How Does setState Know What to Do?

## Why Do React Hooks Rely on Call Order?

## Why Isn’t X a Hook?

## REF

- https://overreacted.io
