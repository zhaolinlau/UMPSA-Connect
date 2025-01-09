import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('events').select('*, bookmarks(*)').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else {
		const { data, error } = await client.from('events').select('*, bookmarks(*)').order('created_at', { ascending: false })

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
