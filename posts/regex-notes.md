---
title: Regex Notes
published: true
date: 2020-07-31 22:00:00
tags: regex
description: regex note
image:
---

## Match multiple sub-groups instead of a giant group
Sample:
```
~EB*B*A*B*01~MSG*Dummy01~EB*B*A*B*02~MSG*Dummy02~EB*B*A
```  

Request: Get groups  
```
EB*B*A*B*01~MSG*Dummy01  
EB*B*A*B*02~MSG*Dummy02
```  
Pattern: ```(EB\*B(.*?)(?=~EB))+```  
Important thing is ```(.*?)```