<script setup>
definePageMeta({
	middleware: ['admin']
})

const { data: posts, refresh: refreshPosts } = await useFetch('/api/posts')

const { data: profiles, refresh: refreshProfiles } = await useFetch('/api/profiles')

const { data: students, refresh: refreshStudents } = await useFetch('/api/students')

const { data: staffs, refresh: refreshStaffs } = await useFetch('/api/staffs')

const { data: announcements, refresh: refreshAnnouncements } = await useFetch('/api/announcements')

const { data: bookmarks, refresh: refreshBookmarks } = await useFetch('/api/bookmarks')

const { data: notifications, refresh: refreshNotifications } = await useFetch('/api/notifications')
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
						<VCard title="Number of Posts">
							<PostsChart :posts="posts" />
						</VCard>
					</VCol>
				</VRow>
			</VCol>

			<VCol cols="12" lg="6">
				<VRow>
					<VCol cols="12">
						<VCard title="Number of Announcements">
							<AnnouncementsChart :announcements="announcements" />
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