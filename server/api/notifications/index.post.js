import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)	

	const { error } = await service_role.from('notifications').insert([
		{
			user_id: body.user_id,
			announcement_id: body.announcement_id
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})