import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = serverSupabaseServiceRole(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.auth.admin.getUserById(query.id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data.user
	}
})
