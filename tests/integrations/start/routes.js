'use strict'

/*
|--------------------------------------------------------------------------
| Custom Routes
|--------------------------------------------------------------------------
|
| You may create custom routes in here to handle more requests. You should
| visit AdonisX documentation in order to understand how AdonisX route creator
| works.
|
| const Route = use('Route')
| Route.post('/api/auth/login', 'AuthController.login')
|
*/

const Route = use('Route')
Route.post('/api/users/login', 'UserController.login')
