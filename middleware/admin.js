export default defineNuxtRouteMiddleware(async (to, from) => {
	const profile = useProfile()

	if (!profile.value) {
		await until(() => profile.value).toBeTruthy()
	}

	if (profile.value.role !== 'admin') {
		return abortNavigation({
			statusCode: 401,
			statusMessage: 'Unauthorized'
		})
	}
})