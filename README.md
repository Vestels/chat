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
- SvelteKit
- Bootstrap
- SCSS

## Prerequisites:
- [Node.JS](https://nodejs.org/en/download/package-manager)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Git](https://git-scm.com/downloads)

## Installation Steps:

> [!TIP]
> Before cloning open a terminal and use:
```ruby
cd desktop
```

> 1. Clone the Reporitory:
```ruby
git clone https://github.com/Vestels/chat
```

> 2. Open the cloned folder with you IDE and Set Up the Environments Variables at: **backend/.env**
```ruby
URI = 'mongodb://localhost:27017/your-database-name'
JWT_SECRET = 'your-secret-string-key'
JWTEXPIRESIN = 'your-expire-time'
PORT = your-port
```
> [!WARNING]  
> Make sure the port you set is not used by other apps!

> 3. Install Dependencies to Backend side and run:
```ruby
cd backend
npm install
npm run start:dev
```
>Application will be running on: http://localhost:your-port

> [!TIP]
> To test the MongoDB status changes, open the `cmd` **as administrator** and use these commands **separately**:
 ```ruby
nest stop MongoDB
nest start MongoDB
```

> 4. Install Dependencies to Frontend side and run:
```ruby
cd ..
cd frontend
npm install
npm run dev
```
>Application will be running on: http://localhost:5173

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsI......",
    "user": {
        "_id": "string",
        "username": "string",
        "email": "string",
        "password": "hashed string password",
        "__v": 0
    }
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
    },
    {...},
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

**Response:**<br  />
```ruby
{
    "_id": "deleted userId",
    "username": " deleted username",
    "email": " deleted email",
    "password": "deleted hashed password",
    "__v": 0
}
```

**Status Responses:**<br  />
<br  />`200 OK`: User successfully deleted.<br  />
`400 Bad Request`: Invalid user ID.<br  />
`404 Not Found`: User not found.<br  />
#
<br  />

## Frontend Development

### Project Structure

The frontend project is structured as follows:

```
frontend/
    .gitignore
    .npmrc
    .prettierignore
    .prettierrc
    .svelte-kit/
        ambient.d.ts
        generated/
            client/
                app.js
                matchers.js
                nodes/
            root.js
            root.svelte
            server/
                internal.js
        non-ambient.d.ts
        tsconfig.json
        types/
            route_meta_data.json
            src/
                routes/
    eslint.config.js
    package.json
    README.md
    src/
        app.d.ts
        app.html
        hooks.server.ts
        lib/
            stores/
        routes/
            (authed)/
            +layout.svelte
            login/
            register/
        utils/
            cookie.util.ts
    static/
    svelte.config.js
    tsconfig.json
    vite.config.ts
```

> [!NOTE]  
> The Appliaction basically uses 3 routes, the `Login`, `Register` and the the main `"Chat"` route, which is the [`src/routes/(authed)/+page.svelte`](frontend/src/routes/(authed)/+page.svelte) and it is authed.
#

### Key Files and Directories

- **`src/routes/`**: Contains the SvelteKit routes for the application.
  - **`(authed)`**: Contains authenticated routes.
  - **`login/`**: Contains the login page.
  - **`register/`**: Contains the registration page.
- **`src/lib/stores/`**: Contains Svelte stores used in the application.
- **`src/utils/`**: Contains utility functions.
- **`src/hooks.server.ts`**: Contains server-side hooks.
- **`src/app.html`**: The main HTML template for the application.

### Running the Frontend

> To run the frontend, navigate to the `frontend` directory and install the dependencies:

```ruby
cd frontend
npm install
```

> Then, start the development server:

```ruby
npm run dev
```

> The application will be running on: http://localhost:5173
#

### Frontend Code Overview

#### Login Page

> The login page is implemented in [`src/routes/login/+page.svelte`](frontend/src/routes/login/+page.svelte). It handles user login and sets cookies for authentication.

#### Registration Page

> The registration page is implemented in [`src/routes/register/+page.svelte`](frontend/src/routes/register/+page.svelte). It handles user registration.

#### Authenticated Routes

> Authenticated routes are implemented in the `(authed)` directory. The main authenticated page is in [`src/routes/(authed)/+page.svelte`](frontend/src/routes/(authed)/+page.svelte).

#### Utility Functions

> Utility functions for handling cookies are implemented in [`src/utils/cookie.util.ts`](frontend/src/utils/cookie.util.ts).

#### Stores

> Svelte stores for managing user state are implemented in [`src/lib/stores/auth.ts`](frontend/src/lib/stores/auth.ts).

### ESLint and Prettier

> The project uses ESLint and Prettier for code linting and formatting. The configuration files are:

- [`eslint.config.js`](frontend/eslint.config.js)
- [`.prettierrc`](frontend/.prettierrc)
- [`.prettierignore`](frontend/.prettierignore)

To lint and format the code, run:

```ruby
npm run lint
npm run format
```

### TypeScript

> The project is written in TypeScript. The TypeScript configuration file is [`tsconfig.json`](frontend/tsconfig.json).
