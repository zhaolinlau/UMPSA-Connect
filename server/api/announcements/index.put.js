import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)
	const { error } = await service_role.from('announcements').update({
		title: body.title,
		content: body.content,
		media: body.media,
		target_user: body.target_user
	}).eq('id', body.id)

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})
