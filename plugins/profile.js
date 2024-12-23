export default defineNuxtPlugin({
	name: 'profile',
	enforce: 'pre',
	parallel: true,
	async setup(nuxtApp) {
		const profile = useProfile()
		const client = useSupabaseClient()
		const user = useSupabaseUser()

		watch(user, async () => {
			if (user.value) {
				const { data, error } = await client.from('profiles').select().eq('user_id', user.value.id).single()
				if (error) {
					throw createError({
						statusCode: error.code,
						statusMessage: error.message
					})
				} else {
					profile.value = data
				}
			}
		}, { immediate: true })
	}
})