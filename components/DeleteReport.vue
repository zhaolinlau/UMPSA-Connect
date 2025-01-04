<script setup>
const props = defineProps({
	report: Object
})

const deleteReportDialog = ref(false)

const loading = ref(false)

const deleteReport = async () => {
	try {
		loading.value = true
		await $fetch('/api/reports', {
			method: 'DELETE',
			body: {
				id: props.report.id
			}
		})

		deleteReportDialog.value = false
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<vBtn class="ml-3" icon="i-mdi:delete" color="error" @click="deleteReportDialog = true" />

	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VDialog v-model="deleteReportDialog" max-width="500">
		<VForm @submit.prevent="deleteReport()">
			<VCard title="Delete Report" text="Confirm delete?">
				<VCardActions>
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="deleteReportDialog = false" />
					<VBtn color="primary" variant="elevated" text="Confirm" type="submit" />
				</VCardActions>
			</VCard>
		</VForm>
	</VDialog>
</template>