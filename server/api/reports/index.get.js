import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('reports').select('*').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else {
		const { data, error } = await client.from('reports').select('*').order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	}
})
