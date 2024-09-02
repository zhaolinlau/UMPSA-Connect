<script setup>
const client = useSupabaseClient()
const route = useRoute()

const { data: comments, refresh: refreshComments, error: commentsError } = useFetch('/api/comments', {
	method: 'get',
	query: {
		post_id: route.params.id
	}
})

if (commentsError.value) console.error(commentsError.value.message)

const commentsChannel = client.channel('public:comments').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	() => refreshComments()
)

const postsChannel = client.channel('public:posts').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	() => refreshComments()
)

const votesChannel = client.channel('public:votes').on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	() => refreshComments()
)

onMounted(() => {
	commentsChannel.subscribe()
	postsChannel.subscribe()
	votesChannel.subscribe()
})

onUnmounted(() => {
	client.removeChannel(commentsChannel)
	client.removeChannel(postsChannel)
	client.removeChannel(votesChannel)
})
</script>

<template>
	<v-row justify="center">
		<template v-if="!comments">
			<v-col cols="12" lg="7">
				<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
			</v-col>
			<v-col cols="12" lg="7" v-for="n in 2">
				<v-skeleton-loader type="article"></v-skeleton-loader>
			</v-col>
		</template>
		<v-col cols="12" lg="7">
			<PostCard :post="comments" />
		</v-col>
		<v-col cols="12" lg="7" v-for="comment in comments.comments" :key="comment">
			<CommentCard :comment="comment" />
		</v-col>
	</v-row>
</template>