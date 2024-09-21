<script setup>
const client = useSupabaseClient()
const route = useRoute()

const { data: post, refresh: refreshPost } = useFetch('/api/posts', {
	method: 'get',
	query: {
		id: route.params.id
	}
})

const { data: comments, refresh: refreshComments } = useFetch('/api/comments', {
	method: 'get',
	query: {
		post_id: route.params.id
	}
})

const commentsChannel = client.channel('public:comments').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	() => refreshComments()
)

const postChannel = client.channel('public:posts').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	() => refreshPost()
)

const votesChannel = client.channel('public:votes').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	() => refreshPost()
)

onMounted(async () => {
	commentsChannel.subscribe()
	postChannel.subscribe()
	votesChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(commentsChannel)
	await client.removeChannel(postChannel)
	await client.removeChannel(votesChannel)
})
</script>

<template>
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
			<v-col cols="12" lg="7" v-for="comment in comments" :key="comment">
				<CommentCard :comment="comment" />
			</v-col>
		</template>
	</v-row>
</template>