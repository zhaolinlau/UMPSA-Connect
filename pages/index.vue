<script setup>
const client = useSupabaseClient()

const { data: posts, refresh: refreshPosts, status: postsStatus } = useFetch('/api/posts', {
	method: 'get'
})

const postsChannel = client.channel('public:posts').on(
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
	<v-overlay class="align-center justify-center" :model-value="postsStatus == 'pending' ? true : false">
		<v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
	</v-overlay>

	<v-container>
		<v-row align="center">
			<v-col cols="12" md="6" lg="3" v-for="post in posts">
				<v-card>
					<VImg max-height="300" min-height="300" :src="client.storage.from('images').getPublicUrl(`public/${post.id}/${post.media}`).data.publicUrl"
						:alt="post.media" cover v-if="post.media" />
					<v-card-item>
						<v-card-title>{{ post.title }}</v-card-title>
					</v-card-item>
					<v-card-text class="text-truncate">
						{{ post.content }}
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>
