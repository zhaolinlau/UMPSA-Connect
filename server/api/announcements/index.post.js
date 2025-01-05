import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('announcements').insert([
		{
			title: body.title,
			content: body.content,
			media: body.media,
			target_user: body.target_user,
			user_id: body.user_id
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
