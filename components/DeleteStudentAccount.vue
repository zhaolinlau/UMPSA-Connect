<script setup>
const props = defineProps({
	student: Object
})

const deleteStudentDialog = ref(false)

const loading = ref(false)

const deleteStudent = async () => {
	loading.value = true
	await $fetch('/api/users', {
		method: 'DELETE',
		body: {
			user_id: props.student.user_id,
			avatar: props.student.avatar
		}
	})
	loading.value = false
	deleteStudentDialog.value = false
}
</script>

<template>
	<vBtn class="ml-3" icon="i-mdi:delete" color="error" @click="deleteStudentDialog = true" />

	<VOverlay v-model="loading" persistent />

	<VDialog v-model="deleteStudentDialog" max-width="500">
		<VForm @submit.prevent="deleteStudent()">
			<VCard title="Delete Student" text="Confirm delete?">
				<VCardActions>
					<VBtn :loading="loading" color="red" variant="elevated" type="button" text="Cancel"
						@click="deleteStudentDialog = false" />
					<VBtn :loading="loading" color="primary" variant="elevated" text="Confirm" type="submit" />
				</VCardActions>
			</VCard>
		</VForm>
	</VDialog>
</template>