import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const service_role = serverSupabaseServiceRole(event)

	await service_role.storage.from('images').remove([body.path])
})