<script setup>
const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

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

onMounted(async () => {
	announcementsChannel.subscribe()
	studentChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(announcementsChannel)
	await client.removeChannel(studentChannel)
})
</script>

<template>
	<VRow v-if="profile.role == 'admin'">
		<VCol cols="12">
			<CreateAnnouncement />
		</VCol>
	</VRow>
	<VRow justify="center">
		<template v-if="!announcements">
			<VCol cols="12" lg="7" v-for="n in 2">
				<VSkeletonLoader type="chip, heading, subtitle, image, text, actions" />
			</VCol>
		</template>
		<VCol cols="12" lg="7" v-for="announcement in announcements" :key="announcement.id" v-auto-animate>
			<AnnouncementCard :announcement="announcement" :student="student" />
		</VCol>
	</VRow>
</template>