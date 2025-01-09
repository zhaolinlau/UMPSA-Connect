<script setup>
definePageMeta({
	middleware: ['admin']
})

const client = useSupabaseClient()
const id = useId()

const { data: posts, refresh: refreshPosts } = await useFetch('/api/posts')

const { data: profiles, refresh: refreshProfiles } = await useFetch('/api/profiles')

const { data: students, refresh: refreshStudents } = await useFetch('/api/students')

const { data: staffs, refresh: refreshStaffs } = await useFetch('/api/staffs')

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements')

const { data: bookmarks, refresh: refreshBookmarks } = await useFetch('/api/bookmarks')

const { data: notifications, refresh: refreshNotifications } = await useFetch('/api/notifications')

const notificationsChannel = client.channel(`${id}:notifications`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'notifications' },
	async () => await refreshNotifications()
)

const announcementsChannel = client.channel(`${id}:announcements`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'announcements' },
	async () => await refreshAnnouncements()
)

const staffsChannel = client.channel(`${id}:staffs`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'staffs' },
	async () => await refreshStaffs()
)

const studentsChannel = client.channel(`${id}:students`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'students' },
	async () => await refreshStudents()
)

const profilesChannel = client.channel(`${id}:profiles`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'profiles' },
	async () => await refreshProfiles()
)

const postsChannel = client.channel(`${id}:posts`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'posts' },
	async () => await refreshPosts()
)

const bookmarksChannel = client.channel(`${id}:bookmarks`).on(
	'postgres_changes',
	{ event: '*', schema: 'public', table: 'bookmarks' },
	async () => refreshBookmarks()
)

onMounted(async () => {
	notificationsChannel.subscribe()
	announcementsChannel.subscribe()
	staffsChannel.subscribe()
	studentsChannel.subscribe()
	profilesChannel.subscribe()
	bookmarksChannel.subscribe()
	postsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(notificationsChannel)
	await client.removeChannel(announcementsChannel)
	await client.removeChannel(staffsChannel)
	await client.removeChannel(studentsChannel)
	await client.removeChannel(profilesChannel)
	await client.removeChannel(bookmarksChannel)
	await client.removeChannel(postsChannel)
})
</script>

<template>
	<VContainer>
		<VRow>
			<VCol cols="12" lg="6">
				<VRow>
					<VCol cols="12">
						<VCard title="Number of Profiles">
							<ProfilesChart :profiles="profiles" />
						</VCard>
					</VCol>
					<VCol cols="12">
						<VCard title="Number of Students">
							<StudentsChart :students="students" />
						</VCard>
					</VCol>
					<VCol cols="12">
						<VCard title="Number of Staffs">
							<StaffsChart :staffs="staffs" />
						</VCard>
					</VCol>

					<VCol cols="12">
						<VCard title="Number of Announcements">
							<AnnouncementsChart :announcements="announcements" />
						</VCard>
					</VCol>
				</VRow>
			</VCol>

			<VCol cols="12" lg="6">
				<VRow>
					<VCol cols="12">
						<VCard title="Number of Posts">
							<PostsChart :posts="posts" />
						</VCard>
					</VCol>

					<VCol cols="12">
						<VCard title="Number of Bookmarks">
							<BookmarksChart :bookmarks="bookmarks" />
						</VCard>
					</VCol>
					<VCol cols="12">
						<VCard title="Number of Notifications">
							<NotificationsChart :notifications="notifications" />
						</VCard>
					</VCol>
				</VRow>
			</VCol>
		</VRow>
	</VContainer>
</template>