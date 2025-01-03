import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data } = await client.from('profiles').select('*').eq('user_id', query.user_id).single()

		return data
	} else if (query.students) {
		const { data } = await client.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false })

		return data
	} else if (query.staffs) {
		const { data } = await client.from('profiles').select('*').neq('role', 'student').order('created_at', { ascending: false })

		return data
	} else {
		const { data } = await client.from('profiles').select('*').order('created_at', { ascending: false })

		return data
	}
})