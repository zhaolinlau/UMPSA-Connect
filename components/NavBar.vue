<script setup>
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
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
		],
		Administration: [
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
		]
	}
)

const logout = async () => {
	const { error } = await client.auth.signOut()
	if (error) {
		console.error(error.message)
	} else {
		return reloadNuxtApp()
	}
}
</script>

<template>
	<VAppBar scroll-behavior="hide">
		<template #prepend>
			<VAppBarNavIcon @click.stop="drawer = !drawer" class="hidden-lg-and-up" />
			<VAppBarTitle class="cursor-pointer ml-3" @click="navigateTo('/')" text="UMPSA Connect" />
		</template>
		<template #append>
			<VBtn icon="i-mdi:magnify" />
			<CreatePost />
			<VBtn icon="i-mdi:bell" />
		</template>
	</VAppBar>

	<VNavigationDrawer v-model="drawer">
		<VList>
			<VListItem :subtitle="user.email" :title="user.email.split('@')[0].toLocaleUpperCase()" />

			<VDivider />

			<VListSubheader title="GENERAL" />

			<VListItem v-for="navItem in generalNavItems.General" :key="navItem" :title="navItem.title" :to="navItem.to"
				:active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />

			<VListSubheader title="ADMINISTRATION" />

			<VListItem v-for="navItem in generalNavItems.Administration" :key="navItem" :title="navItem.title"
				:to="navItem.to" :active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />
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
				<VBtn @click="logout" prepend-icon="i-mdi:logout" color="error" block text="Logout" />
			</div>
		</template>
	</VNavigationDrawer>
</template>