import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	if (body.post_id) {
		const { data, error } = await client.from('bookmarks').select('id, post_id, created_at').eq('user_id', body.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else if (body.event_id) {
		const { data, error } = await client.from('bookmarks').select('id, event_id, created_at').eq('user_id', body.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else if (body.announcement_id) {
		const { data, error } = await client.from('bookmarks').select('id, announcement_id, created_at').eq('user_id', body.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	}
})
