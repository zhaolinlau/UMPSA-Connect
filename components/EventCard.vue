<script setup>
const props = defineProps({
	event: Object,
	profile: Object
})
const loading = ref(false)
const client = useSupabaseClient()
const route = useRoute()

const eventForm = reactive({
	title: '',
	content: '',
	media: null
})

const editEventDialog = ref(false)

const toggleEditEvent = async (event) => {
	editEventDialog.value = true
	eventForm.title = event.title
	eventForm.content = event.content
	eventForm.media = event.media
}

const eventRules = ref({
	title: [
		value => {
			if (value) return true
			return 'Title is required.'
		}
	],
	content: [
		value => {
			if (value) return true
			return 'Content is required.'
		}
	]
})

const editEventRef = ref(null)
const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const editEventSnackbar = ref(false)

const editEvent = async (id, media) => {
	try {
		loading.value = true
		const { valid } = await editEventRef.value.validate()
		if (valid) {
			await randomNumber()
			if (eventForm.media) {
				await client.storage.from('images')
					.upload(`events/${media_id.value}/${eventForm.media.name}`, eventForm.media, {
						cacheControl: '3600',
						upsert: false
					})
			}

			await $fetch('/api/events', {
				method: 'put',
				body: {
					id: id,
					title: eventForm.title,
					content: eventForm.content,
					media: eventForm.media != media ? `${media_id.value}/${eventForm.media.name}` : media
				}
			})

			editEventSnackbar.value = true
			editEventDialog.value = false
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const deleteMedia = async (id, media) => {
	await client.storage.from('images').remove([`events/${media}`])
	await client.from('events').update({ media: null }).eq('id', id).select()

	eventForm.media = null
}

const deleteEvent = async (id, media) => {
	try {
		loading.value = true
		await $fetch('/api/events', {
			method: 'delete',
			body: {
				id,
				media
			}
		})

		await navigateTo('/events')
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const user = useSupabaseUser()

const bookmarked = computed(() => {
	return props.event.bookmarks.find(bookmark => bookmark.event_id == props.event.id && bookmark.user_id == user.value.id)
})

const addBookmarkSnackbar = ref(false)

const createBookmark = async () => {
	await $fetch('/api/bookmarks', {
		method: 'post',
		body: {
			event_id: props.event.id
		}
	})

	addBookmarkSnackbar.value = true
}

const deleteBookmarkSnackbar = ref(false)

const deleteBookmark = async () => {
	await $fetch('/api/bookmarks', {
		method: 'delete',
		body: {
			id: bookmarked.value.id
		}
	})

	deleteBookmarkSnackbar.value = true
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar position="relative" variant="elevated" location="bottom right" timer="success" text="Added to bookmark."
		v-model="addBookmarkSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="addBookmarkSnackbar = false" />
		</template>
	</VSnackbar>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Deleted from bookmark."
		v-model="deleteBookmarkSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="deleteBookmarkSnackbar = false" />
		</template>
	</VSnackbar>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="The event has been updated."
		v-model="editEventSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="editEventSnackbar = false" />
		</template>
	</VSnackbar>

	<VCard :title="event.title" :text="route.params.id == event.id ? event.content : null">
		<VImg cover :src="client.storage.from('images').getPublicUrl(`events/${event.media}`).data.publicUrl"
			:alt="event.media" v-if="event.media && route.params.id == event.id" :draggable="false" />
		<VCardActions>
			<VBtn text="View" prepend-icon="i-mdi:eye" :to="`/events/${event.id}`" color="info" />
			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark" @click="deleteBookmark" active color="primary"
				v-if="bookmarked" />

			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark" @click="createBookmark" color="primary" v-if="!bookmarked" />
			<VSpacer />

			<VMenu location="top" v-if="profile.role == 'admin'">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>

					<VListItem title="Edit" prepend-icon="i-mdi:pencil" @click="toggleEditEvent(event)" />

					<VListItem @click="deleteEvent(event.id, event.media)" title="Delete" prepend-icon="i-mdi:delete" />

				</VList>
			</VMenu>
		</VCardActions>
	</VCard>

	<VDialog max-width="500" v-model="editEventDialog">
		<VCard title="Edit Event">
			<VForm @submit.prevent="editEvent(event.id, event.media)" ref="editEventRef">
				<VContainer>
					<VTextField prepend-icon="i-mdi:format-title" v-model="eventForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="eventRules.title" />

					<VTextarea prepend-icon="i-mdi:text" v-model="eventForm.content" label="Content" clearable />

					<VRow align="center" justify="center" class="mb-3" v-if="event.media">
						<VCol cols="3">
							<VImg max-height="250"
								:src="client.storage.from('images').getPublicUrl(`events/${event.media}`).data.publicUrl"
								:alt="event.media" v-if="event.media" :draggable="false" />
						</VCol>
						<VCol cols="4">
							<VBtn text="Delete media" @click="deleteMedia(event.id, event.media)" />
						</VCol>
					</VRow>

					<VFileInput accept="image/*" v-model:model-value="eventForm.media" label="Media" v-if="!event.media" />

				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="editEventDialog = false" />
					<VBtn color="primary" variant="elevated" text="Save" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>