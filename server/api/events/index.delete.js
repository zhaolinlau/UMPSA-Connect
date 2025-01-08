import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { error } = await service_role.storage.from('images').remove([`events/${body.media}`])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		const { error } = await service_role.from('events').delete().eq('id', body.id)

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}
	}
})
