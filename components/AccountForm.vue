<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const visible = ref(false)
const email = ref(user.value.email)
const editPassword = ref(false)
const passwordError = ref('')
const PasswordErrorAlert = ref(false)
const PasswordSuccessAlert = ref(false)
const passwordForm = reactive({
	new_password: '',
	confirm_password: ''
})
const loading = ref(false)

const updatePassword = async () => {
	loading.value = true

	if (passwordForm.new_password != passwordForm.confirm_password) {
		passwordError.value = 'Passwords do not match.'
		PasswordErrorAlert.value = true
	} else {
		const { error } = await client.auth.updateUser({
			password: passwordForm.new_password
		})

		if (error) {
			passwordError.value = error.message
			PasswordErrorAlert.value = true
			PasswordSuccessAlert.value = false
		} else {
			PasswordSuccessAlert.value = true
			PasswordErrorAlert.value = false
			editPassword.value = false			
		}
	}

	passwordForm.new_password = ''
	passwordForm.confirm_password = ''
	loading.value = false
}
</script>

<template>
	<VRow justify="center">
		<VCol sm="12" lg="6">
			<div class="mb-4">
				<VAlert @click:close="PasswordErrorAlert = false" v-model="PasswordErrorAlert" border="start" color="red"
					variant="elevated" border-color="red" title="Error" icon="$error" :text="passwordError"
					v-if="PasswordErrorAlert" closable />

				<VAlert @click:close="PasswordSuccessAlert = false" v-model="PasswordSuccessAlert" border="start"
					color="success" variant="elevated" border-color="success" title="Success" icon="$success"
					text="Your password has been updated." v-if="PasswordSuccessAlert" closable />
			</div>

			<VTextField v-model="email" label="Email" readonly disabled />

			<VForm @submit.prevent="updatePassword">
				<VTextField label="New Password" :type="visible ? 'text' : 'password'" v-model="passwordForm.new_password"
					type="password" :append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'"
					@click:append-inner="visible = !visible" :disabled="!editPassword || loading" :loading="loading" />

				<VTextField label="Confirm New Password" :type="visible ? 'text' : 'password'"
					v-model="passwordForm.confirm_password" type="password"
					:append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'" @click:append-inner="visible = !visible"
					:disabled="!editPassword || loading" :loading="loading" />

				<VBtn text="Edit" block type="button" color="secondary" @click="editPassword = true" v-if="!editPassword" />

				<template v-else>
					<VBtn text="Save" type="submit" color="primary" :loading="loading" block />
					<VBtn text="Cancel" class="mt-3" color="error" type="button" block @click="editPassword = false"
						:loading="loading" />
				</template>
			</vForm>
		</VCol>
	</VRow>
</template>