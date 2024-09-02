<script setup>
defineProps({
	post: Object
})
const media_id = ref('')
const client = useSupabaseClient()
const user = useSupabaseUser()
const editPostDialog = ref(false)
const editPostRef = ref(null)
const postForm = ref({
	title: '',
	content: '',
	category: '',
	media: null
})

const randomNumber = async () => {
	media_id.value = Math.random()
}

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

const toggleEditPost = async (post) => {
	editPostDialog.value = true
	postForm.value.title = post.title
	postForm.value.content = post.content
	postForm.value.category = post.category
	postForm.value.media = post.media
}

const editPost = async (post_id, post_media) => {
	const { valid } = await editPostRef.value.validate()
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
			method: 'put',
			body: {
				id: post_id,
				title: postForm.value.title,
				category: postForm.value.category,
				content: postForm.value.content,
				media: postForm.value.media ? `${media_id.value}/${postForm.value.media.name}` : ''
			}
		})
	}

	editPostDialog.value = false
}

const deleteMedia = async (post_id, post_media) => {
	await client.storage.from('images').remove([`posts/${post_media}`])
	await client.from('posts').update({
		media: null
	}).eq('id', post_id).select()

	postForm.value.media = null
}

const deletePost = async (post_id, post_media) => {
	try {
		await $fetch('/api/posts', {
			method: 'delete',
			body: {
				post_id,
				post_media
			}
		})
	} catch (error) {
		console.error(error.message)
	}
}

const createVote = async (post_id) => {
	try {
		await $fetch('/api/votes', {
			method: 'post',
			body: {
				post_id
			}
		})
	} catch (error) {
		console.error(error.message)
	}
}

const deleteVote = async (vote_id) => {
	try {
		await $fetch('/api/votes', {
			method: 'delete',
			body: {
				vote_id
			}
		})
	} catch (error) {
		console.error(error.message)
	}
}
</script>

<template>
	<v-card hover>
		<v-card-item>
			<v-chip>{{ post.category }}</v-chip>
			<v-card-title>{{ post.title }}</v-card-title>
			<v-card-subtitle>
				{{ new Date(post.created_at).getDate() }}/{{ new Date(post.created_at).getMonth() }}/{{ new
					Date(post.created_at).getFullYear() }} {{ new Date(post.created_at).getHours() }}:{{ new
					Date(post.created_at).getMinutes() }}:{{ new Date(post.created_at).getSeconds() }}
			</v-card-subtitle>
		</v-card-item>

		<VImg cover max-height="500" :src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl"
			:alt="post.media" v-if="post.media" :draggable="false" />

		<v-card-text v-if="post.content">
			{{ post.content }}
		</v-card-text>

		<v-card-actions>
			<v-badge color="primary" :content="post.votes.length">
				<VBtn color="primary" text="Upvote" prepend-icon="mdi-vote"
					@click="post.votes.some(vote => vote.user_id == user.id) ? deleteVote(post.votes.find(vote => vote.user_id == user.id).id) : createVote(post.id)"
					:active="post.votes.some(vote => vote.user_id == user.id) ? true : false" />
			</v-badge>

			<VBtn text="Comment" prepend-icon="mdi-comment" :to="`/posts/${post.id}`" />
			<v-spacer></v-spacer>
			<v-menu location="top">
				<template v-slot:activator="{ props }">
					<v-btn icon="mdi-dots-horizontal" v-bind="props"></v-btn>
				</template>

				<v-list>
					<v-list-item title="Edit" prepend-icon="mdi-pencil" v-if="post.user_id == user.id"
						@click="toggleEditPost(post)"></v-list-item>
					<v-list-item title="Bookmark" prepend-icon="mdi-bookmark"></v-list-item>
					<v-list-item @click="deletePost(post.id, post.media)" title="Delete" prepend-icon="mdi-delete"
						v-if="post.user_id == user.id"></v-list-item>
					<v-list-item title="Report" prepend-icon="mdi-alert" v-if="post.user_id != user.id"></v-list-item>
				</v-list>
			</v-menu>
		</v-card-actions>
	</v-card>

	<v-dialog max-width="500" v-model:model-value="editPostDialog">
		<v-card title="Create Post">
			<v-form @submit.prevent="editPost(post.id, post.media)" ref="editPostRef">
				<v-container>
					{{ postForm.media }}
					<VTextField prepend-icon="mdi-format-title" v-model="postForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="postRules.title" />
					<VSelect prepend-icon="mdi-shape" v-model="postForm.category" label="Category"
						:items="['General', 'Question', 'Event']" :rules="postRules.category" />

					<v-row align="center" justify="center" class="mb-3" v-if="post.media">
						<v-col cols="3">
							<VImg max-height="250"
								:src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl"
								:alt="post.media" v-if="post.media" :draggable="false" />
						</v-col>
						<v-col cols="4">
							<VBtn text="Delete media" @click="deleteMedia(post.id, post.media)" />
						</v-col>
					</v-row>

					<VFileInput accept="image/*" v-model:model-value="postForm.media" label="Media" v-if="!post.media" />
					<VTextarea prepend-icon="mdi-text" v-model="postForm.content" label="Body" placeholder="Say something...."
						clearable />
				</v-container>
				<v-card-actions>
					<v-spacer></v-spacer>
					<VBtn color="error" type="button" text="Cancel" @click="editPostDialog = false" />
					<VBtn color="primary" text="Save" type="submit" />
				</v-card-actions>
			</v-form>
		</v-card>
	</v-dialog>
</template>