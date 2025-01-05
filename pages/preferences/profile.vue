<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const id = useId()
const tab = ref(null)
const { data: profile, refresh: refreshProfile } = await useFetch('/api/profiles', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: student, refresh: refreshStudent } = await useFetch('/api/students', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: staff, refresh: refreshStaff } = await useFetch('/api/staffs', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})

const { data: posts, refresh: refreshPosts } = await useFetch('/api/posts', {
	method: 'get',
	query: {
		user_id: user.value.id
	}
})

const { data: comments, refresh: refreshComments } = await useFetch('/api/comments', {
	method: 'get',
	query: {
		user_id: user.value.id
	}
})

const commentsChannel = client.channel(`${id}:comments`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'comments' },
	async () => await refreshComments()
)

const postsChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPosts()
)

const profileChannel = client.channel(`${id}:profiles`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'profiles'
}, async () => await refreshProfileDetails())

const studentChannel = client.channel(`${id}:students`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshProfileDetails())

const staffChannel = client.channel(`${id}:staffs`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'staffs'
}, async () => await refreshProfileDetails())

const refreshProfileDetails = async () => {
	await refreshProfile()
	await refreshStudent()
	await refreshStaff()
}

onMounted(async () => {
	commentsChannel.subscribe()
	postsChannel.subscribe()
	profileChannel.subscribe()
	studentChannel.subscribe()
	staffChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(commentsChannel)
	await client.removeChannel(profileChannel)
	await client.removeChannel(studentChannel)
	await client.removeChannel(staffChannel)
	await client.removeChannel(postsChannel)
})
</script>

<template>
	<VContainer class="fill-height">
		<VRow>
			<VCol cols="12">
				<p class="text-lg-h4 text-h5">
					My Profile
				</p>
			</VCol>
			<VCol cols="12">
				<StudentProfileForm :profile="profile" :student="student" v-if="student" />
				<StaffProfileForm :profile="profile" :staff="staff" v-else />
			</VCol>
		</VRow>

		<VRow>
			<VCol cols="12">
				<VTabs v-model="tab" color="primary">
					<VTab value="posts">Posts</VTab>
					<VTab value="comments">Comments</VTab>
					<VTab value="votes">Votes</VTab>
					<VTab value="bookmarks">Bookmarks</VTab>
				</VTabs>
				<VDivider />

				<VTabsWindow v-model="tab">
					<VTabsWindowItem value="posts">
						<VRow>
							<template v-if="posts">
								<VCol cols="12" v-for="post in posts" :key="post.id">
									<PostCard :post="post" :profile="profile" />
								</VCol>
							</template>

							<VCol cols="12" v-else>
								No data available
							</VCol>
						</VRow>
					</VTabsWindowItem>

					<VTabsWindowItem value="comments">
						<VRow>
							<template v-if="comments">
								<VCol cols="12" v-for="comment in comments" :key="comment.id">
									<CommentCard :comment="comment" :profile="profile" />
								</VCol>
							</template>
							<VCol cols="12" v-else>
								No data available
							</VCol>
						</VRow>
					</VTabsWindowItem>

					<VTabsWindowItem value="votes">
						<VRow>
							<VCol cols="12">

							</VCol>
						</VRow>
					</VTabsWindowItem>

					<VTabsWindowItem value="bookmarks">
						<VRow>
							<VCol cols="12">

							</VCol>
						</VRow>
					</VTabsWindowItem>
				</VTabsWindow>
			</VCol>
		</VRow>
	</VContainer>
</template>