<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()

const logout = async () => {
	const { error } = await client.auth.signOut()
	if (error) showError(error.message)
	await navigateTo('/login')
}
</script>
<template>
	{{ user.email }}
	<VBtn @click="logout" color="error" text="Logout" />
</template>