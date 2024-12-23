<script setup>
definePageMeta({
	layout: 'guest'
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const profile = useProfile()
const addProfile = async (email) => {

	const { data: profile, error } = await client.from('profiles').insert([
		{
			role: email.split('@')[1].toLocaleLowerCase() == 'adab.umpsa.edu.my' ? 'student' : 'staff'
		}
	]).select().single()

	if (error) {
		throw createError({
			statusCode: error.code,
			statusMessage: error.message
		})
	} else {
		if (profile.role == 'student') {
			console.log(email.split('@')[0].toLocaleUpperCase())
			const { error } = await client.from('students').insert([
				{
					matric_id: email.split('@')[0].toLocaleUpperCase(),
					profile_id: profile.id
				}
			])

			if (error) {
				throw createError({
					statusCode: error.code,
					statusMessage: error.message
				})
			}
		} else if (profile.role == 'staff') {
			const { error } = await client.from('staffs').insert([
				{
					profile_id: profile.id
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
		if (!profile.value) {
			await addProfile(user.value.email)
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