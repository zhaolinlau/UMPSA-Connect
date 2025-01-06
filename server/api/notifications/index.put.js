import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	if (body.read_all) {
		const { error } = await client.from('notifications').update({
			read: true
		}).eq('user_id', body.user_id).eq('user_id', body.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	} else {
		const { error } = await client.from('notifications').update({
			read: true
		}).eq('user_id', body.user_id).eq('announcement_id', body.announcement_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})