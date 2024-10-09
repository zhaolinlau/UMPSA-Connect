import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const { data, error } = await client.from('announcements').select('*').order('created_at', { ascending: false })

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		return data
	}
})
