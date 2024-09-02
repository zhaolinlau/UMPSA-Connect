import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)
	const { data, error } = await client.from('posts').select('*, votes(id, post_id, user_id), comments(*)').eq('id', query.post_id).single()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}

	return data
})
