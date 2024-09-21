<script setup>
const route = useRoute()
const commentForm = reactive({
	content: ''
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

const createComment = async () => {
	commenting.value = true

	const { valid } = await commentFormRef.value.validate()

	if (valid) {
		await $fetch('/api/comments', {
			method: 'post',
			body: {
				post_id: route.params.id,
				content: commentForm.content
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
		<VBtn :loading="commenting" color="primary" text="Comment" type="submit" />
	</VForm>
</template>