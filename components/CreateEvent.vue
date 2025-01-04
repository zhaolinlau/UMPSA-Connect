<script setup>
const client = useSupabaseClient()
const eventForm = reactive({
	title: '',
	content: '',
	media: null
})
const loading = ref(false)
const media_id = ref('')
const eventFormRef = ref(null)

const eventFormDialog = ref(false)

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

const randomNumber = async () => {
	media_id.value = Math.random()
}

const createEvent = async () => {
	try {
		loading.value = true
		const { valid } = await eventFormRef.value.validate()
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
				method: 'post',
				body: {
					title: eventForm.title,
					category: eventForm.category,
					content: eventForm.content,
					media: eventForm.media ? `${media_id.value}/${eventForm.media.name}` : ''
				}
			})

			eventFormDialog.value = false
			eventSnackbar.value = true
			await eventFormRef.value.reset()
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const eventSnackbar = ref(false)
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Event has been created."
		v-model="eventSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="eventSnackbar = false" />
		</template>
	</VSnackbar>

	<VBtn text="Add Event" color="primary" prepend-icon="i-mdi:calendar-plus" @click="eventFormDialog = true" />

	<VDialog max-width="500" v-model:model-value="eventFormDialog">
		<VCard title="Create Event">
			<VForm @submit.prevent="createEvent" ref="eventFormRef">
				<VContainer>
					<VTextField prepend-icon="i-mdi:format-title" v-model="eventForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="eventRules.title" />
					<VTextarea prepend-icon="i-mdi:text" v-model="eventForm.content" :rules="eventRules.content" label="Content"
						clearable />
					<VFileInput accept="image/*" v-model:model-value="eventForm.media" label="Media" />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="eventFormDialog = false" />
					<VBtn color="primary" variant="elevated" text="Submit" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>