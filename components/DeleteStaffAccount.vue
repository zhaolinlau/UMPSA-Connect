<script setup>
const props = defineProps({
	staff: Object
})

const deleteStaffDialog = ref(false)

const loading = ref(false)

const deleteStaff = async () => {
	try {
		loading.value = true
		await $fetch('/api/users', {
			method: 'DELETE',
			body: {
				user_id: props.staff.user_id,
				avatar: props.staff.avatar
			}
		})

		deleteStaffDialog.value = false
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<vBtn class="ml-3" icon="i-mdi:delete" color="error" @click="deleteStaffDialog = true" />

	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VDialog v-model="deleteStaffDialog" max-width="500">
		<VForm @submit.prevent="deleteStaff()">
			<VCard title="Delete Staff" text="Confirm delete?">
				<VCardActions>
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="deleteStaffDialog = false" />
					<VBtn color="primary" variant="elevated" text="Confirm" type="submit" />
				</VCardActions>
			</VCard>
		</VForm>
	</VDialog>
</template>