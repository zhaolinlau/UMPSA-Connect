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

const { data: student, refresh: refreshStudent } = await useFetch('/api/students', {
	method: 'GET',
	query: {
		single: true,
		user_id: route.params.user_id
	}
})

const profileChannel = client.channel(`${id}:profile`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'profiles'
}, async () => await refreshProfileDetails())

const studentChannel = client.channel(`${id}:student`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshProfileDetails())

const refreshProfileDetails = async () => {
	await refreshProfile()
	await refreshStudent()
}

onMounted(async () => {
	profileChannel.subscribe()
	studentChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(profileChannel)
	await client.removeChannel(studentChannel)
})
</script>

<template>
	<StudentProfileForm :profile="profile" :student="student" />
</template>