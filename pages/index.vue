<script setup>
const client = useSupabaseClient()
const id = useId()

const { data: posts, refresh: refreshPosts } = useFetch('/api/posts', {
	method: 'get'
})

const postsChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	() => refreshPosts()
)

onMounted(() => {
	postsChannel.subscribe()
})

onUnmounted(() => {
	client.removeChannel(postsChannel)
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
