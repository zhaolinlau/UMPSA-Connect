import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	const { data, error } = await client.from('nested_comments').select('*').eq('comment_id', query.comment_id)

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		return data
	}
})
