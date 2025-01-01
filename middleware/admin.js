export default defineNuxtRouteMiddleware(async (to, from) => {
	const profile = useProfile()

	watchEffect(async () => {
		if (profile.value && profile.value.role !== 'admin') {
			return abortNavigation({
				statusCode: 401,
				statusMessage: 'Unauthorized'
			})
		} else {
			await until(profile).toBeTruthy()
		}
	})
})