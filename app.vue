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

const { system } = useColorMode()
const theme = ref('light')

const changeTheme = async () => {
	if (system.value != theme.value) {
		theme.value = system.value
	}
}

watch(system, async () => {
	await changeTheme()
})

onMounted(async () => {
	await changeTheme()
})

const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()

const { data: student, refresh: refreshStudent } = await useFetch('/api/students', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements', {
	method: 'get',
	query: {
		target_user: student.value.faculty
	}
})

const announcementsChannel = client.channel(`${id}:announcements`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'announcements'
}, async () => await refreshAnnouncements())

const studentChannel = client.channel(`${id}:student`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshStudent())

onMounted(async () => {
	announcementsChannel.subscribe()
	studentChannel.subscribe()
})

watch(announcements, async () => {
	if (student.value && announcements.value) {
		for (const announcement of announcements.value) {
			if (student.value.faculty == announcement.target_user) {
				try {
					const notificationResponse = await $fetch('/api/notifications', {
						method: 'GET',
						query: {
							single: true,
							user_id: student.value.user_id,
							announcement_id: announcement.id
						}
					})

					if (!notificationResponse) {
						await $fetch('/api/notifications', {
							method: 'POST',
							body: {
								announcement_id: announcement.id,
								user_id: student.value.user_id
							}
						})

						const { show, onClick } = useWebNotification({
							title: announcement.title,
							body: announcement.content,
							dir: 'auto',
							lang: 'en',
							tag: 'Announcement',
						})

						await show()
						onClick(async () => await navigateTo(`/announcements/${announcement.id}`))
					}
				} catch (error) {
					console.error(error)
				}
			}
		}
	}
})

onUnmounted(async () => {
	await client.removeChannel(announcementsChannel)
	await client.removeChannel(studentChannel)
})
</script>

<template>
	<NuxtPwaManifest />
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator />
	<VApp :theme="theme">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</VApp>
</template>
