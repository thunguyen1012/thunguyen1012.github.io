---
title: Play with Mac OS
published: true
date: 2019-10-11 22:00:00
tags: mac, command
description: Collection of useful thing
image:
---

## Simple static web server everywhere
Có python, bạn có thể dựng static web server ngay lập tức tại thư mục mình muốn. Trên Windows, mình nghĩ cũng làm được điều tương tự, nhưng do hồi giờ thường mặc định gắn với IIS nên không tìm thêm cái gì đơn giản hơn.

```
python -m SimpleHTTPServer 8000
```

Ví dụ:
```
FVFZ72LGL414:Face-Detection-JavaScript-master thuqnguyen$ python -m SimpleHTTPServer 8000
Serving HTTP on 0.0.0.0 port 8000 ...
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /face-api.min.js HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /script.js HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/tiny_face_detector_model-weights_manifest.json HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_landmark_68_model-weights_manifest.json HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_recognition_model-weights_manifest.json HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_expression_model-weights_manifest.json HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/tiny_face_detector_model-shard1 HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_landmark_68_model-shard1 HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_recognition_model-shard1 HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_recognition_model-shard2 HTTP/1.1" 200 -
127.0.0.1 - - [11/Oct/2019 09:01:23] "GET /models/face_expression_model-shard1 HTTP/1.1" 200 -
```

## Run a batch file
Grant permission: chmod u+x <scriptname>  
Run: ./<scriptname>

## Visual Studio Code
Invoke code from terminal
1. Move Visual Studio Code into the Applications folder
2. Update PATH
-  Add this to your ~/.bash_profile
```batch
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
```
- ZShell  
Add ```alias code="/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code"``` to ```~/.zshrc``` file.

## Mapping folder
I faced an issue with Parallel on MacOS.
I have shared data to WindowsOS and use it with normal account.
I tried to access the sharing data with 'Run as administrator' and couldn't see mapped driver

Solution:
Run mapping for administrator by creating a batch file:
```batch
net use y: \\psf\Home
```

And run batch with 'Run as administrator'