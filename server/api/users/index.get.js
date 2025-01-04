import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await service_role.auth.admin.getUserById(query.id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data.user
	} else {
		const { data, error } = await service_role.auth.admin.listUsers({
			perPage: 1000
		})

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data.users
	}
})
