<script setup>
const client = useSupabaseClient()
const id = useId()

const { data: posts, refresh: refreshPosts } = await useLazyFetch('/api/posts', {
	method: 'get'
})

const postsChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPosts()
)

onMounted(async () => {
	postsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(postsChannel)
})
</script>

<template>
	<VRow justify="center">
		<template v-if="!posts">
			<VCol cols="12" lg="7" v-for="n in 2">
				<v-skeleton-loader type="chip, heading, subtitle, image, text, actions"></v-skeleton-loader>
			</VCol>
		</template>
		<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
			<PostCard :post="post" />
		</VCol>
	</VRow>
</template>
