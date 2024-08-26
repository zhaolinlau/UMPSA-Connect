<script setup>
definePageMeta({
	layout: false
})

const user = useSupabaseUser()

watch(user, async () => {
	if (user.value) {
		await navigateTo('/')
	} else {
		await navigateTo('/login')
	}
}, { immediate: true })
</script>

<template>
	<v-container class="fill-height d-flex justify-center">
		<p class="text-h3">
			Redirecting...
		</p>
	</v-container>
</template>