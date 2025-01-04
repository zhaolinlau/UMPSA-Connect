<script setup>
definePageMeta({
	middleware: ['admin']
})
const client = useSupabaseClient()
const id = useId()

const { data: reports, refresh: refreshReports } = await useFetch('/api/reports', {
	method: 'GET'
})

const reportsChannel = client.channel(`${id}:reports`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'reports'
}, async () => await refreshReports())

const search = ref('')

onMounted(async () => {
	reportsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(reportsChannel)
})
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

		<VDataTable :items="reports" :search="search">
			<template v-slot:headers>
				<tr>
					<th>No</th>
					<th>Category</th>
					<th>Description</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</template>

			<template v-slot:item="{ item, index }">
				<tr>
					<td>{{ index + 1 }}</td>
					<td>{{ item.category }}</td>
					<td>{{ item.description }}</td>
					<td>{{ item.status }}</td>
					<td>
						<VBtn icon="i-mdi:eye" color="blue" :to="`/admin/reports/${item.id}`" />
						<DeleteReport :report="item" />
					</td>
				</tr>
			</template>
		</VDataTable>
	</VCard>
</template>