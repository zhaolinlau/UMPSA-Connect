<template>
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator />
	<NuxtLayout>
		<v-app>
			<NuxtPage />
		</v-app>
	</NuxtLayout>
</template>

<script setup>
useHead({
	htmlAttrs: {
		class: 'h-100'
	},
	bodyAttrs: {
		class: 'h-100'
	}
})
</script>
