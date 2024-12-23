<script setup>
const client = useSupabaseClient()
const id = useId()

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements', {
	method: 'get'
})

const announcementsChannel = client.channel(`${id}:announcements`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'announcements'
}, async () => await refreshAnnouncements())

onMounted(async () => {
	announcementsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(announcementsChannel)
})
</script>

<template>
	<VRow>
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
			<AnnouncementCard :announcement="announcement" />
		</VCol>
	</VRow>
</template>