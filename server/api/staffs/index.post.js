import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)
	const { error } = await client.from('staffs').insert([
		{
			employee_id: body.employee_id,
			name: body.name,
			avatar: body.avatar,
			gender: body.gender,
			nationality: body.nationality,
			department: body.department,
			position: body.position
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})