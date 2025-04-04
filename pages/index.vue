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

const { data: posts, refresh: refreshPosts } = await useFetch('/api/posts', {
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

const commentsChannel = client.channel(`${id}:comments`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshPosts()
)

const votesChannel = client.channel(`${id}:votes`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	async () => await refreshPosts()
)

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshPosts()
)

onMounted(async () => {
	bookmarksChannel.subscribe()
	votesChannel.subscribe()
	commentsChannel.subscribe()
	postsChannel.subscribe()
	search_input.value = route.query.search_input
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(postsChannel)
	await client.removeChannel(votesChannel)
	await client.removeChannel(commentsChannel)
})

watch(route, async () => {
	search_input.value = route.query.search_input
	await refreshPosts()
}, { immediate: true })

const categories = ref([
	'All',
	'General',
	'Question',
	'Event'
])

const category = ref('All')
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
		<VCol cols="12" lg="7">
			<VSelect :items="categories" v-model="category" label="Sort by" />
		</VCol>

		<template v-if="category == 'All'">
			<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
				<PostCard :post="post" :profile="profile" />
			</VCol>
		</template>

		<template v-else-if="category == 'General'">
			<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
				<PostCard :post="post" :profile="profile" v-if="post.category == 'General'" />
			</VCol>
		</template>

		<template v-else-if="category == 'Question'">
			<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
				<PostCard :post="post" :profile="profile" v-if="post.category == 'Question'" />
			</VCol>
		</template>

		<template v-else-if="category == 'Event'">
			<VCol cols="12" lg="7" v-for="post in posts" :key="post.id" v-auto-animate>
				<PostCard :post="post" :profile="profile" v-if="post.category == 'Event'" />
			</VCol>
		</template>
	</VRow>
</template>
