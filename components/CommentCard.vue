<script setup>
const props = defineProps({
	comment: Object
})

const { data: user } = await useFetch('/api/users', {
	method: 'get',
	query: {
		id: props.comment.user_id,
		single: true
	}
})
</script>

<template>
	<VCard hover density border :title="user.email.split('@')[0].toLocaleUpperCase()"
		:subtitle="new Date(comment.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true })"
		:text="comment.content" />
</template>