import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)

	const { error } = await client.from('staffs').update({
		employee_id: body.employee_id || '',
		department: body.department || '',
		position: body.position || ''
	}).eq('user_id', body.user_id)

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})