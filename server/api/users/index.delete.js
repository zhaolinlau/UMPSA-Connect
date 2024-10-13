import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { error } = await client.auth.admin.deleteUser(body.id)

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})