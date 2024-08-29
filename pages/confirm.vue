<script setup>
definePageMeta({
	layout: 'guest'
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
	<v-row justify="center">
		<v-col cols="12">
			<p class="text-h3 text-center">
				Redirecting...
			</p>
		</v-col>
		<v-col cols="12" lg="6">
			<v-progress-linear color="primary" indeterminate height="10"></v-progress-linear>
		</v-col>
	</v-row>
</template>