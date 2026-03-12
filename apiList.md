# Dev Tinder APIs

## authRoutes

- POST /signup
- POST /login
- POST /logout

## profileRoutes

- PATCH /profile/edit
- GET /profile/view
- PATCH /profile/password

## userRoutes

- GET /user/connections
- GET /user/requests
- GET /user/feeds

## conectionRequestRoutes

- PATCH /request/send/ignored/:userId
- PATCH /request/send/interested/:userId
- PATCH /request/review/accepted/:requestId
- PATCH /request/review/rejected/:requestId
