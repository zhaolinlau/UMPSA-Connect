<script setup>
useHead({
	title: 'UMPSA Connect',
	meta: [
		{
			name: 'google-site-verification',
			content: 'VtoMnB1qYS9XFl4WG3wUGq17dPOTwoH5vyWofp90A-Y'
		}
	]
})

useSeoMeta({
	title: 'UMPSA Connect',
	ogTitle: 'UMPSA Connect',
	description: 'UMPSA Connect serves as a comprehensive solution to enhance communication, streamline information dissemination, foster greater engagement, and better data security within the UMPSA student community. By empowering students with easy access to relevant information and facilitating seamless communication, the platform contributes to a more connected and informed campus environment.',
	ogDescription: 'UMPSA Connect serves as a comprehensive solution to enhance communication, streamline information dissemination, foster greater engagement, and better data security within the UMPSA student community. By empowering students with easy access to relevant information and facilitating seamless communication, the platform contributes to a more connected and informed campus environment.',
	ogImage: '/img/login.png',
	twitterCard: 'summary_large_image',
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
