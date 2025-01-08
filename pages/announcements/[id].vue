<script setup>
const client = useSupabaseClient()
const route = useRoute()
const id = useId()
const user = useSupabaseUser()

const { data: announcement, refresh: refreshAnnouncement } = await useFetch('/api/announcements', {
	method: 'get',
	query: {
		id: route.params.id,
		single: true
	}
})

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: student } = await useFetch('/api/students', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const announcementChannel = client.channel(`${id}:announcement`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'announcements' },
	async () => await refreshAnnouncement()
)

onMounted(async () => {
	announcementChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(announcementChannel)
})
</script>

<template>
	<VContainer>
		<VRow justify="center">
			<VCol cols="12" lg="7">
				<AnnouncementCard :announcement="announcement" :profile="profile" :student="student" />
			</VCol>
		</VRow>
	</VContainer>
</template>