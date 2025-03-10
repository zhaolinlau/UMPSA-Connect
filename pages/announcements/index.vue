<script setup>
const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()
const faculties = ref([
	'All',
	'Faculty of Computing',
	'Faculty of Chemical and Process Engineering Technology',
	'Faculty of Civil Engineering Technology',
	'Faculty of Electrical and Electronics Engineering Technology',
	'Faculty of Manufacturing and Mechatronic Engineering Technology',
	'Faculty of Mechanical and Automotive Engineering Technology',
	'Faculty of Industrial Sciences and Technology',
	'Faculty of Industrial Management'
])
const target_user = ref('All')

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

const bookmarksChannel = client.channel(`${id}:bookmarks`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'bookmarks'
}, async () => await refreshAnnouncements())


onMounted(async () => {
	bookmarksChannel.subscribe()
	announcementsChannel.subscribe()
	studentChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(announcementsChannel)
	await client.removeChannel(studentChannel)
})
</script>

<template>
	<VRow justify="center">
		<VCol cols="12" lg="7" v-if="profile.role == 'admin'">
			<CreateAnnouncement />
		</VCol>
		<VCol cols="12" lg="7">
			<VSelect :items="faculties" v-model="target_user" label="Sort by" />
		</VCol>
		<VCol cols="12" lg="7" v-for="n in 2" v-if="!announcements">
			<VSkeletonLoader type="chip, heading, subtitle, image, text, actions" />
		</VCol>
		<VCol cols="12" lg="7" v-for="announcement in announcements" :key="announcement.id" v-auto-animate>
			<AnnouncementCard :announcement="announcement" :student="student" :profile="profile" />
		</VCol>
	</VRow>
</template>