
---
title: ==> C4 - PostgreSQL Advanced Building Blocks
published: true
date: 2020-01-16 22:00:00
tags: postgresql
description: Những thành phần nâng cao khi làm việc với PostgreSQL
image:
---

## Views
Một view có thể được xem như là một câu truy vấn được đặt tên hay một wrapper của một câu ```SELECT```. View có thể được dùng cho các mục đích sau:
- Đơn giản hoá câu truy vấn phức tạp và nâng cao tính module của code.
- Cải thiện hiệu năng bỡi caching kết quả của view để dùng sau này.
- Giảm số lượng SQL code.
- Cầu nối khoảng gap giữa database quan hệ với ngôn ngữ hướng đối tượng (đặc biệt là updatable views)
- Cài đặt authorization ở row level (bỡi bỏ ra những row không khớp một điều kiện cụ thể)
- Cài đặt các interface và lớp abstraction giữa ngôn ngữ cấp cao và database quan hệ.
- Cài đặt thay đổi phút cuối

Một vài framework, như các ORM, có thể có các yêu cầu cụ thể, như unique key. Điều này hạn chế việc sử dụng view với những framework này; tuy nhiên, mình có thể vượt qua những issue này bỡi giả lập các primary key, thông qua các hàm window như ```row_number```.

Trong PostgreSQL, một view được model bên trong như là một table với một ```_RETURN``` rule -> có thể tạo một table và convert vào một view -> không khuyến khích kiểu này. Không thể xoá hay chỉnh sửa cấu trúc của một view, nếu đang có view khác phụ thuộc vào nó.

### View synopsis
Dùng ```CREATE VIEW``` để tạo view.
Các tên thuộc tính (các cột) của view có thể được cung cấp tường minh hay kế thừa từ câu ```SELECT```.

```sql
CREATE OR REPLACE VIEW car_portal_app.account_information
(account_id,first_name,last_name,email) AS SELECT account_id, first_name,
last_name, email FROM car_portal_app.account;
```

Khi thay thế định nghĩa view bỡi dùng từ khoá ```REPLACE```, column list nên nhất quán trước và sau khi thay thế, bao gồm column type, name, và order.

```sql
CREATE OR REPLACE VIEW account_information AS SELECT
account_id, last_name, first_name, email FROM car_portal_app.account;
ERROR: cannot change name of view column "first_name" to "last_name"
```

### View categories
page 114
### Materialized views
### Updatable views
## Indexes
### Index synopses
### Index selectivity
### Index types
### Index categories
### Best practices for indexes
## Functions
### The PostgreSQL native programming language
### Function usage
### Function dependencies
### PostgreSQL function categories
### PostgreSQL anonymous functions
## User-defined data types
## Trigger and rule systems
### Rule system
### Trigger system
#### Triggers with arguments
#### Triggers and updatable views
## Ref
Salahaldin Juba_ Andrey Volkov - Learning PostgreSQL 11_ A beginner’s guide to building high-performance PostgreSQL database solutions, 3rd Edition (2019, Packt Publishing)