[![Build Status](https://travis-ci.org/evenset/safe-auth.svg?branch=development)](https://travis-ci.org/evenset/safe-auth)
[![codecov](https://codecov.io/gh/evenset/safe-auth/branch/development/graph/badge.svg)](https://codecov.io/gh/evenset/safe-auth)

# What's safe-auth

safe-auth is a general purpose authentication solution for Node.js.
It's written in TypeScript with %100 test code coverage.

# Features

At its core it provides these features:

1. Create users
1. Activate/Deactivate users
1. Authenticating a user based on their username and password and returning
    the authenticated user
1. Issuing a token for a user
1. Authenticating a user based on an active issued token and returning the
    authenticated user
1. Issuing new token based on a refresh token (signing in)
1. Reset user's password when they forget it
1. Revoking tokens (signing out)
1. Revoking all active tokens of a user (signing out of all devices)
1. Optionally block a user when he has several failed attempts
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

# Reporting bugs

You can report issues/bugs in the github repository of the project:
https://github.com/evenset/safe-auth/issues
