import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('reports').insert([
		{
			post_id: body.post_id,
			category: body.category,
			description: body.description
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
