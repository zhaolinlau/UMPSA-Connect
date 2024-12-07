import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.post_id) {
		const { data, error } = await client.from('bookmarks').select('id, post_id, created_at').eq('user_id', query.user_id).eq('post_id', query.post_id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else if (query.event_id) {
		const { data, error } = await client.from('bookmarks').select('id, event_id, created_at').eq('user_id', query.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else if (query.announcement_id) {
		const { data, error } = await client.from('bookmarks').select('id, announcement_id, created_at').eq('user_id', query.user_id)

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
