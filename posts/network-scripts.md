---
title: Network scripts
published: true
date: 2019-10-11 22:00:00
tags: network, script, command
description: Network utility scripts
image:
---

## Cannot join into a network
Ngoài những kiểm tra thông thường thì vài lệnh sau đây có thể giúp  
```
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns
```

Chạy với quyền admin
