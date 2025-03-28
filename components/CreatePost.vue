<script setup>
const client = useSupabaseClient()
const postForm = ref({
	title: '',
	content: '',
	category: '',
	media: null
})
const loading = ref(false)
const media_id = ref('')
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

const randomNumber = async () => {
	media_id.value = Math.random()
}

const createPost = async () => {
	try {
		loading.value = true
		const { valid } = await postFormRef.value.validate()
		if (valid) {
			await randomNumber()

			if (postForm.value.media) {
				await client.storage.from('images')
					.upload(`posts/${media_id.value}/${postForm.value.media.name}`, postForm.value.media, {
						cacheControl: '3600',
						upsert: false
					})
			}

			await $fetch('/api/posts', {
				method: 'post',
				body: {
					title: postForm.value.title,
					category: postForm.value.category,
					content: postForm.value.content,
					media: postForm.value.media ? `${media_id.value}/${postForm.value.media.name}` : ''
				}
			})

			await navigateTo('/')

			postFormDialog.value = false
			postSnackbar.value = true
			await postFormRef.value.reset()
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const postSnackbar = ref(false)
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Post has been created."
		v-model="postSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="postSnackbar = false" />
		</template>
	</VSnackbar>

	<VBtn icon="i-mdi:plus" @click="postFormDialog = true" />
	<VDialog max-width="500" v-model:model-value="postFormDialog">
		<VCard title="Create Post">
			<VForm @submit.prevent="createPost" ref="postFormRef">
				<VContainer>
					<VTextField prepend-icon="i-mdi:format-title" v-model="postForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="postRules.title" />
					<VSelect prepend-icon="i-mdi:shape" v-model="postForm.category" label="Category"
						:items="['General', 'Question', 'Event']" :rules="postRules.category" />
					<VFileInput accept="image/*" v-model:model-value="postForm.media" label="Media" />
					<VTextarea prepend-icon="i-mdi:text" v-model="postForm.content" label="Body" placeholder="Say something...."
						clearable />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" type="button" variant="elevated" text="Cancel" @click="postFormDialog = false" />
					<VBtn color="primary" text="Post" variant="elevated" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>