<script setup>
const props = defineProps({
	comment: Object,
	profile: Object
})

const { data: comment_user } = await useFetch('/api/users', {
	method: 'get',
	query: {
		id: props.comment.user_id,
		single: true
	}
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const toggleEditComment = async (comment) => {
	editCommentDialog.value = true
	commentForm.content = comment.content
	commentForm.media = comment.media
}
const route = useRoute()

const deleteComment = async (id, media) => {
	if (route.path == `/admin/reports/${route.params.id}`) {
		await $fetch('/api/reports', {
			method: 'PUT',
			body: {
				comment_id: id,
				status: 'resolved'
			}
		})
	}

	await $fetch('/api/comments', {
		method: 'delete',
		body: {
			id,
			media
		}
	})
}

const commentForm = reactive({
	content: '',
	media: null
})
const editCommentDialog = ref(false)
const editCommentRef = ref(null)
const commentRules = ref({
	content: [
		value => {
			if (value) return true
			return 'Content is required.'
		}
	]
})

const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const editCommentSnackbar = ref(false)

const loading = ref(false)

const editComment = async (id, media) => {
	loading.value = true
	const { valid } = await editCommentRef.value.validate()
	if (valid) {
		await randomNumber()
		if (commentForm.media) {
			await client.storage.from('images').upload(`comments/${media_id.value}/${commentForm.media.name}`, commentForm.media, {
				cacheControl: '3600',
				upsert: false
			})
		}

		await $fetch('/api/comments', {
			method: 'put',
			body: {
				id: id,
				content: commentForm.content,
				media: commentForm.media != media ? `${media_id.value}/${commentForm.media.name}` : media
			}
		})

		editCommentSnackbar.value = true
	}

	editCommentDialog.value = false
	loading.value = false
}

const deleteMedia = async (id, media) => {
	await client.storage.from('images').remove([`comments/${media}`])
	await client.from('comments').update({
		media: null
	}).eq('id', id).select()

	commentForm.media = null
}

const reportSnackbar = ref(false)

const reportFormRef = ref(null)

const reportFormDialog = ref(false)

const reportForm = reactive({
	category: '',
	description: ''
})

const reporting = ref(false)

const reportRules = ref({
	category: [
		value => {
			if (value) return true
			return 'Please select a category.'
		}
	]
})

const createReport = async () => {
	reporting.value = true
	const { valid } = await reportFormRef.value.validate()

	if (valid) {
		await $fetch('/api/reports', {
			method: 'post',
			body: {
				category: reportForm.category,
				description: reportForm.description,
				comment_id: props.comment.id
			}
		})

		reportSnackbar.value = true
		reportFormRef.value.reset()
		reportFormDialog.value = false
	}

	reporting.value = false
}

const translateFormDialog = ref(false)
const translateFormRef = ref(null)
const language = ref('')
const translated = ref()

const languages = useLanguage()

const translated_lang = ref('')

const translateRules = ref({
	language: [
		value => {
			if (value) return true
			return 'Please select a language.'
		}
	]
})

const translate = async () => {
	try {
		loading.value = true
		const { valid } = await translateFormRef.value.validate()

		if (valid) {
			const data = await $fetch('/api/gemini', {
				method: 'post',
				body: {
					translate: true,
					text: `Translate into ${language.value}: ${props.comment.content}`
				}
			})

			translated.value = data

			translated_lang.value = language.value
			translateFormRef.value.reset()
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const cancelTranslateDialog = async () => {
	translated_lang.value = ''
	language.value = ''
	translated.value = ''
	translateFormDialog.value = false
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Your comment has been updated."
		v-model="editCommentSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="editCommentSnackbar = false" />
		</template>
	</VSnackbar>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Report has been submitted."
		v-model="reportSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="reportSnackbar = false" />
		</template>
	</VSnackbar>

	<VCard hover density border :title="comment_user.email.split('@')[0].toLocaleUpperCase()"
		:subtitle="new Date(comment.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true })"
		:text="comment.content" @click="navigateTo(`/posts/${comment.post_id}`)">

		<VImg :src="client.storage.from('images').getPublicUrl(`comments/${comment.media}`).data.publicUrl"
			:alt="comment.media" :draggable="false" cover />

		<VCardActions>
			<VSpacer />
			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>
					<VListItem title="Translate" prepend-icon="i-mdi:translate" @click="translateFormDialog = true" />

					<template v-if="comment.user_id == user.id || profile.role == 'admin'">
						<VListItem title="Edit" prepend-icon="i-mdi:pencil" @click="toggleEditComment(comment)" />

						<VListItem @click="deleteComment(comment.id, comment.media)" title="Delete" prepend-icon="i-mdi:delete" />
					</template>

					<VListItem v-if="comment.user_id != user.id" @click="reportFormDialog = true" title="Report"
						prepend-icon="i-mdi:alert" />
				</VList>
			</VMenu>
		</VCardActions>
	</VCard>

	<VDialog max-width="500" v-model="translateFormDialog">
		<VCard title="Translation">
			<VForm @submit.prevent="translate" ref="translateFormRef">
				<VContainer>
					<VSelect label="Language to translate" v-model="language" :items="languages"
						:rules="translateRules.language" />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn @click="cancelTranslateDialog" type="button" color="red" variant="elevated" text="Cancel" />
					<VBtn text="Translate" color="primary" type="submit" variant="elevated" />
				</VCardActions>
			</VForm>

			<VCardText v-if="translated">
				<h3>Translated into {{ translated_lang }}:</h3>

				<h4>Content:</h4>
				<VueMarkdown :markdown="translated" />
			</VCardText>
		</VCard>
	</VDialog>

	<VDialog max-width="500" v-model="reportFormDialog">
		<VCard title="Submit a report"
			subtitle="Thanks for looking out for yourself by reporting things that break the rules. Let us know what's happening, and we'll look into it.">
			<VForm @submit.prevent="createReport" ref="reportFormRef">
				<VContainer>
					<VSelect label="Problem Category" v-model="reportForm.category"
						:items="['Spam', 'Harassment or Bullying', 'Hate Speech', 'Misinformation', 'Inappropriate Content', 'Privacy Violation', 'Intellectual Property Violation']"
						:rules="reportRules.category" :loading="reporting" :disabled="reporting" />
					<VTextarea v-model="reportForm.description" label="Description" :disabled="reporting" :loading="reporting"
						clearable />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn @click="reportFormDialog = false" type="button" color="red" variant="elevated" :loading="reporting"
						text="Cancel" />
					<VBtn text="Submit" color="primary" type="submit" variant="elevated" :loading="reporting" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>

	<VDialog max-width="500" v-model="editCommentDialog">
		<VCard title="Edit Comment">
			<VForm @submit.prevent="editComment(comment.id, comment.media)" ref="editCommentRef">
				<VContainer>
					<VTextarea prepend-icon="i-mdi:text" :disabled="loading" :loading="loading" :rules="commentRules.content"
						v-model="commentForm.content" label="Content" clearable />

					<VRow align="center" justify="center" class="mb-3" v-if="comment.media">
						<VCol cols="3">
							<VImg max-height="250"
								:src="client.storage.from('images').getPublicUrl(`comments/${comment.media}`).data.publicUrl"
								:alt="comment.media" v-if="comment.media" :draggable="false" />
						</VCol>
						<VCol cols="4">
							<VBtn text="Delete media" @click="deleteMedia(comment.id, comment.media)" />
						</VCol>
					</VRow>
					<VFileInput accept="image/*" v-model="commentForm.media" :disabled="loading" :loading="loading" label="Media"
						v-if="!comment.media" />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" type="button" text="Cancel" :loading="loading" @click="editCommentDialog = false" />
					<VBtn color="primary" text="Save" type="submit" :loading="loading" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>