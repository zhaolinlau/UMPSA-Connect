<script setup>
const user = useSupabaseUser()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: notifications, refresh: refreshNotifications } = await useFetch('/api/notifications', {
	method: 'get',
	query: {
		count: true,
		user_id: user.value.id
	}
})

const client = useSupabaseClient()
const id = useId()

const { data: student, refresh: refreshStudent } = await useFetch('/api/students', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements', {
	method: 'get'
})

const announcementsChannel = client.channel(`${id}:announcements`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'announcements'
}, async () => await refreshAnnouncements())

const studentChannel = client.channel(`${id}:student`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshStudent())

const notificationsChannel = client.channel(`${id}:notifications`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'notifications'
}, async () => await refreshNotifications())

onMounted(async () => {
	announcementsChannel.subscribe()
	studentChannel.subscribe()
	notificationsChannel.subscribe()
	await fetchNotifications()
})

const fetchNotifications = async () => {
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
}

watch(announcements, async () => {
	await fetchNotifications()
})

onUnmounted(async () => {
	await client.removeChannel(notificationsChannel)
	await client.removeChannel(announcementsChannel)
	await client.removeChannel(studentChannel)
})
</script>

<template>
	<NavBar :profile="profile" :user="user" :notifications="notifications" />
	<BackTop />
	<VMain>
		<VContainer>
			<slot />
		</VContainer>
	</VMain>
</template>