<script setup>
const props = defineProps({
	post: Object,
	profile: Object
})
const client = useSupabaseClient()
const user = useSupabaseUser()

const bookmarked = computed(() => {
	return props.post.bookmarks.find(bookmark => bookmark.user_id == user.value.id && bookmark.post_id == props.post.id)
})

const voted = computed(() => {
	return props.post.votes.find(vote => vote.user_id == user.value.id)
})

const media_id = ref('')
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

const editPostSnackbar = ref(false)

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

		editPostSnackbar.value = true
		editPostDialog.value = false
	}
}

const deleteMedia = async (post_id, post_media) => {
	await client.storage.from('images').remove([`posts/${post_media}`])
	await client.from('posts').update({
		media: null
	}).eq('id', post_id).select()

	postForm.value.media = null
}
const route = useRoute()

const deletePost = async (post_id, post_media) => {
	if (route.path == `/admin/reports/${route.params.id}`) {
		await $fetch('/api/reports', {
			method: 'PUT',
			body: {
				post_id: post_id,
				status: 'resolved'
			}
		})
	}

	await $fetch('/api/posts', {
		method: 'delete',
		body: {
			post_id,
			post_media
		}
	})

	if (route.path == `/admin/reports/${route.params.id}`) {
		return
	} else {
		await navigateTo('/')
	}
}

const createVote = async () => {
	await $fetch('/api/votes', {
		method: 'post',
		body: {
			post_id: props.post.id,
			user_id: user.value.id
		}
	})
}

const deleteVote = async () => {
	await $fetch('/api/votes', {
		method: 'delete',
		body: {
			vote_id: voted.value.id
		}
	})
}

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

const reportSnackbar = ref(false)

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

		reportSnackbar.value = true
		reportFormRef.value.reset()
		reportFormDialog.value = false
	}

	reporting.value = false
}

const addBookmarkSnackbar = ref(false)

const createBookmark = async () => {
	await $fetch('/api/bookmarks', {
		method: 'post',
		body: {
			post_id: props.post.id
		}
	})

	addBookmarkSnackbar.value = true
}

const deleteBookmarkSnackbar = ref(false)

const deleteBookmark = async () => {
	await $fetch('/api/bookmarks', {
		method: 'delete',
		body: {
			id: bookmarked.value.id
		}
	})

	deleteBookmarkSnackbar.value = true
}

const translateFormDialog = ref(false)
const translateFormRef = ref(null)
const language = ref('')
const translated = ref({
	title: '',
	content: ''
})
const loading = ref(false)
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
			const title = await $fetch('/api/gemini', {
				method: 'post',
				body: {
					translate: true,
					text: `Translate into ${language.value}: ${props.post.title}`
				}
			})

			translated.value.title = title

			if (props.post.content) {
				const content = await $fetch('/api/gemini', {
					method: 'post',
					body: {
						translate: true,
						text: `Translate into ${language.value}: ${props.post.content}`
					}
				})

				translated.value.content = content
			}

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
	translated.value.title = ''
	translated.value.content = ''
	translateFormDialog.value = false
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Report has been submitted."
		v-model="reportSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="reportSnackbar = false" />
		</template>
	</VSnackbar>

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

	<VSnackbar variant="elevated" location="bottom right" timer="success" text="Your post has been updated."
		v-model="editPostSnackbar">
		<template v-slot:actions>
			<vBtn color="red" icon="i-mdi:close" @click="editPostSnackbar = false" />
		</template>
	</VSnackbar>

	<VCard hover>
		<VCardItem>
			<VChip>{{ post.category }}</VChip>
			<VCardTitle>{{ post.title }}</VCardTitle>
			<VCardSubtitle>
				{{ new Date(post.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true }) }}
			</VCardSubtitle>
		</VCardItem>

		<VImg :src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl" :alt="post.media"
			v-if="post.media" :draggable="false" />

		<VCardText v-if="post.content">
			{{ post.content }}
		</VCardText>

		<VCardActions>
			<VBadge color="primary" :content="post.votes.length > 99 ? '99+' : post.votes.length">
				<VBtn color="primary" text="Upvote" prepend-icon="i-mdi:vote" @click="deleteVote()" active v-if="voted" />
				<VBtn color="primary" text="Upvote" prepend-icon="i-mdi:vote" @click="createVote()" v-else />
			</VBadge>

			<VBadge color="secondary" :content="post.comments.length > 99 ? '99+' : post.comments.length">
				<VBtn color="secondary" text="Comment" prepend-icon="i-mdi:comment" :to="`/posts/${post.id}`" />
			</VBadge>

			<VSpacer />

			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>
					<VListItem title="Translate" prepend-icon="i-mdi:translate" @click="translateFormDialog = true" />

					<VListItem title="Edit" prepend-icon="i-mdi:pencil" v-if="post.user_id == user.id || profile.role == 'admin'"
						@click="toggleEditPost(post)" />

					<VListItem @click="deleteBookmark()" title="Bookmark" prepend-icon="i-mdi:bookmark" active color="primary"
						v-if="bookmarked" />

					<VListItem @click="createBookmark()" title="Bookmark" prepend-icon="i-mdi:bookmark" color="primary"
						v-if="!bookmarked" />

					<VListItem @click="deletePost(post.id, post.media)" title="Delete" prepend-icon="i-mdi:delete"
						v-if="post.user_id == user.id || profile.role == 'admin'" />

					<VListItem v-if="post.user_id != user.id" @click="reportFormDialog = true" title="Report"
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

			<VCardText v-if="translated.title || translated.content">
				<h3>Translated into {{ translated_lang }}:</h3>
				<template v-if="translated.title">
					<h4>Title:</h4>
					<VueMarkdown :markdown="translated.title" />
				</template>

				<template v-if="translated.content">
					<h4>Content:</h4>
					<VueMarkdown :markdown="translated.content" />
				</template>
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

	<VDialog max-width="500" v-model="editPostDialog">
		<VCard title="Edit Post">
			<VForm @submit.prevent="editPost(post.id, post.media)" ref="editPostRef">
				<VContainer>
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
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="editPostDialog = false" />
					<VBtn color="primary" variant="elevated" text="Save" type="submit" />
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>