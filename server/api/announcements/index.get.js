import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('announcements').select('*').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data
		}
	} else if (query.target_user) {
		const { data, error } = await client.from('announcements').select('*').eq('target_user', query.target_user).order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else {
		const { data, error } = await client.from('announcements').select('*').order('created_at', { ascending: false })

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
