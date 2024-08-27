<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()

const { data: posts, refresh: refreshPosts, status: postsStatus, error: postsError } = useFetch('/api/posts', {
	method: 'get'
})

if (postsError.value) console.error(postsError.value.message)

const deletePost = async (post_id, post_media) => {
	await $fetch('/api/posts', {
		method: 'delete',
		body: {
			post_id,
			post_media
		}
	})
}

const postsChannel = client.channel('public:posts').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	() => refreshPosts()
)

const votesChannel = client.channel('public:votes').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	() => refreshPosts()
)

onMounted(() => {
	postsChannel.subscribe()
	votesChannel.subscribe()
})

onUnmounted(() => {
	client.removeChannel(postsChannel)
	client.removeChannel(votesChannel)
})

const createVote = async (post_id) => {
	const { error: voteError } = await client.from('votes').insert([
		{
			post_id: post_id
		},
	]).select()

	if (voteError) console.error(voteError.message)
}
</script>

<template>
	<v-overlay class="align-center justify-center" :model-value="postsStatus == 'pending' ? true : false">
		<v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
	</v-overlay>

	<v-container>
		<v-row justify="center">
			<v-col lg="7" v-for="post in posts">
				<v-card hover>
					<v-card-item>
						<v-chip>{{ post.category }}</v-chip>
						<v-card-title>{{ post.title }}</v-card-title>
						<v-card-subtitle>
							{{ Date(post.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' }) }}
						</v-card-subtitle>
					</v-card-item>

					<VImg max-height="500"
						:src="client.storage.from('images').getPublicUrl(`posts/${post.id}/${post.media}`).data.publicUrl"
						:alt="post.media" v-if="post.media" />

					<v-card-text>
						{{ post.content }}
					</v-card-text>

					<v-card-actions>
						<v-badge color="primary" :content="post.votes[0].count">
							<VBtn text="Upvote" prepend-icon="mdi-vote" @click="createVote(post.id)" />
						</v-badge>

						<VBtn text="Comment" prepend-icon="mdi-comment" />
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
			</v-col>
		</v-row>
	</v-container>
</template>
