export default defineNuxtRouteMiddleware((to, from) => {
	const user = useSupabaseUser()

	watch(user, async () => {
		if (user.value) {
			await navigateTo('/')
		}
	}, { immediate: true })
})
