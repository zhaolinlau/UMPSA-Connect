<script setup>
const props = defineProps({
	student: Object
})

const deleteStudentDialog = ref(false)

const loading = ref(false)

const deleteStudent = async () => {
	try {
		loading.value = true
		await $fetch('/api/users', {
			method: 'DELETE',
			body: {
				user_id: props.student.user_id,
				avatar: props.student.avatar
			}
		})

		deleteStudentDialog.value = false
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<vBtn class="ml-3" icon="i-mdi:delete" color="error" @click="deleteStudentDialog = true" />

	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VDialog v-model="deleteStudentDialog" max-width="500">
		<VForm @submit.prevent="deleteStudent()">
			<VCard title="Delete Student" text="Confirm delete?">
				<VCardActions>
					<VBtn color="red" variant="elevated" type="button" text="Cancel" @click="deleteStudentDialog = false" />
					<VBtn color="primary" variant="elevated" text="Confirm" type="submit" />
				</VCardActions>
			</VCard>
		</VForm>
	</VDialog>
</template>