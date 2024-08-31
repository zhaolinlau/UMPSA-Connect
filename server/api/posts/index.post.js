import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { data, error } = await client.from('posts').insert([
		{
			title: body.title,
			category: body.category,
			content: body.content,
			media: body.media
		},
	]).select()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}

	return data
})
