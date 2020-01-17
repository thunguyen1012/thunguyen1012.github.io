
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
Dựa vào sử dụng, chúng ta có các loại view:
- Temporary views: tồn tại trong user session. ```TEMPORARY, TEMP```
- Recursive views: Giống giống với recursive function. Dùng trong các dạng hierarchical data.
- Updatable views: cho phép người dùng sử dụng view như là table - có thể ```INSERT, UPDATE, và DELETE```
- Materialized views: Là một table có nội dụng được làm mới định kỳ, giựa trên một câu query cụ thể. Dùng để tối ưu hiệu năng cho các câu truy vấn thực hiện lâu và thực hiện định kỳ. CŨng có thể xem đây là một dạng caching data.

### Materialized views
Materialized view là một PostgreSQL extension. (Oracle cũng hỗ trợ). Materialized view có thể được tạo trên một ```TABLESPACE``` cụ thể, cũng như một ```storage_parameter``` -> materialized views là các đối tượng vật lý.

```sql
CREATE MATERIALIZED VIEW [ IF NOT EXISTS ] table_name
    [ (column_name [, ...] ) ]
    [ WITH ( storage_parameter [= value] [, ... ] ) ]
    [ TABLESPACE tablespace_name ]
    AS query
    [ WITH [ NO ] DATA ]
```

Lấy data từ materialized view chưa được populate data sẽ có lỗi.

```sql
car_portal=> CREATE MATERIALIZED VIEW test_mat AS SELECT 1 WITH NO DATA;
CREATE MATERIALIZED VIEW
car_portal=> TABLE test_mat;
ERROR: materialized view "test_mat" has not been populated
HINT: Use the REFRESH MATERIALIZED VIEW command.
```

Dùng ```REFRESH MATERIALIZED VIEW [ CONCURRENTLY ] name [ WITH [ NO ] DATA ]``` để populate data

```sql
car_portal=> REFRESH MATERIALIZED VIEW test_mat;
REFRESH MATERIALIZED VIEW
car_portal=> TABLE test_mat;
?column?
----------
1
(1 row)
```

Refresh materialized view là một blocking statement - SHARED LOCK???

### Updatable views
Mặc định trong PostgreSQL, các view là auto-updatable. Những view nào không thể updatable vì vi phạm các ràng buộc thì trigger, rule systems có thể được dùng để biến view trở thành updatable.
Có thể ```DELETE, INSERT, và UPDATE``` với updatable view để tác động tới data của table bên dưới.
View tự động trở thành updatable khi thoả các điều kiện sau:
- View được xây trên một table hay một updatable view
- view definition không có ```DISTINCT, WITH, GROUP BY, OFFSET, HAVING, LIMIT, UNION, EXCEPT, INTERSECT``` trong top level.
- select list của view phải được map với table bên dưới một cách trực tiếp: không dùng function, expression. Các selected columns không được lặp lại.
- thuộc tính ```security_barrier``` không được set.

```sql
CREATE VIEW car_portal_app.user_account AS SELECT account_id, first_name,
last_name, email, password FROM car_portal_app.account WHERE account_id
NOT IN (SELECT account_id FROM car_portal_app.seller_account);
```
Insert
```sql
car_portal=> INSERT INTO car_portal_app.user_account VALUES
(default,'first_name1','last_name1','test@email.com','password');
INSERT 0 1
```

```WITH CHECK OPTION``` được dùng để quản lý hành vi của updatable view. Nếu không chỉ định ```WITH CHECK OPTION```, chúng ta có thể ```UPDATE hay INSERT``` một record, ngay cả khi nó không hiện trong view -> security risk.

```sql
CREATE TABLE check_option (val INT);
CREATE VIEW test_check_option AS SELECT * FROM check_option WHERE val > 0
WITH CHECK OPTION;
```
Test
```sql
car_portal=> INSERT INTO test_check_option VALUES (-1);
ERROR: new row violates check option for view "test_check_option"
DETAIL: Failing row contains (-1).
```

Để kiểm tra một view có là updatable view hay không: xem ```is_insertable_into``` của view trong ```information_schema```.
```sql
car_portal=# SELECT table_name, is_insertable_into FROM
information_schema.tables WHERE table_name = 'user_account';
table_name | is_insertable_into
--------------+--------------------
user_account | YES
(1 row)
```

## Indexes
Một index là một đối tượng physical database, được định nghĩa trên một column hay nhóm column của table.
Index được dùng để:
- Cải thiện hiệu năng
- Validate constraints

### Index synopses
Dùng ```CREATE INDEX``` để tạo index. Vì là đối tượng vật lý nên có thể chỉ định ```TABLESPACE, storage_parameter```. Index có thể tạo trên các column hay các expression. Các index có thể được sắp xếp theo ```ACS hay DESC```. Có thể chỉ định collation cho index trên text fields. Tuỳ chọn ```OPTION``` được dùng để quản lý kết thừa và phân mảnh table. Nếu một table được phân mảnh, index cũng sẽ được tạo trên các mảnh (mặc định), khi tuỳ chọn ```OPTION``` không được chỉ định.

```sql
CREATE [ UNIQUE ] INDEX [ CONCURRENTLY ] [ [ IF NOT EXISTS ] name ] ON [
ONLY ] table_name [ USING method ]
    ( { column_name | ( expression ) } [ COLLATE collation ] [ opclass ] [
ASC | DESC ] [ NULLS { FIRST | LAST } ] [, ...] )
    [ INCLUDE ( column_name [, ...] ) ]
    [ WITH ( storage_parameter = value [, ... ] ) ]
    [ TABLESPACE tablespace_name ]
    [ WHERE predicate ]
```

### Index selectivity
Index không được dùng khi kích thước table nhỏ. PostgreSQL planner sẽ scan hết table. PostgreSQL planner quyết định có dùng index hay không giựa trên execution plan cost. -> Cùng câu truy vấn, khác giá trị tham số -> có thể có execution plan khác nhau.

```EXPLAIN```

### Index types
- B-tree index: mặc định index type. Dùng cho equality, ranges, và null. Hỗ trợ tất cả các PostgreSQL data type.
- Hash index: Dùng tốt cho equality.
- Generalized Inverted Index (GIN): Hữu dụng khi nhiều giá trị cần map tới một row. Có thể dùng với các cấu trúc dữ liệu phức tạp như array, full-text search.
- Generalized Search Tree (GiST): Cho phép xây dựng các cấu trúc cây cân bằng. Dùng cho index geometric data, full-text search.
- Space-Partitioned GiST (SP-GiST): Giống GiST và hỗ trợ partitioned search tree. Dùng cho quản lý user-defined data type phức tạp.
- Block Range Index (BRIN): Dùng cho bảng lớn, kích thước bị giới hạn. Chạy chậm hơn B-tree, nhưng ít chiếm không gian hơn B-tree.

### Index categories
Có thể phân loại index thành nhiều category và một index có thể thuộc nhiều category cùng lúc như unique partial index.
Index categories:
- Partial indexes: một partial index chỉ index trên một tập nhỏ data của table (thoả ```WHERE``` trong index). Giảm kích thước index.
- Covering indexes: Cho phép vài query được thực thi với chỉ một lần scan index. Hiện tại chỉ có B-tree index hỗ trợ.
- Unique indexes: đảm bảo một giá trị cụ thể là unique trong toàn bảng.
- Multicolumn indexes: Có thể được dùng cho một mẫu của query nhiều điều kiện (```WHERE, ORDER BY, GROUP BY,...```), tối đa 32 cột.
- Indexes on expressions: Cũng có thể tạo index cho kết quả của expression hay function. Index trên expression được chọn khi functional expression của index được dùng trong ```WHERE```.

Hiện tại chỉ B-tree, GIN, GiST, và BRIN hỗ trợ multicolumns index. Khi tạo multicolumn index, thứ tự column là quan trọng. Kích thước multicolumn index thường lớn, planner thường ko dùng.

### Best practices for indexes
Index thường định nghĩa trên các column cái được dùng ở các điều kiện và khoá ngoại. ```DELETE, UPDATE``` cũng có dùng index. ```pg_stat_all_indexes``` cung cấp thông tin thống kê việc sử dụng index.

Tạo trùng index, PostgreSQL không báo lỗi.
Dùng ```REINDEX``` để build lại index. Đây là blocking command. Có thể resolve issue này bỡi tạo ```CONCURRENTLY``` index

## Functions
Một PostgreSQL function được dùng để cung cấp một service cụ thể, và nó thường là kết hợp của các khai báo, expression, và lệnh.

### The PostgreSQL native programming language
Hỗ trợ user-defined function viết bỡi C, SQL, và PL/pgSQL.  
Ngoài ra còn có PL/Tcl, PL/Python, và PL/Perl. Bạn sẽ cần tạo language để dùng chúng. ```CREATE EXTENSION``` hay ```createlang``` utility tool.

### Function usage
PostgreSQL function có thể được dùng trong các trường hợp sau:
- Như là abstract interface với các ngôn ngữ bậc cao để giấu data model.
- Thực thi logic phức tạp cái khó implement với SQL
- Thực thi các action trước và sau thực thi một câu SQL - thông qua trigger
- Làm sạch SQL code bỡi sử dụng lại các code phổ biến và đặt chúng trong các module
- Tự động các common task liên quan tới một database bỡi sử dụng dynamic SQL.

### PostgreSQL function categories
PostgreSQL function phải là immutable. Nếu không thì sẽ là violate function.

### PostgreSQL anonymous functions
PostgreSQL cung cấp ```DO``` statement - dùng nó để tạo code block. Tất cả các PostgreSQL function là transactional; vì thế nếu bạn muốn tạo các index (ví dụ), thì shell scripting hay procedures là phương án tốt hơn.

```sql
DO $$
    DECLARE r record;
BEGIN
    FOR r IN SELECT table_schema, table_name FROM information_schema.tables
WHERE table_schema = 'car_portal_app' LOOP
    EXECUTE 'GRANT SELECT ON ' || quote_ident(r.table_schema) || '.'||
quote_ident(r.table_name) || ' TO select_only';
    END LOOP;
END$$;
```

## User-defined data types
PostgreSQL cung cấp 2 cách để cài đặt user-defined type:
- ```CREATE DOMAIN```: Cho phép tạo user-defined data type với các constraint. Điều này giúp source code module hơn.
- ```CREATE TYPE```: thường dùng để tạo composite type. Cũng có thể dùng ```CREATE TYPE``` để tạo ```ENUM```, cái giúp giảm số lần join.

Thường sẽ không dùng user-defined data type mà dùng flat table vì thiếu sự hỗ trợ từ phía driver, như JDBC, ODBC.

Ví dụ tạo text không có space và không null.
Tạo domain
```sql
CREATE DOMAIN text_without_space_and_null AS TEXT NOT NULL CHECK (value !~ '\s');
```

Xử dụng
```sql
CREATE TABLE test_domain (
    test_att text_without_space_and_null
);
```

Có thể chỉnh sửa domain bỡi dùng ```ALTER DOMAIN```. Nếu có thay đổi constraint -> tất cả các thuộc tính đang dùng domain sẽ chạy validate lại. Dùng ```NOT VALID``` để ngăn việc này và fix wrong data sau.

```sql
ALTER DOMAIN text_without_space_and_null ADD CONSTRAINT text_without_
space_and_null_length_chk check (length(value)<=15) NOT VALID;
```

Sau khi fix xong wrong data thì update domain lại.

```sql
ALTER DOMAIN text_without_space_and_null ADD CONSTRAINT text_without_
space_and_null_length_chk check (length(value)<=15) VALIDATE CONSTRAINT;
```

Composite data type hữu dụng cho việc tạo function, đặc biệt khi trả kiểu là một row của nhiều giá trị.

Ví dụ:
```sql
CREATE TYPE car_portal_app.seller_information AS (seller_id INT,
seller_name TEXT,number_of_advertisements BIGINT, total_rank float);
```

và dùng
```sql
CREATE OR REPLACE FUNCTION car_portal_app.seller_information (account_id INT)
 RETURNS car_portal_app.seller_information AS $$
    SELECT seller_account.seller_account_id, first_name || last_name as seller_name, count(*), sum(rank)::float/count(*)
    FROM car_portal_app.account INNER JOIN
        car_portal_app.seller_account ON account.account_id =
        seller_account.account_id LEFT JOIN
        car_portal_app.advertisement ON advertisement.seller_account_id =
        seller_account.seller_account_id LEFT JOIN
        car_portal_app.advertisement_rating ON advertisement.advertisement_id =
        advertisement_rating.advertisement_id
    WHERE account.account_id = $1
    GROUP BY seller_account.seller_account_id, first_name, last_name
$$
LANGUAGE SQL;
```

Trong PostgreSQL ```ENUM``` là type-safe, các kiểu ```ENUM``` khác nhau không thể so sánh với nhau. Có thể thay đổi và add thêm giá trị mới vào ENUM (đây là blocking statement)

## Trigger and rule systems
PostgreSQL cung cấp các trigger và rule để thực hiện một cách tự động một hàm khi một sự kiện, như ```INSERT, UPDATE, hay DELETE``` được thực hiện. Trigger hay rule không được định nghĩa trên các câu ```SELECT```, trừ ```_RETURN```.

Về hiệu năng, rule nhanh hơn trigger, nhưng trigger đơn giản hơn và tương thích với các RDBM khác. Rule là một PostgreSQL extension.

### Rule system
Tạo mới một rule thì sẽ hoặc rewrite rule mặc định hay tạo một rule mới cho action cụ thể trên một table hay view cụ thể. Rule giựa trên C macro system. -> có thể có kết quả lạ lạ khi gọi các volatite function, hay dùng default value (giá trị unique vẫn cứ tăng dần).

Ví dụ tạo thêm một table để ghi thêm thông tin log.
```sql
CREATE TABLE car_portal_app.car_log (LIKE car_portal_app.car);
ALTER TABLE car_portal_app.car_log
    ADD COLUMN car_log_action varchar (1) NOT NULL,
    ADD COLUMN car_log_time TIMESTAMP WITH TIME ZONE NOT NULL;

CREATE RULE car_log AS ON INSERT TO car_portal_app.car 
DO ALSO
    INSERT INTO car_portal_app.car_log (
        car_id, 
        car_model_id,
        number_of_owners, 
        registration_number, 
        number_of_doors,
        manufacture_year,
        car_log_action, 
        car_log_time)
    VALUES (
        new.car_id, 
        new.car_model_id,
        new.number_of_owners,
        new.registration_number, 
        new.number_of_doors, 
        new.manufacture_year,
        'I',
        now());
```

### Trigger system
PostgreSQL kích hoạt một hàm khi một sự kiện cụ thể xảy ra trên một table, view, hay foreign table. Các trigger được thực thi khi một người dùng cố gắng thay đổi data thông qua DML events: ```INSERT, UPDATE, DELETE, hay TRUNCATE```.

```sql
CREATE [ CONSTRAINT ] TRIGGER name { BEFORE | AFTER | INSTEAD OF } { event
[ OR ... ] }
    ON table_name
    [ FROM referenced_table_name ]
    [ NOT DEFERRABLE | [ DEFERRABLE ] [ INITIALLY IMMEDIATE | INITIALLY DEFERRED ] ]
    [ REFERENCING { { OLD | NEW } TABLE [ AS ] transition_relation_name } [ ... ] ]
    [ FOR [ EACH ] { ROW | STATEMENT } ]
    [ WHEN ( condition ) ]
    EXECUTE PROCEDURE function_name ( arguments )

where event can be one of:
INSERT
UPDATE [ OF column_name [, ... ] ]
DELETE
TRUNCATE
```

Ngữ cảnh thời gian trigger:
- ```BEFORE```: chỉ có tác dụng trên table và được kích hoạt trước các điều kiện được kiểm tra và operation được thực hiện.
- ```ALTER```: Giống ```BEFORE```, trừ việc kích hoạt sau
- ```INSTEAD OF```: dùng trên view và tạo updatable view.

Khi một trigger được mark cho mỗi row thì nó sẽ được thực thi mỗi khi mỗi row bị tác động bỡi CRUD. Một statement trigger chỉ được thực thi cho một operation.
Trigger có thể được mark như ```CONSTRAINT```, một trigger có thể được thực thi sau câu lệnh cuối hay kết thúc transaction. Constraint trigger phải là ```AFTER or FOR EACH ROW``` trigger, và thời điểm phát trigger sẽ được quản lý bỡi các option sau:
- ```DEFERRABLE```: thời điểm phát trigger được hoãn tới cuối của transaction.
- ```INITIALLY DEFERRED```: trigger sẽ được thực thi ở cuối của transaction. Trigger nên đánh dấu là ```DEFERRABLE```
- ```NOT DEFERRABLE```: đây là giá trị mặc định, phát trigger ngay sau mỗi lệnh trong transaction.
- ```INITIALLY IMMEDIATE```: trigger sẽ được thực thi sau mỗi lệnh. Trigger nên đánh dấu là ```DEFERRABLE```

Các trigger được thực thi theo thứ tự alphabetically trên tên trigger.

```sql
CREATE OR REPLACE FUNCTION car_portal_app.car_log_trg () RETURNS TRIGGER AS
$$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO car_portal_app.car_log SELECT NEW.*, 'I', NOW();
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO car_portal_app.car_log SELECT NEW.*, 'U', NOW();
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO car_portal_app.car_log SELECT OLD.*, 'D', NOW();
    END IF;
    RETURN NULL; --ignored since this is after trigger
END;
$$
LANGUAGE plpgsql;
```
```sql
CREATE TRIGGER car_log AFTER INSERT OR UPDATE OR DELETE ON
car_portal_app.car FOR EACH ROW EXECUTE PROCEDURE
car_portal_app.car_log_trg ();
```

Page 144
#### Triggers with arguments
#### Triggers and updatable views

## Ref
Salahaldin Juba_ Andrey Volkov - Learning PostgreSQL 11_ A beginner’s guide to building high-performance PostgreSQL database solutions, 3rd Edition (2019, Packt Publishing)