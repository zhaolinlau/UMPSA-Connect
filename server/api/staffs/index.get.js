import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('staffs').select('*').eq('user_id', query.user_id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else {
		const { data, error } = await client.from('staffs').select('*').order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	}
})