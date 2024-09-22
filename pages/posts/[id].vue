<script setup>
const client = useSupabaseClient()
const route = useRoute()
const id = useId()

const { data: post, refresh: refreshPost } = await useFetch('/api/posts', {
	method: 'get',
	query: {
		id: route.params.id,
		single: true
	}
})

const { data: comments, refresh: refreshComments } = await useFetch('/api/comments', {
	method: 'get',
	query: {
		post_id: route.params.id
	}
})

const commentsChannel = client.channel(`${id}:comments`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshComments()
)

const postChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPost()
)

onMounted(async () => {
	commentsChannel.subscribe()
	postChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(commentsChannel)
	await client.removeChannel(postChannel)
})

</script>

<template>
	{{ route.hash }}
	<v-row justify="center">
		<template v-if="!post || !comments">
			<v-col cols="12" lg="7">
				<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
			</v-col>
			<v-col cols="12" lg="7" v-for="n in 2">
				<v-skeleton-loader type="article"></v-skeleton-loader>
			</v-col>
		</template>
		<template v-else>
			<v-col cols="12" lg="7">
				<PostCard :post="post" />
			</v-col>
			<v-col cols="12" lg="7">
				<CreateComment />
			</v-col>
			<v-col cols="12" lg="7" v-for="comment in comments" :key="comment.id" v-auto-animate>
				<CommentCard :comment="comment" />
			</v-col>
		</template>
	</v-row>
</template>