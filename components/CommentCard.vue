<script setup>
defineProps({
	comment: Object
})
</script>

<template>
	<v-card>
		{{ comment.content }}
	</v-card>
</template>