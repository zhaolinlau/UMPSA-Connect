<script setup>
definePageMeta({
	layout: 'guest'
})

const user = useSupabaseUser()

watchEffect(async () => {
	if (user.value) {
		const profile = await $fetch('/api/profiles', {
			method: 'GET',
			query: {
				single: true,
				user_id: user.value.id
			}
		})

		if (!profile) {
			const addedProfile = await $fetch('/api/profiles', {
				method: 'POST',
				body: {
					name: user.value.email.split('@')[1].toUpperCase() != 'adab.umpsa.edu.my' ? user.value.email.split('@')[0] : '',
					role: user.value.email.split('@')[1].toLowerCase() == 'adab.umpsa.edu.my' ? 'student' : 'staff',
					user_id: user.value.id
				}
			})

			if (addedProfile.role == 'student') {
				await $fetch('/api/students', {
					method: 'POST',
					body: {
						matric_id: user.value.email.split('@')[0].toUpperCase(),
						user_id: user.value.id
					}
				})
			} else if (addedProfile.role == 'staff') {
				await $fetch('/api/staffs', {
					method: 'POST',
					body: {
						user_id: user.value.id
					}
				})
			}
		}

		await navigateTo('/')
	} else {
		await navigateTo('/login')
	}
})
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