'use strict'

const Post = use('App/Models/Post')
const { validate } = use('Validator')
const Database = use('Database')
class PostController {
    /**
     *  Get all posts
     * @param {*} param0 
     */
    async index({ view, auth }) {

            const posts = await Post.query().orderBy('id', 'desc').fetch()

            return view.render('posts.index', { posts: posts.toJSON() })
        }
        /**
         * Load create post page
         * @param {*} param0 
         */
    create({ view }) {

            return view.render('posts.create')
        }
        /**
         * Save post in DB
         * @param {*} param0 
         */
    async store({ session, auth, request, response }) {
            ata = request.only(['title', 'body'])

            /**
             * Validating our data.
             *         
             */
            const validation = await validate(data, {
                title: 'required',
                body: 'required',
            })

            /**
             * If validation fails, early returns with validation message.
             */
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashAll()

                return response.redirect('back')
            }
            data.user_id = auth.user.id

            await Post.create(data)

            return response.redirect('/')
        }
        /**
         * Load Edit Post view
         * @param {*} param0 
         */
    async edit({ params, view }) {
            /**
             * Finding the post.
             *
             */
            const post = await Post.findOrFail(params.id)

            return view.render('posts.edit', { post: post.toJSON() })
        }
        /**
         * Update post data
         * @param {*} param0 
         */
    async update({ params, session, request, response }) {
            /**
             * Getting needed parameters.
             *
             * ref: http://adonisjs.com/docs/4.0/request#_only
             */
            const data = request.only(['title', 'body'])

            /**
             * Validating our data.
             *
             * ref: http://adonisjs.com/docs/4.0/validator
             */
            const validation = await validate(data, {
                title: 'required',
                body: 'required',
            })

            /**
             * If validation fails, early returns with validation message.
             */
            if (validation.fails()) {
                session
                    .withErrors(validation.messages())
                    .flashAll()

                return response.redirect('back')
            }

            /**
             * Finding the post and updating fields on it
             * before saving it to the database.
             *
             */
            const post = await Post.findOrFail(params.id)
            post.merge(data)
            await post.save()

            return response.redirect('/')
        }
        /**
         * Delete the post
         * @param {*} param0 
         */
    async delete({ params, response }) {
        /**
         * Finding the post and deleting it
         *
         */
        const post = await Post.findOrFail(params.id)
        await post.delete()

        return response.redirect('/')
    }
}

module.exports = PostController