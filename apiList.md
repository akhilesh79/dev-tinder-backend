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
- PATCH /request/send/accepted/:requestId
- PATCH /request/send/rejected/:requestId
