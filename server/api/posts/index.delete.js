import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)
	const { error } = await client.storage.from('images').remove([`posts/${body.post_media}`])

	if (error) {
		throw createError({
			name: error.name,
			message: error.message
		})
	} else {
		const { error } = await client.from('posts').delete().eq('id', body.post_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})
