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
	<vRow justify="center">
		<vCol cols="12">
			<p class="text-h3 text-center">
				Redirecting...
			</p>
		</vCol>
		<vCol cols="12" lg="6">
			<VProgressLinear rounded="" color="primary" indeterminate height="10" />
		</vCol>
	</vRow>
</template>