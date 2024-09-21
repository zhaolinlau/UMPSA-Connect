<script setup>
const client = useSupabaseClient()

const { data: posts, refresh: refreshPosts, error: postsError } = useFetch('/api/posts', {
	method: 'get'
})

if (postsError.value) console.error(postsError.value.message)

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
</script>

<template>
	<v-row justify="center">
		<template v-if="!posts">
			<v-col cols="12" lg="7" v-for="n in 2">
				<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
			</v-col>
		</template>
		<v-col cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
			<PostCard :post="post" />
		</v-col>
	</v-row>
</template>
