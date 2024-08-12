<script setup>
const user = useSupabaseUser()
</script>
<template>
	{{ user.email }}	
</template>