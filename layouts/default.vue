<script setup>
const profile = useProfile()
</script>

<template>
	<NavBar :profile="profile" />

	<VMain>
		<VContainer>
			<slot />
		</VContainer>
	</VMain>
</template>