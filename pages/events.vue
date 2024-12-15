<script setup>
const client = useSupabaseClient()
const id = useId()

const { data: events, refresh: refreshEvents } = await useFetch('/api/events', {
	method: 'get'
})

const eventsChannel = client.channel(`${id}:events`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'events' },
	async () => await refreshEvents()
)

onMounted(async () => {
	eventsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(eventsChannel)
})
</script>

<template>
	<VRow>
		<VCol cols="12">
			<CreateEvent />
		</VCol>
	</VRow>
	<VRow justify="center">
		<template v-if="!events">
			<VCol cols="12" lg="7" v-for="n in 2">
				<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
			</VCol>
		</template>
		<VCol cols="12" lg="7" v-for="event in events" :key="event.id" v-auto-animate>
			<EventCard :event="event" />
		</VCol>
	</VRow>
</template>