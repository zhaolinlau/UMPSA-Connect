<script setup>
const props = defineProps({
	event: Object
})

const client = useSupabaseClient()
const route = useRoute()
</script>

<template>
	<VCard :title="event.title" :text="route.params.id == event.id ? event.content : null">
		<VImg cover max-height="500"
			:src="client.storage.from('images').getPublicUrl(`events/${post.media}`).data.publicUrl" :alt="event.media"
			v-if="event.media" :draggable="false" />
		<VCardActions>
			<VBtn text="View" prepend-icon="i-mdi:eye" />
			<VBtn text="Bookmark" prepend-icon="i-mdi:bookmark" />
			<VSpacer />

			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>

					<VListItem title="Edit" prepend-icon="i-mdi:pencil" v-if="post.user_id == user.id"
						@click="toggleEditPost(post)" />

					<VListItem @click="bookmark ? deleteBookmark(bookmark.id) : createBookmark(post.id)" title="Bookmark"
						prepend-icon="i-mdi:bookmark" :active="bookmark ? true : false" color="primary" />

					<VListItem @click="deletePost(post.id, post.media)" title="Delete" prepend-icon="i-mdi:delete"
						v-if="post.user_id == user.id" />

					<VListItem v-if="post.user_id != user.id" @click="reportFormDialog = true" title="Report"
						prepend-icon="i-mdi:alert" />

				</VList>
			</VMenu>
		</VCardActions>
	</VCard>
</template>