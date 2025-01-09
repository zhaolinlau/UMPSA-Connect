<script setup>
const client = useSupabaseClient()
const route = useRoute()
const id = useId()
const user = useSupabaseUser()

const { data: event, refresh: refreshEvent } = await useFetch('/api/events', {
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

const eventChannel = client.channel(`${id}:event`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'events' },
	async () => await refreshEvent()
)

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshEvent()
)

onMounted(async () => {
	eventChannel.subscribe()
	bookmarksChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(eventChannel)
})
</script>

<template>
	<Container>
		<VRow justify="center">
			<VCol cols="12" lg="7">
				<EventCard :event="event" :profile="profile" />
			</VCol>
		</VRow>
	</Container>
</template>