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