import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('bookmarks').insert([
		{
			post_id: body.post_id || null,
			event_id: body.event_id || null,
			announcement_id: body.announcement_id || null
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
