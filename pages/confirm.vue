<script setup>
definePageMeta({
	layout: false
})

const session = useSupabaseSession()

watch(session, async () => {
	if (session.value) {
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