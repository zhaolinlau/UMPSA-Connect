import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('posts').select('*').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}

	} else if (query.user_id) {
		const { data, error } = await client.from('posts').select('*').eq('user_id', query.user_id).order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else {
		const { data, error } = await client.from('posts').select('*').order('created_at', { ascending: false })

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
