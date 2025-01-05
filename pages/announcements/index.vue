<script setup>
const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()
const faculties = useFaculty()
const target_user = ref('')

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

if (student.value) {
	target_user.value = student.value.faculty
}

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements', {
	method: 'get',
	query: {
		target_user
	},
	watch: [target_user]
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
		<VCol cols="12">
			<VSelect :items="faculties" v-model="target_user" />
		</VCol>
		<VCol cols="12" lg="7" v-for="n in 2" v-if="!announcements">
			<VSkeletonLoader type="chip, heading, subtitle, image, text, actions" />
		</VCol>
		<VCol cols="12" lg="7" v-for="announcement in announcements" :key="announcement.id" v-auto-animate>
			<AnnouncementCard :announcement="announcement" :student="student" />
		</VCol>
	</VRow>
</template>