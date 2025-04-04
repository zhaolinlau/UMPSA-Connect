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
	try {
		loading.value = true
		if (passwordForm.new_password != passwordForm.confirm_password) {
			passwordError.value = 'Passwords do not match.'
			PasswordErrorAlert.value = true
		} else {
			const { error } = await client.auth.updateUser({
				password: passwordForm.new_password
			})

			if (error) {
				throw createError(error)
			} else {
				PasswordSuccessAlert.value = true
				PasswordErrorAlert.value = false
				editPassword.value = false
			}
		}

		passwordForm.new_password = ''
		passwordForm.confirm_password = ''
	} catch (error) {
		passwordError.value = error.message
		PasswordErrorAlert.value = true
		PasswordSuccessAlert.value = false
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VRow>
		<VCol cols="12" v-if="editPassword && (PasswordErrorAlert || PasswordSuccessAlert)">
			<VAlert @click:close="PasswordErrorAlert = false" v-model="PasswordErrorAlert" border="start" color="red"
				variant="elevated" border-color="red" title="Error" icon="$error" :text="passwordError"
				v-if="PasswordErrorAlert" closable />

			<VAlert @click:close="PasswordSuccessAlert = false" v-model="PasswordSuccessAlert" border="start" color="success"
				variant="elevated" border-color="success" title="Success" icon="$success" text="Your password has been updated"
				v-if="PasswordSuccessAlert" closable />
		</VCol>

		<VCol sm="12" lg="6">
			<VTextField v-model="email" label="Email" readonly disabled />

			<VForm @submit.prevent="updatePassword">
				<VTextField label="New Password" :type="visible ? 'text' : 'password'" v-model="passwordForm.new_password"
					type="password" :append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'"
					@click:append-inner="visible = !visible" :disabled="!editPassword" />

				<VTextField label="Confirm New Password" :type="visible ? 'text' : 'password'"
					v-model="passwordForm.confirm_password" type="password"
					:append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'" @click:append-inner="visible = !visible"
					:disabled="!editPassword" />

				<VBtn text="Edit" block type="button" color="secondary" @click="editPassword = true" v-if="!editPassword" />

				<template v-else>
					<VBtn text="Save" type="submit" color="primary" block />
					<VBtn text="Cancel" class="mt-3" color="error" type="button" block @click="editPassword = false" />
				</template>
			</vForm>
		</VCol>
	</VRow>
</template>