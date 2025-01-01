<script setup>
const user = useSupabaseUser()

const { data: profile } = await useFetch('/api/profiles', {
	method: 'get',
	query: {
		single: true,
		user_id: user.value.id
	}
})
</script>

<template>
	<NavBar :profile="profile" :user="user" />

	<VMain>
		<VContainer>
			<slot />
		</VContainer>
	</VMain>
</template>