<script setup>
const client = useSupabaseClient()
const id = useId()
const user = useSupabaseUser()
const route = useRoute()
const search_input = ref('')

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: posts, refresh: refreshPosts } = await useLazyFetch('/api/posts', {
	method: 'get',
	query: {
		search_input
	},
})

const postsChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPosts()
)

onMounted(async () => {
	postsChannel.subscribe()
	search_input.value = route.query.search_input
})

onUnmounted(async () => {
	await client.removeChannel(postsChannel)
})

watch(route, async () => {
	search_input.value = route.query.search_input
	await refreshPosts()
})
</script>

<template>
	<VRow justify="center">
		<VCol cols="12" lg="7" v-if="search_input">
			<VBtn text="Reset filter" color="primary" to="/" />
		</VCol>
		<VCol cols="12" v-if="!posts.length">
			<p class="text-center">
				No data available.
			</p>
		</VCol>
		<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
			<PostCard :post="post" :profile="profile" />
		</VCol>
	</VRow>
</template>
