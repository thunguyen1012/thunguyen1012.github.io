---
title: Javascript Modules
published: true
date: 2019-09-18 22:00:00
tags: javascript, module
description: Hiểu và Xử dụng JS module...
image:
---

## What are JS modules?

JS module (ES module hay ECMAScript module). Có thể bạn từng dùng CommonJS, AMD, hay gì đó tương tự. Tất cả các hệ thống module này đều có một tính năng chung: cho phép import và export.

Bây giờ javascript có chuẩn chung cho công việc này. Trong module, bạn có thể dùng `export` để export mọi thứ: `const, function, variable, hay declaration`.

```javascript
export const repeat = string => `${string} ${string}`;
export function shout(string) {
  return `${string.toUpperCase()}!`;
}
```

Sau đó bạn dùng `import` để import module từ module khác.

```javascript
import { repeat, shout } from './lib.mjs';
repeat('hello');
// → 'hello hello'
shout('Modules in action');
// → 'MODULES IN ACTION!'
```

Export giá trị default từ module

```javascript
export default function(string) {
  return `${string.toUpperCase()}!`;
}
```

Và import giá trị default (có thể import thành bất kỳ tên nào)

```javascript
import shout from './lib.mjs';
//     ^^^^^
```

Module có vài điểm khác biệt so với script truyền thống:

- Strict mode là mặc định trong module
- HTML-style comment syntax không hỗ trợ trong module
- Module có một lexical top-level scope. Nghĩa là `var foo = 42;` trong một module sẽ không tạo một biến toàn cục, hay có thể truy cập thông qua `window`. Trong script truyền thống thì được.
- `this` trong module không tham chiếu đến global `this`.
- Từ khóa `import và export` chỉ có giá trị trong module.

## Using JS modules in the browser

Trên web, bạn có thể chỉ định `<script>` như là một module bỡi thiết lập thuộc tính `type` là `module`.

```html
<script type="module" src="main.mjs"></script>
<script nomodule src="fallback.js"></script>
```

Các browser hiểu `type="module"` sẽ bỏ qua các script có thuộc tính `nomodule`. Điều này có nghĩa bạn có thể phục vụ một payload dạng module cho các trình duyệt hỗ trợ module, trong khi cung cấp một đường lui cho các trình duyệt không hỗ trợ. Các module mặc định là `defer`.

### Browser-specific differences between modules and classic scripts

Module được thực thi chỉ một lần, trong khi classic script được thực thi mỗi khi bạn thêm nó vào DOM.

```html
<script src="classic.js"></script>
<script src="classic.js"></script>
<!-- classic.js executes multiple times. -->

<script type="module" src="module.mjs"></script>
<script type="module" src="module.mjs"></script>
<script type="module">
  import './module.mjs';
</script>
<!-- module.mjs executes only once. -->
```

Module script và những phụ thuộc của chúng được fetched với CORS. Điều này có nghĩa mọi cross-origin module script phải được load với header phù hợp, như `Access-Control-Allow-Origin: *`. Điều này không có với classic script.

Thuộc tính `async` làm cho việc tải script không block HTML parser (giống `defer`) ngoại trừ việc nó sẽ thực thi script sớm nhất có thể, không đảm bảo tính thứ tự, không đợi HTML parsing để hoàn tất. Thuộc tính `async` không làm việc với inline classic script, nhưng nó chạy cho inline `<script type="module">`.

### Module specifiers

Khi import module, chuỗi chỉ định vị trí của module được gọi là "module specifier" hay "import specifier". Có một vài ràng buộc với "module specifier" trên trình duyệt:

```javascript
// Not supported (yet):
import { shout } from 'jquery';
import { shout } from 'lib.mjs';
import { shout } from 'modules/lib.mjs';

// Supported:
import { shout } from './lib.mjs';
import { shout } from '../lib.mjs';
import { shout } from '/modules/lib.mjs';
import { shout } from 'https://simple.example/modules/lib.mjs';
```

### Modules are deferred by default

![Load script ways](./img/async-defer.svg 'Load script ways')

## Other module features

### Dynamic import()

Đôi khi sẽ load module theo nhu cầu, để cải thiện hiệu năng load. Sử dụng dynamic `import()`

```html
<script type="module">
  (async () => {
    const moduleSpecifier = './lib.mjs';
    const { repeat, shout } = await import(moduleSpecifier);
    repeat('hello');
    // → 'hello hello'
    shout('Dynamic import in action');
    // → 'DYNAMIC IMPORT IN ACTION!'
  })();
</script>
```

### import.meta

`import.meta` cung cấp metadata của module. Giá trị này không chính thức đề cập trong ECMAScript, nó cũng chạy khác nhau trên browser, Nodejs.
Ví dụ: `import.meta` trên web. Mặc định, image được load tương đối với URL hiện tại trong HTML document. `import.meta.url` cho phép load một image tương đối với module hiện tại.

```javascript
function loadThumbnail(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const image = new Image();
  image.src = url;
  return image;
}

const thumbnail = loadThumbnail('../img/thumbnail.png');
container.append(thumbnail);
```

## Performance recommendations

### Keep bundling

Với module, có thể phát triển web mà không cần các bundler như webpack, rollup,... Nó hợp lý để dùng trực tiếp native JS module trong các ngữ cảnh sau:

- Trong quá trình phát triển ở local
- Trong production cho các ứng dụng nhỏ, ít hơn 100 module và 1 cây phục thuộc cạn (ví dụ: sâu tối đa 5)

Tuy nhiên bundle vẫn tốt hơn không bundle: Loại bỏ code không dùng, minifying code, code splitting (phân tách các bundle và defer loading của non-First-Meaningful-Paint critial script)

#### Trade-offs of bundling vs. shipping unbundled modules

Tải unbundled modules có thể giảm hiệu năng load khởi tạo (cold cache), nhưng có thể cải thiện hiệu năng load cho các lần truy cập sau (warm cache) khi so với tải một single bundle không có code splitting.

### Use fine-grained modules

Tập trung vào viết code sử dụng các module nhỏ, mịn: có vài export trong module tốt hơn là một export mà chứa rất nhiều thứ trong đó và nếu không liên quan với nhau thì tách file ra - đừng tải về cái gì không cần dùng.

### Preload modules

Có thể tối ưu thêm một bước nữa trong việc load module bỡi dùng `<link rel="modulepreload">`. Browser có thể load trước và thậm chí parse trước, compile module và những thứ phụ thuộc trước.

```html
<link rel="modulepreload" href="lib.mjs" />
<link rel="modulepreload" href="main.mjs" />
<script type="module" src="main.mjs"></script>
<script nomodule src="fallback.js"></script>
```

Điều này quan trọng với các cây dependency lớn. Không có `rel="modulepreload"`, trình duyệt cần thực hiện nhiều HTTP request để xây dựng đầy đủ dependency tree. Tuy nhiên, nếu bạn khai báo đầy đủ danh sách các dependency module script với `rel="modulepreload"`, trình duyệt không phải liên tục tìm những phụ thuộc này.

### Use HTTP/2

Nên cố gắng dùng HTTP/2 khi có thể để cải thiện hiệu năng. Với HTTP/2 multiplexing (ghép kênh), các request và response có thể được kích hoạt cùng lúc, cái này hữu ích cho việc load các module tree.

## REF

- https://v8.dev/features/modules
