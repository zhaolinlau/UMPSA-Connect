import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)
	const { error } = await client.from('votes').delete().eq('id', body.vote_id)
	
	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
