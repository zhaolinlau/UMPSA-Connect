import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('comments').select('*').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else if (query.count) {
		const { count, error } = await client.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', query.post_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return count
	} else {
		const { data, error } = await client.from('comments').select('*').eq('post_id', query.post_id).order('created_at', { ascending: false })

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
