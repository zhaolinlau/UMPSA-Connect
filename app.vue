<script setup>
useHead({
	title: 'UMPSA Connect'
})
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator />
	<NuxtLayout>
		<v-app>
			<NuxtPage />
		</v-app>
	</NuxtLayout>
</template>
