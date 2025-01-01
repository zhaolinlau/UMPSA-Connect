<script setup>
const client = useSupabaseClient()
const user = useSupabaseUser()
const id = useId()

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
	profileChannel.subscribe()
	studentChannel.subscribe()
	staffChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(profileChannel)
	await client.removeChannel(studentChannel)
	await client.removeChannel(staffChannel)
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
	</VContainer>
</template>