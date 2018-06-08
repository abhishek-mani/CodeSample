'use strict'

const User = use('App/Models/User')
const { validate } = use('Validator')

class UserController {
    create({ view }) {
        /**
         * Render the view 'user.create'.
         *
         */
        return view.render('user.create')
    }

    async store({ session, request, response }) {
        /**
         * Getting needed parameters.
         *
         */
        const data = request.only(['username', 'email', 'password', 'password_confirmation'])

        /**
         * Validating our data.
         *
         */
        const validation = await validate(data, {
            username: 'required|unique:users',
            email: 'required|email|unique:users',
            password: 'required',
            password_confirmation: 'required_if:password|same:password',
        })

        /**
         * If validation fails, early returns with validation message.
         */
        if (validation.fails()) {
            session
                .withErrors(validation.messages())
                .flashExcept(['password'])

            return response.redirect('back')
        }

        // Deleting the confirmation field since we don't
        // want to save it
        delete data.password_confirmation

        /**
         * Creating a new user into the database.
         *
         */
        await User.create(data)

        return response.redirect('/')
    }
}

module.exports = UserController