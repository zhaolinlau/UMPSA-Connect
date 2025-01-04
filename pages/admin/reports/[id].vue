<script setup>
const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()
const id = useId()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: report } = await useFetch('/api/reports', {
	method: 'GET',
	query: {
		single: true,
		id: route.params.id
	}
})

const { data: post, refresh: refreshPost } = await useFetch('/api/posts', {
	method: 'GET',
	query: {
		single: true,
		id: report.value.post_id
	}
})

const { data: comment, refresh: refreshComment } = await useFetch('/api/comments', {
	method: 'GET',
	query: {
		single: true,
		id: report.value.comment_id
	}
})

const postChannel = client.channel(`${id}:post`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPost()
)

const commentChannel = client.channel(`${id}:comment`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshComment()
)

onMounted(async () => {
	postChannel.subscribe()
	commentChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(postChannel)
	await client.removeChannel(commentChannel)
})

const reportForm = reactive({
	category: report.value.category,
	description: report.value.description,
	status: report.value.status
})

const loading = ref(false)

const reportRules = ref({
	category: [
		value => {
			if (value) return true
			return 'Please select a category.'
		}
	],
	status: [
		value => {
			if (value) return true
			return 'Please select a status.'
		}
	]
})

const reportFormRef = ref()

const editReport = async () => {
	try {
		loading.value = true
		const { valid } = await reportFormRef.value.validate()

		if (valid) {
			await $fetch('/api/reports', {
				method: 'PUT',
				body: {
					id: report.value.id,
					status: reportForm.status
				}
			})

			reportFormRef.value.reset()
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VContainer>
		<VRow justify="center">
			<VCol cols="12">
				<VCard title="Edit Report">
					<VForm @submit.prevent="editReport" ref="reportFormRef">
						<VContainer>
							<VRow>
								<VCol cols="12">
									<VSelect label="Problem Category" v-model="reportForm.category" disabled
										:rules="reportRules.category" />
								</VCol>
								<VCol cols="12">
									<VTextarea v-model="reportForm.description" label="Description" disabled />
								</VCol>
								<VCol cols="12">
									<VSelect label="Status" v-model="reportForm.status" :items="['pending', 'invalid', 'resolved']"
										:rules="reportRules.status" />
								</VCol>
								<VCol cols="12" lg="6">
									<VBtn block text="Save" color="primary" type="submit" variant="elevated" />
								</VCol>
								<VCol cols="12" lg="6">
									<VBtn block type="button" color="grey" variant="elevated" text="Back" to="/admin/reports" />
								</VCol>
							</VRow>
						</VContainer>
					</VForm>
				</VCard>
			</VCol>

			<VCol cols="12" lg="7" v-if="post">
				<PostCard :post="post" :profile="profile" />
			</VCol>

			<VCol cols="12" lg="7" v-else-if="comment">
				<CommentCard :comment="comment" :profile="profile" />
			</VCol>
		</VRow>
	</VContainer>


</template>