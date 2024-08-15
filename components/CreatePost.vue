<script setup>
const client = useSupabaseClient()
const postForm = ref({
	title: '',
	content: '',
	category: '',
	media: null
})

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
	const { data: post, error: postError } = await client.from('posts').insert([
		{
			title: postForm.value.title,
			category: postForm.value.category,
			content: postForm.value.content,
			media: postForm.value.media ? postForm.value.media.name : ''
		},
	]).select()
	if (postError) {
		showError(postError)
	} else {
		if (postForm.value.media) {
			const { error: mediaError } = await client.storage.from('images')
				.upload(`public/${post[0].id}/${postForm.value.media.name}`, postForm.value.media, {
					cacheControl: '3600',
					upsert: false
				})
			if (mediaError) {
				showError(mediaError)
			} else {
				resetPostForm()
			}
		} else {
			resetPostForm()
		}
	}
}

const resetPostForm = async () => {
	postFormDialog.value = false
	postForm.value = {
		title: '',
		content: '',
		category: '',
		media: null,
	}
}
</script>

<template>
	<VBtn icon="i-mdi:plus" @click="postFormDialog = true" />
	<v-dialog max-width="500" v-model:model-value="postFormDialog">
		<v-card title="Create Post">
			<v-form @submit.prevent="createPost">
				<v-container>
					<VTextField prepend-icon="i-mdi:format-title" v-model="postForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="postRules.title" />
					<VSelect prepend-icon="i-mdi:category" v-model="postForm.category" label="Category"
						:items="['General', 'Question', 'Event']" :rules="postRules.category" />
					<VFileInput accept="image/*" v-model:model-value="postForm.media" label="Media" />
					<VTextarea prepend-icon="i-mdi:text" v-model="postForm.content" label="Body" placeholder="Say something...."
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