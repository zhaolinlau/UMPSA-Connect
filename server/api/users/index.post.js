import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { data: newUser, error: newUserError } = await service_role.auth.admin.createUser({
		email: body.email,
		password: body.password,
		email_confirm: true
	})

	if (newUserError) {
		throw createError({
			statusCode: newUserError.code,
			statusMessage: newUserError.message
		})
	}

	return newUser.user
})
