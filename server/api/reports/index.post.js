import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('reports').insert([
		{
			post_id: body.post_id,
			comment_id: body.comment_id,
			category: body.category,
			description: body.description,
			nested_comment_id: body.nested_comment_id
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
