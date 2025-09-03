# Joinery API

## Description

Server that supports REST API for the **Joinery** Service.

<br/>

## Structure

```
src/
├── auth/           # Auth Module (JWT, Google OAuth, Mailer)
├── post/           # Post Management Module
├── user/           # User Management Module
├── notifications/  # Notification Module
├── upload/         # File Upload Module (AWS S3)
└── utils/          # Utill Funtions
```

<br/>

## Features

### Auth Module
* JWT Authentication
* Google OAuth 2.0 Integration
* User Registration & Account Management
* Email Verification
* Password Management

### Post Module
* Post CRUD
* Regional Post Classification
* Like System

### User Module
* Profile Management
* Bookmark System

### Notification Module
* Notification CRUD

### Upload Module
* File CRUD

### Technical Features
* Clean Architecture

<br/>

## Installation

```bash
$ npm install
```

<br/>

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
<br/>

## Environment configuration

```bash
# Environment
PORT
MONGODB_URI
SECRET
FRONTEND_URL
JWT_EXPIRES_IN

# AWS S3 Properties
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_BUCKET_NAME

# Google Oauth Properties
DEFAULT_PROFILE_IMAGE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_API_KEY

# Gmaill Mailer Properties
SMTP_HOST
SMTP_PORT
SMTP_EMAIL
SMTP_PASS
```
