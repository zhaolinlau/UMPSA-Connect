<script setup>
const props = defineProps({
	announcement: Object
})
const client = useSupabaseClient()
const route = useRoute()
const announcementForm = reactive({
	title: '',
	content: '',
	target_user: '',
	media: null
})

const editAnnouncementDialog = ref(false)

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
}

const deleteMedia = async (id, media) => {
	await client.storage.from('images').remove([`announcements/${media}`])
	await client.from('announcements').update({ media: null }).eq('id', id).select()

	announcementForm.media = null
}

const deleteAnnouncement = async (id, media) => {
	await $fetch('/api/announcements', {
		method: 'delete',
		body: {
			id,
			media
		}
	})

	await navigateTo('/announcements')
}

const id = useId()

const user = useSupabaseUser()

const { data: bookmark, refresh: refreshBookmark } = await useFetch('/api/bookmarks', {
	method: 'get',
	query: {
		announcement_id: props.announcement.id,
		user_id: user.value.id
	}
})

const bookmarkChannel = client.channel(`${id}:bookmark`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshBookmark()
)

onMounted(async () => {
	bookmarkChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarkChannel)
})

const addBookmarkSnackbar = ref(false)

const createBookmark = async (announcement_id) => {
	await $fetch('/api/bookmarks', {
		method: 'post',
		body: {
			announcement_id
		}
	})

	addBookmarkSnackbar.value = true
}

const deleteBookmarkSnackbar = ref(false)

const deleteBookmark = async (id) => {
	await $fetch('/api/bookmarks', {
		method: 'delete',
		body: {
			id
		}
	})

	deleteBookmarkSnackbar.value = true
}

const faculties = ref([
	'Faculty of Computing',
	'Faculty of Chemical and Process Engineering Technology',
	'Faculty of Civil Engineering Technology',
	'Faculty of Electrical and Electronics Engineering Technology',
	'Faculty of Manufacturing and Mechatronic Engineering Technology',
	'Faculty of Mechanical and Automotive Engineering Technology',
	'Faculty of Industrial Sciences and Technology',
	'Faculty of Industrial Management'
])
</script>

<template>
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
			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark"
				@click="bookmark ? deleteBookmark(bookmark.id) : createBookmark(announcement.id)"
				:active="bookmark ? true : false" color="primary" />
			<VSpacer />

			<VMenu location="top">
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