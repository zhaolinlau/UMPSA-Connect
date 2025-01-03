import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)
	const { error } = await service_role.from('students').insert([
		{
			matric_id: body.matric_id || '',
			faculty: body.faculty || '',
			course: body.course || '',
			user_id: body.user_id || ''
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})