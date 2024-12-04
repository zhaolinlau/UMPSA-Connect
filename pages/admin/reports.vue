<script setup>
const { data: reports } = await useFetch('/api/reports', {
	method: 'GET',
	transform: (reports) => {
		return reports.map(report => (
			{
				category: report.category,
				description: report.description,
				'Created At': new Date(report.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour12: true })
			}
		))
	}
})

const search = ref('')
</script>

<template>
	<VCard>
		<VCardTitle class="d-flex align-center pe-2">
			Report List
			<VSpacer />
			<VTextField v-model="search" prepend-inner-icon="i-mdi:magnify" label="Search" flat single-line hide-details
				variant="solo-filled" />
		</VCardTitle>

		<VDivider />

		<VDataTable :items="reports" :search="search" />
	</VCard>
</template>