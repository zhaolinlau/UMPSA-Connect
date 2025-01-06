import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data } = await client.from('notifications').select('*').eq('user_id', query.user_id).eq('announcement_id', query.announcement_id).single()

		return data
	} else if (query.count) {
		const { count } = await client.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', query.user_id).eq('read', false)

		return count
	} else {
		const { data } = await client.from('notifications').select('*, announcements(*)').eq('user_id', query.user_id).order('created_at', { ascending: false })

		return data
	}
})