import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { data: signUp, error: signUpError } = await service_role.auth.signUp({
		email: body.email,
		password: body.password
	})

	if (signUpError) {
		throw createError({
			statusCode: signUpError.code,
			statusMessage: signUpError.message
		})
	}

	const { data: profile } = await service_role.from('profiles').select('*').eq('user_id', signUp.user.id).single()

	if (profile) {
		throw createError({
			statusCode: 409,
			statusMessage: 'User already registered'
		})
	}

	return signUp.user
})
