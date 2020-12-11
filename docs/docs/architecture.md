---
id: architecture
title: System Architecture
---

![System Architecture](/img/architecture.png)

### Field WebApp

**Agents** use any wi-fi enabled phone (Android or IOS) to interface with the Webapp and initiate or update a lot. 

User will click through steps beginning with lot number and update the state of that particular lot.

### Admin WebApp

The admin app is a web application focused on activity supervision, administrative functions, and business inteligence. Admin users can view, add, edit, or delete resources on the system such as: users, transactions, organizations, locations, and configure the system.

Depending on each user's role thet are allowed to access different functions on the application. 

### GraphQL / Hasura

Hasura GraphQL engine automatically generates your GraphQL schema and resolvers based on your tables/views in Postgres. You don’t need to write a GraphQL schema or resolvers.

The Hasura console gives you UI tools that speed up your data-modeling process, or working with your existing database. The console also automatically generates migrations or metadata files that you can edit directly and check into your version control.

Hasura GraphQL engine lets you do anything you would usually do with Postgres by giving you GraphQL over native Postgres constructs.

Learn more at https://hasura.io

### HTTP API 

hapi.js (commonly referred to as hapi) stands for HTTP API. It is a rich framework for building applications and services. It was originally designed for the rapid development of RESTful API services using JavaScript, but has since grown to be a full web application framework with out-of-the-box features for templating, input validation, authentication, caching, and more recently, support for real-time applications with web socket support.

Learn more at https://hapi.dev/

### EOSIO

EOSIO is third generation blockchain that will allows to achieve the goal of providing and inmmutable, permanent, traceable and verifiable registry of the all the activity in container depots. This data will be public and can be consumed by any external third party.



### PostgresDB