import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
	const client = await serverSupabaseClient(event)
	const body = await readBody(event)
	await client.storage.from('images').remove([`posts/${body.post_media}`])
	await client.from('posts').delete().eq('id', body.post_id)
})
