<script setup>
definePageMeta({
	layout: 'guest'
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const profile = ref({})

const fetchProfile = async () => {
	const { data, error } = await client.from('profiles').select().eq('user_id', user.value.id).single()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		profile.value = data
	}
}

const addProfile = async () => {
	const { data: profileData, error } = await client.from('profiles').insert([
		{
			role: user.value.email.split('@')[1].toLocaleLowerCase() == 'adab.umpsa.edu.my' ? 'student' : 'staff'
		}
	]).select().single()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		if (profileData.role == 'student') {
			const { error } = await client.from('students').insert([
				{
					matric_id: user.value.email.split('@')[0].toLocaleUpperCase(),
					profile_id: profileData.id
				}
			])

			if (error) {
				throw createError({
					statusCode: error.code,
					statusMessage: error.message
				})
			}
		} else if (profileData.role == 'staff') {
			const { error } = await client.from('staffs').insert([
				{
					profile_id: profileData.id
				}
			])

			if (error) {
				throw createError({
					statusCode: error.code,
					statusMessage: error.message
				})
			}
		}
	}
}

watch(user, async () => {
	if (user.value) {
		await fetchProfile()
		if (!profile.value) {
			await addProfile()
		}
		await navigateTo('/')
	} else {
		await navigateTo('/login')
	}
}, { immediate: true })
</script>

<template>
	<vRow justify="center">
		<vCol cols="12">
			<p class="text-h3 text-center">
				Redirecting...
			</p>
		</vCol>
		<vCol cols="12" lg="6">
			<VProgressLinear rounded color="primary" indeterminate height="10" />
		</vCol>
	</vRow>
</template>