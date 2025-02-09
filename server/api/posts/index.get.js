import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const query = getQuery(event)

	if (query.single) {
		const { data, error } = await client.from('posts').select('*, comments(*), votes(*), bookmarks(*)').eq('id', query.id).single()

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else if (query.user_id) {
		const { data, error } = await client.from('posts').select('*, comments(*), votes(*), bookmarks(*)').eq('user_id', query.user_id).order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else if (query.search_input) {
		const { data, error } = await client.from('posts').select('*, comments(*), votes(*), bookmarks(*)').or(`title.ilike.%${query.search_input}%,content.ilike.%${query.search_input}%`).order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	} else {
		const { data, error } = await client.from('posts').select('*, comments(*), votes(*), bookmarks(*)').order('created_at', { ascending: false })

		if (error) {
			throw createError({
				statusCode: error.code,
				statusMessage: error.message
			})
		}

		return data
	}
})
