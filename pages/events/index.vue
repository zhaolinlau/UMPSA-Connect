<script setup>
const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()

const { data: events, refresh: refreshEvents } = await useFetch('/api/events', {
	method: 'get'
})

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const eventsChannel = client.channel(`${id}:events`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'events' },
	async () => await refreshEvents()
)

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshEvents()
)

onMounted(async () => {
	bookmarksChannel.subscribe()
	eventsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(eventsChannel)
})
</script>

<template>
	<VRow justify="center">
		<VCol cols="12" lg="7" v-if="profile.role == 'admin'">
			<CreateEvent />
		</VCol>
		<VCol cols="12" lg="7" v-for="n in 2" v-if="!events">
			<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
		</VCol>
		<VCol cols="12" lg="7" v-for="event in events" :key="event.id" v-auto-animate>
			<EventCard :event="event" :profile="profile" />
		</VCol>
	</VRow>
</template>