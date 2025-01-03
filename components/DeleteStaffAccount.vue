<script setup>
const props = defineProps({
	staff: Object
})

const deleteStaffDialog = ref(false)

const loading = ref(false)

const deleteStaff = async () => {
	loading.value = true
	await $fetch('/api/users', {
		method: 'DELETE',
		body: {
			user_id: props.staff.user_id,
			avatar: props.staff.avatar
		}
	})
	loading.value = false
	deleteStaffDialog.value = false
}
</script>

<template>
	<vBtn class="ml-3" icon="i-mdi:delete" color="error" @click="deleteStaffDialog = true" />

	<VOverlay v-model="loading" persistent />

	<VDialog v-model="deleteStaffDialog" max-width="500">
		<VForm @submit.prevent="deleteStaff()">
			<VCard title="Delete Staff" text="Confirm delete?">
				<VCardActions>
					<VBtn :loading="loading" color="red" variant="elevated" type="button" text="Cancel"
						@click="deleteStaffDialog = false" />
					<VBtn :loading="loading" color="primary" variant="elevated" text="Confirm" type="submit" />
				</VCardActions>
			</VCard>
		</VForm>
	</VDialog>
</template>