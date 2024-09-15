<script setup>
useHead({
	title: 'UMPSA Connect',
	link: [
		{
			rel: 'icon', href: '/favicon.ico', sizes: '48x48'
		},
		{
			rel: 'icon', href: '/favicon.svg', sizes: 'any', type: 'image/svg+xml'
		},
		{
			rel: 'apple-touch-icon', href: '/img/apple-touch-icon.jpeg'
		}
	],
	htmlAttrs: {
		lang: 'en'
	}
})

useSeoMeta({
	title: 'UMPSA Connect',
	ogTitle: 'UMPSA Connect',
	description: 'UMPSA Connect serves as a comprehensive solution to enhance communication, streamline information dissemination, foster engagement, and improve data security across the entire UMPSA community. By providing users with easy access to relevant information and facilitating seamless communication, the platform contributes to a more connected and informed campus environment.',
	ogDescription: 'UMPSA Connect serves as a comprehensive solution to enhance communication, streamline information dissemination, foster engagement, and improve data security across the entire UMPSA community. By providing users with easy access to relevant information and facilitating seamless communication, the platform contributes to a more connected and informed campus environment.',
	ogImage: '/img/login.png',
	twitterCard: 'summary_large_image',
})
</script>

<template>
	<NuxtPwaManifest />
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
