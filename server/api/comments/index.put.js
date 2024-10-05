import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('comments').update({
		content: body.content,
		media: body.media
	}).eq('id', body.id)

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
