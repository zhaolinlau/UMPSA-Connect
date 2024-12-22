import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.storage.from('images').remove([`events/${body.media}`])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		const { error } = await client.from('events').delete().eq('id', body.id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})
