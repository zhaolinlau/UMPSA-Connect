<script setup>
const { data: posts, error: postsError } = useFetch('/api/posts', {
	method: 'get'
})
console.log(posts.value)
if (postsError.value) console.error(postsError.value.message)
</script>

<template>
	<v-container>
		<v-row>
			<v-col cols="12" lg="4" v-for="post in posts">
				<v-card>
					<v-img height="250" src="https://cdn.vuetifyjs.com/images/cards/cooking.png" cover></v-img>
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