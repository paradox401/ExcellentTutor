# Excellent Tutor

Production-ready learning platform for Class 8-10 students with scalable courses, subscription billing, and live sessions.

## Stack
- Frontend: React + Vite (TypeScript)
- Backend: Node.js + Express + Mongoose (MongoDB Atlas)

## Quick start
1. Install dependencies

```bash
npm install
npm install -w client
npm install -w server
```

2. Configure the API

```bash
cp server/.env.example server/.env
```

3. Start the apps

```bash
npm run dev:server
npm run dev:client
```

Frontend runs at `http://localhost:5173` and API at `http://localhost:8000`.

### Frontend API URL
Create a `client/.env` with:

```bash
VITE_API_URL="http://localhost:8000"
```

## Payments
The checkout UI uses a manual eSewa QR flow. Students scan the QR, click “I have paid,” and admins approve the payment.

Replace the QR image at `client/src/assets/esewa-qr.svg` with your real QR code.

If you later enable Khalti/eSewa API flows, configure keys in `server/.env`:

```bash
KHALTI_SECRET_KEY="your_khalti_secret"
KHALTI_BASE_URL="https://khalti.com/api/v2"
ESEWA_MERCHANT_CODE="your_esewa_code"
ESEWA_SECRET_KEY="your_esewa_secret"
ESEWA_FORM_URL="https://epay.esewa.com.np/api/epay/main/v2/form"
ESEWA_STATUS_URL="https://epay.esewa.com.np/api/epay/transaction/status/"
SERVER_URL="http://localhost:8000"
```

## Admin dashboard
The admin dashboard lives at `/admin`. Only users with role `ADMIN` can access it.
To promote a user, update their role in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "ADMIN" } })
```

## Data model
Classes, courses, modules, materials, videos, model questions, and live sessions are modeled in MongoDB for easy scaling to new grades.

## Class access
Students choose their class during registration and only see content for their class.

## Cloudinary uploads
Uploads now go to Cloudinary. Set these in `server/.env`:

```bash
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```
# ExcellentTutor
