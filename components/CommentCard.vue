<script setup>
const props = defineProps({
	comment: Object
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

const deleteComment = async (id, media) => {
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
</script>

<template>
	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Your comment has been updated."
		v-model="editCommentSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="editCommentSnackbar = false" />
		</template>
	</VSnackbar>

	<VCard hover density border :title="comment_user.email.split('@')[0].toLocaleUpperCase()"
		:subtitle="new Date(comment.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true })"
		:text="comment.content">
		<VImg :src="client.storage.from('images').getPublicUrl(`comments/${comment.media}`).data.publicUrl"
			:alt="comment.media" cover />
		<VCardActions>
			<VSpacer />
			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>
					<template v-if="comment.user_id == user.id">
						<VListItem title="Edit" prepend-icon="i-mdi:pencil" v-if="comment.user_id == user.id"
							@click="toggleEditComment(comment)" />

						<VListItem @click="deleteComment(comment.id, comment.media)" title="Delete" prepend-icon="i-mdi:delete"
							v-if="comment.user_id == user.id" />
					</template>

					<VListItem v-if="comment.user_id != user.id" @click="" title="Report" prepend-icon="i-mdi:alert" />
				</VList>
			</VMenu>
		</VCardActions>
	</VCard>

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