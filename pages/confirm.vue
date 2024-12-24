<script setup>
definePageMeta({
	layout: 'guest'
})

const user = useSupabaseUser()
const client = useSupabaseClient()

watch(user, async () => {
	if (user.value) {
		const { data: profile } = await client.from('profiles').select('*').eq('user_id', user.value.id).single()

		if (!profile) {
			const { data: addedProfile } = await client.from('profiles').insert([
				{
					role: user.value.email.split('@')[1].toLocaleLowerCase() == 'adab.umpsa.edu.my' ? 'student' : 'staff'
				}
			]).select().single()

			if (addedProfile.role == 'student') {
				await client.from('students').insert([
					{
						matric_id: user.value.email.split('@')[0].toLocaleUpperCase(),
						profile_id: addedProfile.id
					}
				])
			} else if (addedProfile.role == 'staff') {
				await client.from('staffs').insert([
					{
						profile_id: addedProfile.id
					}
				])
			}
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