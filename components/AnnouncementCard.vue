<script setup>
const props = defineProps({
	announcement: Object,
	student: Object,
	profile: Object
})
const client = useSupabaseClient()
const route = useRoute()
const id = useId()
const user = useSupabaseUser()
const announcementForm = reactive({
	title: '',
	content: '',
	target_user: '',
	media: null
})
const loading = ref(false)
const editAnnouncementDialog = ref(false)

const bookmarked = computed(() => {
	return props.announcement.bookmarks.find(bookmark => bookmark.announcement_id == props.announcement.id && bookmark.user_id == user.value.id)
})

const toggleEditAnnouncement = async (announcement) => {
	editAnnouncementDialog.value = true
	announcementForm.title = announcement.title
	announcementForm.content = announcement.content
	announcementForm.target_user = announcement.target_user
	announcementForm.media = announcement.media
}

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

const editAnnouncementRef = ref(null)
const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const editAnnouncementSnackbar = ref(false)

const editAnnouncement = async (id, media) => {
	try {
		loading.value = true
		const { valid } = await editAnnouncementRef.value.validate()
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
				method: 'put',
				body: {
					id: id,
					title: announcementForm.title,
					content: announcementForm.content,
					target_user: announcementForm.target_user,
					media: announcementForm.media != media ? `${media_id.value}/${announcementForm.media.name}` : media
				}
			})

			editAnnouncementSnackbar.value = true
			editAnnouncementDialog.value = false
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const deleteMedia = async (id, media) => {
	try {
		loading.value = true
		await client.storage.from('images').remove([`announcements/${media}`])
		await client.from('announcements').update({ media: null }).eq('id', id).select()

		announcementForm.media = null
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const deleteAnnouncement = async (id, media) => {
	try {
		loading.value = true
		await $fetch('/api/announcements', {
			method: 'delete',
			body: {
				id,
				media
			}
		})

		await navigateTo('/announcements')
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const addBookmarkSnackbar = ref(false)

const createBookmark = async () => {
	try {
		loading.value = true
		await $fetch('/api/bookmarks', {
			method: 'post',
			body: {
				announcement_id: props.announcement.id
			}
		})

		addBookmarkSnackbar.value = true
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const deleteBookmarkSnackbar = ref(false)

const deleteBookmark = async () => {
	try {
		loading.value = true
		await $fetch('/api/bookmarks', {
			method: 'delete',
			body: {
				id: bookmarked.value.id
			}
		})

		deleteBookmarkSnackbar.value = true
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

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="The announcement has been updated."
		v-model="editAnnouncementSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="editAnnouncementSnackbar = false" />
		</template>
	</VSnackbar>

	<VCard :title="announcement.title" :text="route.params.id == announcement.id ? announcement.content : null">
		<VImg cover :src="client.storage.from('images').getPublicUrl(`announcements/${announcement.media}`).data.publicUrl"
			:alt="announcement.media" v-if="announcement.media && route.params.id == announcement.id" :draggable="false" />
		<VCardActions>
			<VBtn text="View" prepend-icon="i-mdi:eye" :to="`/announcements/${announcement.id}`" color="info" />
			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark" @click="deleteBookmark()" active color="primary"
				v-if="bookmarked" />
			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark" @click="createBookmark()" color="primary"
				v-if="!bookmarked" />
			<VSpacer />

			<VMenu location="top" v-if="profile.role == 'admin'">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>

					<VListItem title="Edit" prepend-icon="i-mdi:pencil" @click="toggleEditAnnouncement(announcement)" />

					<VListItem @click="deleteAnnouncement(announcement.id, announcement.media)" title="Delete"
						prepend-icon="i-mdi:delete" />

				</VList>
			</VMenu>
		</VCardActions>
	</VCard>

	<VDialog max-width="500" v-model="editAnnouncementDialog">
		<VCard title="Edit Announcement">
			<VForm @submit.prevent="editAnnouncement(announcement.id, announcement.media)" ref="editAnnouncementRef">
				<VContainer>
					<VTextField prepend-icon="i-mdi:format-title" v-model="announcementForm.title" label="Title"
						:rules="announcementRules.title" />

					<VTextarea prepend-icon="i-mdi:text" v-model="announcementForm.content" :rules="announcementRules.content"
						label="Content" clearable />

					<VSelect prepend-icon="i-mdi:shape" v-model="announcementForm.target_user" label="Target User"
						:items="faculties" :rules="announcementRules.target_user" />

					<VRow align="center" justify="center" class="mb-3" v-if="announcement.media">
						<VCol cols="3">
							<VImg max-height="250"
								:src="client.storage.from('images').getPublicUrl(`announcements/${announcement.media}`).data.publicUrl"
								:alt="announcement.media" v-if="announcement.media" :draggable="false" />
						</VCol>
						<VCol cols="4">
							<VBtn text="Delete media" @click="deleteMedia(announcement.id, announcement.media)" />
						</VCol>
					</VRow>

					<VFileInput accept="image/*" v-model:model-value="announcementForm.media" label="Media"
						v-if="!announcement.media" />

				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="editAnnouncementDialog = false" />
					<VBtn color="primary" variant="elevated" text="Save" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>