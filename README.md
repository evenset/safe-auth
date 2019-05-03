[![Build Status](https://travis-ci.org/evenset/safe-auth.svg?branch=development)](https://travis-ci.org/evenset/safe-auth)

# What's safe-auth

safe-auth is a general purpose authentication solution for Node.js.

# Features

At its core it provides these features:

1. Create users
1. Activate/Deactivate users
- Signing in: Issuing an access token and optionally a refresh token for
    active users when they provide correct username and password
1. Authenticating users based on the token their provide
1. Issuing new tokens when users provide a refresh token
1. Utilities to help users reset their password when they forget it
1. Signing out: Revoking tokens
1. Signing out of all devices: Revoking all active tokens of a user
1. Optionally block a user when he have several failed attempts
1. Logging all requests, responses and events
1. Configuring paramters and enabaling/disabling optional features in a
    centralized config system

# Storage engines

By default safe-auth provides an in memory storage engine (not to be used in
production) and it's able to use different storage engines via third party
packages.

Currently there is a third party package that uses Sequelize as the storage
backend which makes Postgres, MySQL, MariaDB, SQLite and Microsoft SQL
available.

TypeORM and Mongoose will be supported by other third party packages soon. So
the goal is to have at least these storage backends for safe-auth:
1. Sequelize
2. TypeORM
3. Mongoose

# Serving options

The core has its API with the JS classes it exposes. One can simply use these
classes in her project. But there are third party packages that provide
different serving options ready out of the box:
1. HTTP POST/GET requests
1. GraphQL
1. Rest
