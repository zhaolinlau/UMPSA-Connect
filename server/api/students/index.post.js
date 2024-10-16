import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)
	const { error } = await client.from('students').insert([
		{
			matric_id: body.matric_id,
			name: body.name,
			gender: body.gender,
			nationality: body.nationality,
			avatar: body.avatar,
			faculty: body.faculty,
			course: body.course
		}
	])

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	}
})