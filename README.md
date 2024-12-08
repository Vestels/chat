# Chat App
![maintenance-status](https://img.shields.io/badge/maintenance-actively--developed-brightgreen.svg)<br  />
Real time Chat app.

> [!WARNING]  
> The project is still under development.

> [!TIP]
> You get a feedback on every event in the console.

## Technologies used:

> **Backend:**
- NestJS
- WebSocket
- Socket.io
- MongoDB
- mongoose
- JWT
- Passport
- bcrypt

> **Frontend:**
- upcoming

## Prerequisites:
- [Node.JS](https://nodejs.org/en/download/package-manager)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Git](https://git-scm.com/downloads)

## Installation Steps:

> 1. Clone the Reporitory:
```ruby
git clone https://github.com/Vestels/chat
```

> 2. Set Up the Environments Variables at: **backend/src/config/db.ts**
```ruby
export class DbConfig {
  static readonly uri = 'mongodb://localhost:27017/your-database-name'
  static readonly jwtSecret = 'yourSecretKey'
  static readonly port = yourPORT
}
```

> 3. Install Dependencies to Backend side and run:
```ruby
cd backend
npm install
npm run start:dev
```
>Application will be running on: http://localhost:yourPORT
>

> 4. Install Dependencies to Frontend side and run:
```ruby
upcoming
```

## API endpoints:
### AUTH

> **POST** `/auth/register`  Registers a new user.<br  />

**Request Body:**
```ruby
{
  "username:" "string",
  "email:" "string",
  "password:" "string",
}
```
**Status Responses:** <br  />
<br  />`201 Created`: User successfully registered.<br  />
`400 Bad Request`: Missing properties or email already taken.<br  />
`409 Conflict`: Email is already taken.<br  />
#
<br  />

> **POST** `/auth/login`  Logs in a user.<br  />

**Request Body:**
```ruby
{
  "email:" "string",
  "password:" "string",
}
```
**Response:** <br  />
```ruby
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsI......"
}
```
> [!NOTE]  
> Copy this token for further test in POSTMAN

**Status Responses:** <br  />
<br  />`200 OK`: User successfully logged in, returns JWT token.<br  />
`400 Bad Request`: Missing properties.<br  />
`404 Not Found`: Incorrect email or password.<br  />
#
<br  />

### USERS
> [!IMPORTANT]  
> **The `/users` routes using JWT AuthGuard for access!**

> [!NOTE]  
> **Test:** in POSTMAN after successfull login, copy the returned `accessToken` value, go to `Headers` then set a **KEY** with `Authorization` and the **VALUE** with `Bearer accessToken`<br  /> **Example:** **`Bearer eyJhbGciOiJIUzI1NiIsI......`**<br  /> After that, you will be able to access all the users routes.

> **GET** `/users`  Fetches all registered users.<br  />

**Response:**
```ruby
[
    {
        "_id": "",
        "username": "",
        "email": "",
        "password": "",
        "__v": 0
    }
    {...}
]
```
**Status Responses:** <br  />
<br  />`200 OK`: Returns an array of objects with all registered users.<br  />
#
<br  />

> **GET** `/users/:userID`  Fetches a user by ID.<br  />
`:userId` The ID of the user to get.<br  />

**Response:**
```ruby
    {
        "_id": "",
        "username": "",
        "email": "",
        "password": "",
        "__v": 0
    }
```
**Status Responses:** <br  />
<br  />`200 OK`: Returns the user with the specified ID.<br  />
`400 Bad Request`: Invalid user ID.<br  />
`404 Not Found`: User not found.<br  />
#
<br  />

> **PUT** `/users/:userID` Updates a user by ID.<br  />
`:userId` The ID of the user to update.<br  />

**Request Body:**
```ruby
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
> [!NOTE]  
> The properties are optional, so if you only use `username` in the **Request Body** then only the `username` will be updated. Everything else remains unchanged.

**Response:**
```ruby
{
    "_id": "userId",
    "username": "updated username",
    "email": "updated email",
    "password": "updated hashed password",
    "__v": 0
}
```

**Status Responses:**<br  />
<br  />`200 OK`: User successfully updated.<br  />
`400 Bad Request`: Invalid user ID or missing properties.<br  />
`404 Not Found`: User not found.<br  />
#
<br  />

> **DELETE** `/users/:userID` Deletes a user by ID.<br  />
`:userId` The ID of the user to delete.<br  />

**Status Responses:**<br  />
<br  />`200 OK`: User successfully deleted.<br  />
`400 Bad Request`: Invalid user ID.<br  />
`404 Not Found`: User not found.<br  />
#
<br  />