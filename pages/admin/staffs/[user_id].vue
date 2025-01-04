<script setup>
const route = useRoute()
const client = useSupabaseClient()
const id = useId()

const { data: profile, refresh: refreshProfile } = await useFetch('/api/profiles', {
	method: 'GET',
	query: {
		single: true,
		user_id: route.params.user_id
	}
})

const { data: staff, refresh: refreshStaff } = await useFetch('/api/staffs', {
	method: 'GET',
	query: {
		single: true,
		user_id: route.params.user_id
	}
})

const profileChannel = client.channel(`${id}:profile`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'profiles'
}, async () => await refreshProfileDetails())

const staffChannel = client.channel(`${id}:staff`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'staffs'
}, async () => await refreshProfileDetails())

const refreshProfileDetails = async () => {
	await refreshProfile()
	await refreshStaff()
}

onMounted(async () => {
	profileChannel.subscribe()
	staffChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(profileChannel)
	await client.removeChannel(staffChannel)
})
</script>

<template>
	<VContainer class="fill-height">
		<VRow>
			<VCol cols="12">
				<p class="text-lg-h4 text-h5">
					Staff Profile
				</p>
			</VCol>
			<VCol cols="12">
				<StaffProfileForm :profile="profile" :staff="staff" />
			</VCol>
		</VRow>
	</VContainer>
</template>