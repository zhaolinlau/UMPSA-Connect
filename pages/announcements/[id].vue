<script setup>
const client = useSupabaseClient()
const route = useRoute()
const id = useId()

const { data: announcement, refresh: refreshAnnouncement } = await useFetch('/api/announcements', {
	method: 'get',
	query: {
		id: route.params.id,
		single: true
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
	<AnnouncementCard :announcement="announcement" />
</template>