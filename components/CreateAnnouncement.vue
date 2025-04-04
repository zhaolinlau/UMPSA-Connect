<script setup>
const client = useSupabaseClient()
const announcementForm = reactive({
	title: '',
	content: '',
	target_user: '',
	media: null
})
const loading = ref(false)
const media_id = ref('')
const announcementFormRef = ref(null)
const announcementFormDialog = ref(false)
const announcementSnackbar = ref(false)

const announcementRules = ref({
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
	],
	target_user: [
		value => {
			if (value?.length > 3) return true
			return 'Please select a target user.'
		}
	]
})

const randomNumber = async () => {
	media_id.value = Math.random()
}
const user = useSupabaseUser()
const createAnnouncement = async () => {
	try {
		loading.value = true
		const { valid } = await announcementFormRef.value.validate()

		if (valid) {
			await randomNumber()

			if (announcementForm.media) {
				await client.storage.from('images')
					.upload(`announcements/${media_id.value}/${announcementForm.media.name}`, announcementForm.media, {
						cacheControl: '3600',
						upsert: false
					})
			}

			await $fetch('/api/announcements', {
				method: 'post',
				body: {
					title: announcementForm.title,
					target_user: announcementForm.target_user,
					content: announcementForm.content,
					media: announcementForm.media ? `${media_id.value}/${announcementForm.media.name}` : null,
					user_id: user.value.id
				}
			})


			await announcementFormRef.value.reset()
			announcementFormDialog.value = false
			announcementSnackbar.value = true
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const faculties = useFaculty()
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Announcement has been created."
		v-model="announcementSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="announcementSnackbar = false" />
		</template>
	</VSnackbar>

	<VBtn text="Add Announcement" color="primary" prepend-icon="i-mdi:newspaper-plus"
		@click="announcementFormDialog = true" />

	<VDialog max-width="500" v-model:model-value="announcementFormDialog">
		<VCard title="Create Announcement">
			<VForm @submit.prevent="createAnnouncement" ref="announcementFormRef">
				<VContainer>
					<VTextField prepend-icon="i-mdi:format-title" v-model="announcementForm.title" label="Title"
						:rules="announcementRules.title" />
					<VSelect prepend-icon="i-mdi:shape" v-model="announcementForm.target_user" label="Target User"
						:items="faculties" :rules="announcementRules.target_user" />
					<VTextarea prepend-icon="i-mdi:text" v-model="announcementForm.content" :rules="announcementRules.content"
						label="Content" clearable />
					<VFileInput accept="image/*" v-model:model-value="announcementForm.media" label="Media" />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="announcementFormDialog = false" />
					<VBtn color="primary" variant="elevated" text="Submit" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>