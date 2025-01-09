<script setup>
const client = useSupabaseClient()
const route = useRoute()
const id = useId()
const user = useSupabaseUser()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: post, refresh: refreshPost } = await useFetch('/api/posts', {
	method: 'get',
	query: {
		id: route.params.id,
		single: true
	}
})

const commentsChannel = client.channel(`${id}:comments`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshPost()
)

const postChannel = client.channel(`${id}:post`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPost()
)

const votesChannel = client.channel(`${id}:votes`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	async () => await refreshPost()
)

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshPost()
)

onMounted(async () => {
	bookmarksChannel.subscribe()
	votesChannel.subscribe()
	commentsChannel.subscribe()
	postChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(postChannel)
	await client.removeChannel(votesChannel)
	await client.removeChannel(commentsChannel)
})

const comments = computed(() => {
	return post.value.comments.reverse()
})
</script>

<template>
	{{ route.hash }}
	<vRow justify="center">
		<template v-if="!post || !post.comments">
			<vCol cols="12" lg="7">
				<VSkeletonLoader type="chip, heading, subtitle, image, text, actions" />
			</vCol>
			<vCol cols="12" lg="7" v-for="n in 2">
				<VSkeletonLoader type="article" />
			</vCol>
		</template>
		<template v-else>
			<vCol cols="12" lg="7">
				<PostCard :post="post" :profile="profile" />
			</vCol>
			<vCol cols="12" lg="7">
				<CreateComment />
			</vCol>
			<vCol cols="12" lg="7" v-for="comment in comments" :key="comment.id" v-auto-animate>
				<CommentCard :comment="comment" :profile="profile" />
			</vCol>
		</template>
	</vRow>
</template>