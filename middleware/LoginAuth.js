export default defineNuxtRouteMiddleware((to, from) => {
	const session = useSupabaseSession()

	watch(session, async () => {
		if (session.value) {
			await navigateTo('/')
		}
	}, { immediate: true })
})
