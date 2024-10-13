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
		} else {
			return data.user
		}
	} else {
		const { data, error } = await client.auth.admin.listUsers({
			perPage: 1000
		})

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		} else {
			return data.users
		}
	}
})
