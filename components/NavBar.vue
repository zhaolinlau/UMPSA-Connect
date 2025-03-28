<script setup>
const props = defineProps({
	profile: Object,
	user: Object,
	notifications: Number
})

const router = useRouter()
const client = useSupabaseClient()
const drawer = ref(null)
const generalNavItems = ref(
	{
		General: [
			{
				title: 'Home',
				to: '/'
			},
			{
				title: 'Announcements',
				to: '/announcements'
			},
			{
				title: 'Events',
				to: '/events'
			},
			{
				title: 'AI Assistant',
				to: '/ai_assistant'
			}
		],
		Administration: [
			{
				title: 'Dashboard',
				to: '/admin/'
			},
			{
				title: 'Staffs',
				to: '/admin/staffs'
			},
			{
				title: 'Students',
				to: '/admin/students'
			},
			{
				title: 'Reports',
				to: '/admin/reports'
			}
		],
		Preferences: [
			{
				title: 'My Profile',
				to: '/preferences/profile/'
			},
			{
				title: 'Settings',
				to: '/preferences/settings'
			}
		]
	}
)

const loading = ref(false)

const logout = async () => {
	try {
		loading.value = true
		const { error } = await client.auth.signOut()

		if (error) {
			throw createError(error)
		}

		await navigateTo('/login')
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const searchDialog = ref(false)

const searchPostsRules = ref({
	search_input: [
		value => {
			if (value) return true
			return 'Search input is required.'
		}
	]
})

const searchFormRef = ref(null)

const searchInput = ref('')

const searchPosts = async () => {
	try {
		loading.value = true
		const { valid } = await searchFormRef.value.validate()
		if (valid) {
			await navigateTo(`/?search_input=${searchInput.value}`)
			await searchFormRef.value.reset()
			searchDialog.value = false
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

	<VAppBar scroll-behavior="hide" :color="profile.role == 'admin' ? 'secondary' : 'primary'">
		<template #prepend>
			<VAppBarNavIcon @click.stop="drawer = !drawer" class="hidden-lg-and-up" />
			<VAppBarTitle class="cursor-pointer ml-3" @click="navigateTo('/')" text="UMPSA Connect" />
		</template>
		<template #append>
			<VBtn icon="i-mdi:magnify" @click="searchDialog = true" />
			<CreatePost />
			<VBtn icon="i-mdi:bell" to="/notifications">
				<VBadge color="warning" :content="notifications > 99 ? '99+' : notifications">
					<VIcon icon="i-mdi:bell" />
				</VBadge>
			</VBtn>
		</template>
	</VAppBar>

	<VDialog v-model="searchDialog" max-width="500">
		<VCard title="Search Posts">
			<VForm @submit.prevent="searchPosts" ref="searchFormRef">
				<VContainer>
					<VRow>
						<VCol cols="12">
							<VTextField label="Search Input" v-model="searchInput" :rules="searchPostsRules.search_input" />
						</VCol>

						<VCol cols="12">
							<VBtn block type="submit" text="Search" color="primary" />
							<VBtn block class="mt-3" type="button" text="Cancel" color="error" @click="searchDialog = false" />
						</VCol>
					</VRow>
				</VContainer>
			</VForm>
		</VCard>
	</VDialog>

	<VNavigationDrawer v-model="drawer">
		<VList>
			<VListItem :subtitle="user.email"
				:title="user.user_metadata.full_name || user.email.split('@')[0].toLocaleUpperCase()" />
			<VDivider />

			<VListSubheader title="GENERAL" />

			<VListItem v-for="navItem in generalNavItems.General" :key="navItem" :title="navItem.title" :to="navItem.to"
				:active="router.currentRoute.value.path == navItem.to ? true : false"
				:color="user.role == 'admin' ? 'secondary' : 'primary'" />

			<template v-if="profile.role == 'admin'">
				<VListSubheader title="ADMINISTRATION" />

				<VListItem v-for="navItem in generalNavItems.Administration" :key="navItem" :title="navItem.title"
					:to="navItem.to" :active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />
			</template>

			<VListSubheader title="PREFERENCES" />

			<VListItem v-for="navItem in generalNavItems.Preferences" :key="navItem" :title="navItem.title" :to="navItem.to"
				:active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />
		</VList>

		<template #append>
			<VFooter class="text-center">
				<VRow>
					<VCol cols="12">
						Copyright &copy; {{ new Date().getFullYear() }} UMPSA Connect - <NuxtLink
							to="https://github.com/zhaolinlau/UMPSA-Connect/blob/master/LICENSE" target="_blank">MIT License
						</NuxtLink>
					</VCol>
				</VRow>
			</VFooter>
			<div class="pa-2">
				<VBtn @click="logout" prepend-icon="i-mdi:logout" color="red" block text="Logout" />
			</div>
		</template>
	</VNavigationDrawer>
</template>