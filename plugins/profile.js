export default defineNuxtPlugin({
	name: 'profile',
	enforce: 'pre',
	async setup({ provide }) {
		const profile = useProfile()
		const client = useSupabaseClient()
		const user = useSupabaseUser()

		watchEffect(async () => {
			if (user.value) {
				const { data } = await client.from('profiles').select().eq('user_id', user.value.id).single()

				profile.value = data
			} else {
				profile.value = {}
			}
		})

		provide('profile', profile)
	}
})