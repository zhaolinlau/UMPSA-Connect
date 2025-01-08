import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const service_role = serverSupabaseServiceRole(event)
	const body = await readBody(event)

	const { error: deleteUserError } = await service_role.auth.admin.deleteUser(body.user_id)

	if (deleteUserError) {
		throw createError({
			statusCode: deleteUserError.code,
			statusMessage: deleteUserError.message
		})
	}

	const { error: deleteAvatarError } = await service_role.storage.from('images').remove([`profiles/${body.avatar}`])

	if (deleteAvatarError) {
		throw createError({
			statusCode: deleteAvatarError.code,
			statusMessage: deleteAvatarError.message
		})
	}
})