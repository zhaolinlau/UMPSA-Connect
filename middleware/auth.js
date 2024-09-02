export default defineNuxtRouteMiddleware((to, from) => {
	const session = useSupabaseSession()

	if (session.value) {
		return abortNavigation()
	}
})