<script setup>
const router = useRouter()
const client = useSupabaseClient()

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
				to: '/staffs'
			},
			{
				title: 'Students',
				to: '/students'
			},
			{
				title: 'Reports',
				to: '/reports'
			}
		]
	}
)

const logout = async () => {
	const { error } = await client.auth.signOut()
	if (error) showError(error.message)
	await navigateTo('/login')
}

const user = useSupabaseUser()
</script>

<template>
	<v-layout>
		<v-app-bar title="UMPSA Connect"></v-app-bar>
		<v-navigation-drawer>
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
				<div class="pa-2">
					<VBtn @click="logout" color="error" block text="Logout" />
				</div>
			</template>
		</v-navigation-drawer>
		<v-main>
			<slot />
		</v-main>
	</v-layout>
</template>