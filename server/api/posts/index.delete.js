import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)
	const { error } = await service_role.storage.from('images').remove([`posts/${body.post_media}`])

	if (error) {
		throw createError({
			name: error.name,
			message: error.message
		})
	} else {
		const { error } = await service_role.from('posts').delete().eq('id', body.post_id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})
