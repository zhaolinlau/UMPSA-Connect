import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)

	const { data, error } = await client.from('reports').select('id, user_id, post_id, category, description, created_at')

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		return data
	}
})
