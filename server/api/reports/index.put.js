import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	if (body.post_id) {
		const { error } = await service_role.from('reports').update({
			status: body.status
		}).eq('post_id', body.post_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	} else if (body.comment_id) {
		const { error } = await service_role.from('reports').update({
			status: body.status
		}).eq('comment_id', body.comment_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	} else {
		const { error } = await service_role.from('reports').update({
			status: body.status
		}).eq('id', body.id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})
