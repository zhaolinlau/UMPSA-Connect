<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const id = useId()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: notifications, refresh: refreshNotifications } = await useFetch('/api/notifications', {
	method: 'GET',
	query: {
		user_id: user.value.id
	}
})

const { data: student, refresh: refreshStudent } = await useFetch('/api/students', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const studentChannel = client.channel(`${id}:students`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshStudent())

const notificationsChannel = client.channel(`${id}:notifications`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'notifications'
}, async () => await refreshNotifications())

onMounted(async () => {
	notificationsChannel.subscribe()
	studentChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(studentChannel)
	await client.removeChannel(notificationsChannel)
})
</script>

<template>
	<VContainer>
		<VRow>
			<VCol cols="12" v-for="notification in notifications" :key="notification.id">
				<AnnouncementCard :announcement="notification.announcements" :profile="profile" :student="student" />
			</VCol>
		</VRow>
	</VContainer>
</template>