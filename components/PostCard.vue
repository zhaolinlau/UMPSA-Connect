<script setup>
const props = defineProps({
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
const id = useId()

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
				media: postForm.value.media != post_media ? `${media_id.value}/${postForm.value.media.name}` : post_media
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
	await $fetch('/api/posts', {
		method: 'delete',
		body: {
			post_id,
			post_media
		}
	})
}

const createVote = async (post_id) => {
	await $fetch('/api/votes', {
		method: 'post',
		body: {
			post_id
		}
	})
}

const deleteVote = async (vote_id) => {
	await $fetch('/api/votes', {
		method: 'delete',
		body: {
			vote_id
		}
	})
}

const { data: comments, refresh: refreshComments } = await useFetch('/api/comments', {
	method: 'get',
	query: {
		post_id: props.post.id,
		count: true
	}
})

const { data: votes, refresh: refreshVotes } = await useFetch('/api/votes', {
	method: 'get',
	query: {
		post_id: props.post.id
	}
})

const votesChannel = client.channel(`${id}:votes`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	async () => await refreshVotes()
)

const commentsChannel = client.channel(`${id}:comments`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshComments()
)

onMounted(async () => {
	commentsChannel.subscribe()
	votesChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(commentsChannel)
	await client.removeChannel(votesChannel)
})

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

const reportAlert = ref(false)

const createReport = async () => {
	reporting.value = true
	const { valid } = await reportFormRef.value.validate()

	if (valid) {
		await $fetch('/api/reports', {
			method: 'post',
			body: {
				category: reportForm.category,
				description: reportForm.description,
				post_id: props.post.id
			}
		})

		reportAlert.value = true
		reportFormRef.value.reset()
	}

	reporting.value = false
}
</script>

<template>
	<VCard hover>
		<VCardItem>
			<VChip>{{ post.category }}</VChip>
			<VCardTitle>{{ post.title }}</VCardTitle>
			<VCardSubtitle>
				{{ new Date(post.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true }) }}
			</VCardSubtitle>
		</VCardItem>

		<VImg cover max-height="500" :src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl"
			:alt="post.media" v-if="post.media" :draggable="false" />

		<VCardText v-if="post.content">
			{{ post.content }}
		</VCardText>

		<VCardActions>
			<VBadge color="primary" :content="votes.length > 99 ? '99+' : votes.length">
				<VBtn color="primary" text="Upvote" prepend-icon="i-mdi:vote"
					@click="votes.some(vote => vote.user_id == user.id) ? deleteVote(votes.find(vote => vote.user_id == user.id).id) : createVote(post.id)"
					:active="votes.some(vote => vote.user_id == user.id) ? true : false" />
			</VBadge>

			<VBadge color="secondary" :content="comments > 99 ? '99+' : comments">
				<VBtn color="secondary" text="Comment" prepend-icon="i-mdi:comment" :to="`/posts/${post.id}`" />
			</VBadge>

			<VSpacer />

			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>
					<VListItem title="Edit" prepend-icon="i-mdi:pencil" v-if="post.user_id == user.id"
						@click="toggleEditPost(post)" />
					<VListItem title="Bookmark" prepend-icon="i-mdi:bookmark" />
					<VListItem @click="deletePost(post.id, post.media)" title="Delete" prepend-icon="i-mdi:delete"
						v-if="post.user_id == user.id" />
					<VListItem v-if="post.user_id != user.id" @click="reportFormDialog = true" title="Report"
						prepend-icon="i-mdi:alert" />
				</VList>
			</VMenu>
		</VCardActions>
	</VCard>

	<VDialog max-width="500" v-model="reportFormDialog">
		<VCard title="Submit a report"
			subtitle="Thanks for looking out for yourself by reporting things that break the rules. Let us know what's happening, and we'll look into it.">
			<VForm @submit.prevent="createReport" ref="reportFormRef">
				<VAlert @click:close="reportAlert = false" v-model="reportAlert" border="start" color="green" variant="elevated"
					border-color="green" title="Success" icon="$success" text="Report has been submitted." closable />
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

	<VDialog max-width="500" v-model="editPostDialog">
		<VCard title="Create Post">
			<VForm @submit.prevent="editPost(post.id, post.media)" ref="editPostRef">
				<VContainer>
					{{ postForm.media }}
					<VTextField prepend-icon="i-mdi:format-title" v-model="postForm.title" label="Title"
						placeholder="What do you want to ask or share?" :rules="postRules.title" />
					<VSelect prepend-icon="i-mdi:shape" v-model="postForm.category" label="Category"
						:items="['General', 'Question', 'Event']" :rules="postRules.category" />

					<VRow align="center" justify="center" class="mb-3" v-if="post.media">
						<VCol cols="3">
							<VImg max-height="250"
								:src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl"
								:alt="post.media" v-if="post.media" :draggable="false" />
						</VCol>
						<VCol cols="4">
							<VBtn text="Delete media" @click="deleteMedia(post.id, post.media)" />
						</VCol>
					</VRow>

					<VFileInput accept="image/*" v-model:model-value="postForm.media" label="Media" v-if="!post.media" />
					<VTextarea prepend-icon="i-mdi:text" v-model="postForm.content" label="Body" placeholder="Say something...."
						clearable />
				</VContainer>
				<VCardActions>
					<VSpacer />
					<VBtn color="red" type="button" text="Cancel" @click="editPostDialog = false" />
					<VBtn color="primary" text="Save" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>