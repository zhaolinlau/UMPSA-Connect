export default defineNuxtRouteMiddleware(async (to, from) => {
	const user = useSupabaseUser()

	const { data: profile } = await useFetch('/api/profiles', {
		method: 'get',
		query: {
			single: true,
			user_id: user.value.id
		}
	})

	if (profile.value.role != 'admin') {
		return abortNavigation({
			statusCode: 401,
			statusMessage: 'Unauthorized'
		})
	}
})