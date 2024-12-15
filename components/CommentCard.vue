<script setup>
const props = defineProps({
	comment: Object
})

const { data } = await useFetch('/api/users', {
	method: 'get',
	query: {
		id: props.comment.user_id,
		single: true
	}
})

const comment = reactive({
	...props.comment,
	user: data
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const toggleEditComment = async () => {

}

const deleteComment = async (id, media) => {
	await $fetch('/api/comments', {
		method: 'delete',
		body: {
			id,
			media
		}
	})
}
</script>

<template>
	<VCard hover density border :title="comment.user.email.split('@')[0].toLocaleUpperCase()"
		:subtitle="new Date(comment.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true })"
		:text="comment.content">
		<VImg :src="client.storage.from('images').getPublicUrl(`comments/${comment.media}`).data.publicUrl"
			:alt="comment.media" cover />
		<VCardActions>
			<VSpacer />
			<VMenu location="top">
				<template v-slot:activator="{ props }">
					<VBtn icon="i-mdi:dots-horizontal" v-bind="props" />
				</template>

				<VList>
					<template v-if="comment.user_id == user.id">
						<VListItem title="Edit" prepend-icon="i-mdi:pencil" v-if="comment.user_id == user.id"
							@click="toggleEditComment(comment)" />

						<VListItem @click="deleteComment(comment.id, comment.media)" title="Delete" prepend-icon="i-mdi:delete"
							v-if="comment.user_id == user.id" />
					</template>

					<VListItem v-if="comment.user_id != user.id" @click="" title="Report" prepend-icon="i-mdi:alert" />
				</VList>
			</VMenu>
		</VCardActions>
	</VCard>
</template>