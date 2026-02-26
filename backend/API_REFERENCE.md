## Hotel Management System - API Reference

### Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

---

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Room Management Endpoints

### Get All Rooms
**GET** `/rooms`

Headers:
```
Authorization: Bearer {token}
```

Response (200):
```json
{
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "id": 1,
      "room_number": "101",
      "room_type": "Deluxe",
      "price_per_night": 150,
      "capacity": 2,
      "description": "Deluxe room with ocean view",
      "status": "available"
    }
  ]
}
```

---

### Create Room
**POST** `/rooms`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Request:
```json
{
  "roomNumber": "102",
  "roomType": "Standard",
  "pricePerNight": 100,
  "capacity": 2,
  "description": "Standard room"
}
```

Response (201):
```json
{
  "message": "Room created successfully",
  "roomId": 2
}
```

---

### Update Room
**PUT** `/rooms/:id`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Request:
```json
{
  "pricePerNight": 120,
  "status": "maintenance"
}
```

Response (200):
```json
{
  "message": "Room updated successfully"
}
```

---

### Delete Room
**DELETE** `/rooms/:id`

Headers:
```
Authorization: Bearer {token}
```

Response (200):
```json
{
  "message": "Room deleted successfully"
}
```

---

## Booking Endpoints

### Create Booking
**POST** `/bookings`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Request:
```json
{
  "roomId": 1,
  "userId": 1,
  "checkInDate": "2024-03-01",
  "checkOutDate": "2024-03-05",
  "totalAmount": 750
}
```

Response (201):
```json
{
  "message": "Booking created successfully",
  "bookingId": 1
}
```

---

### Get All Bookings
**GET** `/bookings`

Headers:
```
Authorization: Bearer {token}
```

Response (200):
```json
{
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "room_id": 1,
      "user_id": 1,
      "check_in_date": "2024-03-01",
      "check_out_date": "2024-03-05",
      "total_amount": 750,
      "status": "confirmed",
      "created_at": "2024-02-25T10:30:00Z",
      "room_number": "101",
      "room_type": "Deluxe",
      "price_per_night": 150,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  ]
}
```

---

### Update Booking Status
**PUT** `/bookings/:id`

Headers:
```
Authorization: Bearer {token}
Content-Type: application/json
```

Request:
```json
{
  "status": "checked_out"
}
```

Response (200):
```json
{
  "message": "Booking status updated successfully"
}
```

---

## Dashboard Endpoints

### Get Dashboard Statistics
**GET** `/dashboard/stats`

Headers:
```
Authorization: Bearer {token}
```

Response (200):
```json
{
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalRooms": 10,
    "availableRooms": 6,
    "bookedRooms": 4,
    "totalRevenue": 5250
  }
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "message": "Required fields missing"
}
```

### Unauthorized (401)
```json
{
  "message": "Authorization token is missing"
}
```

### Not Found (404)
```json
{
  "message": "Room not found"
}
```

### Conflict (409)
```json
{
  "message": "Email already registered"
}
```

### Internal Server Error (500)
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expiration: 24 hours

---

## Important Notes

1. **Password Security**: Passwords are hashed using bcrypt (10 salt rounds)
2. **Transaction Support**: Bookings use database transactions for consistency
3. **Connection Pooling**: MySQL uses connection pooling (max 10 connections)
4. **Input Validation**: All endpoints validate required fields
5. **Error Handling**: All errors are properly logged and returned with appropriate status codes

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","firstName":"John","lastName":"Doe"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

### Get Rooms (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:5000/api/rooms \
  -H "Authorization: Bearer TOKEN"
```
