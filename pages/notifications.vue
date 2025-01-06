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

const readNotifications = async () => {
	await $fetch('/api/notifications', {
		method: 'PUT',
		body: {
			read_all: true,
			user_id: user.value.id
		}
	})
}

const tab = ref(null)
</script>

<template>
	<VContainer>
		<VRow justify="center">
			<VCol cols="12" lg="7">
				<VBtn text="Read all" color="primary" @click="readNotifications" />
			</VCol>
			<VCol cols="12" lg="7">
				<VTabs v-model="tab" color="primary">
					<VTab value="unread">Unread</VTab>
					<VTab value="read">Read</VTab>
				</VTabs>

				<VDivider />

				<VTabsWindow v-model="tab">
					<VTabsWindowItem value="unread">
						<VRow>
							<VCol cols="12" v-for="notification in notifications" :key="notification.id">
								<AnnouncementCard :announcement="notification.announcements" :profile="profile" :student="student"
									v-if="!notification.read" />
							</VCol>
						</VRow>
					</VTabsWindowItem>

					<VTabsWindowItem value="read">
						<VRow>
							<VCol cols="12" v-for="notification in notifications" :key="notification.id">
								<AnnouncementCard :announcement="notification.announcements" :profile="profile" :student="student"
									v-if="notification.read" />
							</VCol>
						</VRow>
					</VTabsWindowItem>
				</VTabsWindow>

			</VCol>
		</VRow>
	</VContainer>
</template>