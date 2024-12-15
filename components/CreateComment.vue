<script setup>
const route = useRoute()
const commentForm = reactive({
	content: '',
	media: null
})
const commenting = ref(false)
const commentFormRef = ref(null)
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

const client = useSupabaseClient()

const createComment = async () => {
	commenting.value = true

	const { valid } = await commentFormRef.value.validate()

	if (valid) {
		if (commentForm.media) {
			console.log(commentForm.media)
			await randomNumber();
			await client.storage.from('images').upload(`comments/${media_id.value}/${commentForm.media.name}`, commentForm.media, {
				cacheControl: '3600',
				upsert: false
			})
		}

		await $fetch('/api/comments', {
			method: 'post',
			body: {
				post_id: route.params.id,
				content: commentForm.content,
				media: commentForm.media ? `${media_id.value}/${commentForm.media.name}` : ''
			}
		})

		await resetCommentForm()
	}

	commenting.value = false
}

const resetCommentForm = async () => {
	commentFormRef.value.reset()
}
</script>

<template>
	<VForm validate-on="submit" @submit.prevent="createComment" ref="commentFormRef">
		<VTextarea :disabled="commenting" :loading="commenting" label="Comment" placeholder="Add a comment..."
			:rules="commentRules.content" v-model="commentForm.content" />
		<VFileInput v-model="commentForm.media" accept="image/*" label="Media" />
		<VBtn :loading="commenting" color="primary" text="Comment" type="submit" />
	</VForm>
</template>