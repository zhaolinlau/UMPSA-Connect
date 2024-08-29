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
	<v-app>
		<v-app-bar title="UMPSA Connect" scroll-behavior="hide">
			<template #prepend>
				<VAppBarNavIcon @click.stop="drawer = !drawer" class="hidden-lg-and-up" />
			</template>
			<template #append>
				<v-btn icon="mdi-magnify"></v-btn>
				<CreatePost />
				<v-btn icon="mdi-bell"></v-btn>
			</template>
		</v-app-bar>

		<v-navigation-drawer v-model="drawer">
			<v-list>
				<v-list>
					<v-list-item :subtitle="user.email" :title="user.email.split('@')[0].toLocaleUpperCase()"></v-list-item>
				</v-list>

				<v-divider></v-divider>
				<VListSubheader title="GENERAL" />
				<v-list-item v-for="navItem in generalNavItems.General" :key="navItem" :title="navItem.title" :to="navItem.to"
					:active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />
				<VListSubheader title="ADMINISTRATION" />
				<v-list-item v-for="navItem in generalNavItems.Administration" :key="navItem" :title="navItem.title"
					:to="navItem.to" :active="router.currentRoute.value.path == navItem.to ? true : false" color="primary" />
			</v-list>
			<template #append>
				<v-footer class="text-center">
					<v-row>
						<v-col cols="12">
							Copyright &copy; {{ new Date().getFullYear() }} UMPSA Connect - <NuxtLink
								to="https://github.com/zhaolinlau/UMPSA-Connect/blob/master/LICENSE" target="_blank">MIT License
							</NuxtLink>
						</v-col>
					</v-row>
				</v-footer>
				<div class="pa-2">
					<VBtn @click="logout" prepend-icon="mdi-logout" color="error" block text="Logout" />
				</div>
			</template>
		</v-navigation-drawer>

		<v-main>
			<v-container>
				<slot />
			</v-container>
		</v-main>
	</v-app>
</template>