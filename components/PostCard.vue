<script setup>
defineProps({
	post: Object
})

const client = useSupabaseClient()
const user = useSupabaseUser()

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

		<VImg max-height="500" :src="client.storage.from('images').getPublicUrl(`posts/${post.media}`).data.publicUrl"
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
					<v-list-item title="Edit" prepend-icon="mdi-pencil" v-if="post.user_id == user.id"></v-list-item>
					<v-list-item title="Bookmark" prepend-icon="mdi-bookmark"></v-list-item>
					<v-list-item @click="deletePost(post.id, post.media)" title="Delete" prepend-icon="mdi-delete"
						v-if="post.user_id == user.id"></v-list-item>
					<v-list-item title="Report" prepend-icon="mdi-alert" v-if="post.user_id != user.id"></v-list-item>
				</v-list>
			</v-menu>
		</v-card-actions>
	</v-card>
</template>