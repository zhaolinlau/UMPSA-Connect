<script setup>
const { data: staffs } = await useFetch('/api/staffs', {
	method: 'get',
})

const search = ref('')
</script>

<template>
	<VTextField v-model="search" prepend-inner-icon="i-mdi:magnify" label="Search" flat single-line hide-details
		variant="solo-filled" />
	<VDataTable :items="staffs" :search="search" />
</template>