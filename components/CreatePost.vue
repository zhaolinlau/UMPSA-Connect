<script setup>
const client = useSupabaseClient()
const postForm = ref({
	title: '',
	content: '',
	category: '',
	media: null
})
const posting = ref(false)

const postFormRef = ref(null)

const postFormDialog = ref(false)

const postRules = ref({
	title: [
		value => {
			if (value) return true
			return 'Title is required.'
		}
	],
	category: [
		value => {
			if (value?.length > 3) return true
			return 'Please select a category.'
		}
	]
})

const createPost = async () => {
	try {
		posting.value = true
		const { valid } = await postFormRef.value.validate()
		if (valid) {
			const post = await $fetch('/api/posts', {
				method: 'post',
				body: {
					title: postForm.value.title,
					category: postForm.value.category,
					content: postForm.value.content,
					media: postForm.value.media ? postForm.value.media.name : ''
				}
			})

			if (postForm.value.media) {
				await client.storage.from('images')
					.upload(`posts/${post[0].id}/${postForm.value.media.name}`, postForm.value.media, {
						cacheControl: '3600',
						upsert: false
					})
			}

			await resetPostForm()
		}
	} catch (error) {
		console.error(error)
	} finally {
		posting.value = false
	}
}

const resetPostForm = async () => {
	postFormDialog.value = false
	postFormRef.value.reset()
}
</script>

<template>
	<v-overlay class="align-center justify-center" :model-value="posting ? true : false">
		<v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
	</v-overlay>

	<VBtn icon="mdi-plus" @click="postFormDialog = true" />
	<v-dialog max-width="500" v-model:model-value="postFormDialog">
		<v-card title="Create Post">
			<v-form @submit.prevent="createPost" ref="postFormRef">
				<v-container>
					<VTextField prepend-icon="mdi-format-title" v-model="postForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="postRules.title" />
					<VSelect prepend-icon="mdi-shape" v-model="postForm.category" label="Category"
						:items="['General', 'Question', 'Event']" :rules="postRules.category" />
					<VFileInput accept="image/*" v-model:model-value="postForm.media" label="Media" />
					<VTextarea prepend-icon="mdi-text" v-model="postForm.content" label="Body" placeholder="Say something...."
						clearable />
				</v-container>
				<v-card-actions>
					<v-spacer></v-spacer>
					<VBtn color="error" type="button" text="Cancel" @click="postFormDialog = false" />
					<VBtn color="primary" text="Save" type="submit" />
				</v-card-actions>
			</v-form>
		</v-card>
	</v-dialog>
</template>