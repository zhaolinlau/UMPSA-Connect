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

const { data: votes, refresh: refreshVotes } = await useFetch('/api/votes', {
	method: 'get',
	query: {
		user_id: user.value.id
	}
})

const { data: bookmarks, refresh: refreshBookmarks } = await useFetch('/api/bookmarks', {
	method: 'get',
	query: {
		profile: true,
		user_id: user.value.id
	}
})

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => await refreshBookmarks()
)

const votesChannel = client.channel(`${id}:votes`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'votes' },
	async () => await refreshVotes()
)

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
	bookmarksChannel.subscribe()
	votesChannel.subscribe()
	commentsChannel.subscribe()
	postsChannel.subscribe()
	profileChannel.subscribe()
	studentChannel.subscribe()
	staffChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(votesChannel)
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
							<template v-if="votes">
								<VCol cols="12" v-for="vote in votes" :key="vote.id">
									<PostCard :post="vote.posts" :profile="profile" />
								</VCol>
							</template>

							<VCol cols="12" v-else>
								No data available
							</VCol>
						</VRow>
					</VTabsWindowItem>

					<VTabsWindowItem value="bookmarks">
						<VRow>
							<template v-if="bookmarks">
								<VCol cols="12" v-for="bookmark in bookmarks" :key="bookmark.id">
									<AnnouncementCard :announcement="bookmark.announcements" :student="student" v-if="bookmark.announcement_id" />
									<EventCard :event="bookmark.events" v-else-if="bookmark.event_id" />
									<PostCard :post="bookmark.posts" :profile="profile" v-else-if="bookmark.post_id" />
								</VCol>
							</template>

							<VCol cols="12" v-else>
								No data available
							</VCol>
						</VRow>
					</VTabsWindowItem>
				</VTabsWindow>
			</VCol>
		</VRow>
	</VContainer>
</template>