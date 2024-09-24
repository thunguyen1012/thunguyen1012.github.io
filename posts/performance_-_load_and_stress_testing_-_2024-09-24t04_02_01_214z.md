---
title: Performance - Load and stress testing
published: true
date: 2024-09-24 04:02:01
tags: Summary, AspNetCore
description: Load testing and stress testing are important to ensure a web app is performant and scalable. Load and stress testing have different goals even though they often share similar tests.
image:
---

## In this article

Load testing and stress testing are important to ensure a web app is performant and scalable. Load and stress testing have different goals even though they often share similar tests.

Load tests: Test whether the app can handle a specified load of users for a certain scenario while still satisfying the response goal. The app is run under normal conditions.

App stability: Test app stability when running under extreme conditions, often for a long period of time.

Stress tests determine if an app under stress can recover from failure and gracefully return to expected behavior. Under stress, the app is run at abnormally high stress.

Azure Load Testing is a fully managed load-testing service that enables you to generate high-scale load.

Visual Studio 2019 load testing has been deprecated. The corresponding Azure DevOps cloud-based load testing service has been closed.

## Third-party tools

The following list contains third-party web performance tools with various feature sets:

- Apache JMeter

- ApacheBench (ab)

- Gatling

- jmeter-dotnet-dsl

- k6

- Locust

- West Wind WebSurge

- Netling

- Vegeta

- NBomber

## Load and stress test with release builds

If you want to test the performance of your application in production mode, you should use debug mode.

Ref: [ASP.NET Core load/stress testing](https://learn.microsoft.com/en-us/aspnet/core/test/load-tests?view=aspnetcore-8.0)