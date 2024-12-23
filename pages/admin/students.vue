<script setup>
definePageMeta({
	middleware: ['admin']
})

const { data: students } = await useFetch('/api/students', {
	method: 'get',
})

const search = ref('')
</script>

<template>
	<VTextField v-model="search" prepend-inner-icon="i-mdi:magnify" label="Search" flat single-line hide-details
		variant="solo-filled" />
	<VDataTable :items="students" :search="search" />
</template>