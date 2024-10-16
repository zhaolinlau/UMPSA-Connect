import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('events').insert([
		{
			title: body.title,
			content: body.content,
			media: body.media
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
