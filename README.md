# TypeScript CRUD API with Node.js, Express & MySQL

**Project by Earl Stephen O. Guinita**

---

## Step 1: Initialize TypeScript Project

### 1. Create project folder

mkdir typescript-crud-api
cd typescript-crud-api

npm init -y

npm install express mysql2 sequelize bcryptjs jsonwebtoken cors joi rootpath

npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/

bcryptjs @types/jsonwebtoken nodemon

npx tsc --init

### 2. Include proper JSON code blocks for config and body

### Test 1: Create a User

**Endpoint:** POST `http://localhost:4000/users`

**Body (JSON):**

```json
{
  "title": "Mr",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "secret123",
  "confirmPassword": "secret123",
  "role": "User"
}

**Note:** Make sure your Node.js server is running:

npm run start:dev
```
