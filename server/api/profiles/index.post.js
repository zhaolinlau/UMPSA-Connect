import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { data, error } = await service_role.from('profiles').insert([
		{
			name: body.name || '',
			gender: body.gender || '',
			role: body.role || '',
			nationality: body.nationality || '',
			avatar: body.avatar || '',
			user_id: body.user_id || ''
		}
	]).select().single()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}

	return data
})