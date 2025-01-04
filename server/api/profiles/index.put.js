import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	if (body.delete_avatar) {
		await service_role.from('profiles').update({ avatar: '' }).eq('user_id', body.user_id)
	} else {
		const { error } = await service_role.from('profiles').update({
			name: body.name || '',
			gender: body.gender || '',
			nationality: body.nationality || '',
			avatar: body.avatar || '',
			role: body.role || ''
		}).eq('user_id', body.user_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})