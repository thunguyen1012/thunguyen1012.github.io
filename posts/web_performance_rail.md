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
| User Perception Of Performance Delays |
| ----- |

## Response: process events in under 50ms

## Animation: produce a frame in 10ms

## Idle: maximize idle time

## Load: deliver content and become interactive in under 5 seconds

## Tools for measuring RAIL

## REF

- https://developers.google.com/web/fundamentals/performance/rail
