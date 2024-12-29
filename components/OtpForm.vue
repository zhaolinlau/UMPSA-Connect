<script setup>
const client = useSupabaseClient()
const email = ref('')
const config = useRuntimeConfig()
const OtpError = ref('')
const loading = ref(false)
const OtpFormRef = ref(null)
const OtpErrorAlert = ref(false)
const OtpSuccessAlert = ref(false)

const sendOtp = async () => {
	loading.value = true
	const { error } = await client.auth.signInWithOtp({
		email: email.value,
		options: {
			emailRedirectTo: `${config.public.siteUrl}/confirm`,
			shouldCreateUser: false
		}
	})

	if (error) {
		OtpError.value = error.message
		OtpErrorAlert.value = true
		OtpSuccessAlert.value = false
	} else {
		OtpError.value = ''
		OtpErrorAlert.value = false
		OtpSuccessAlert.value = true
	}

	loading.value = false
}
</script>

<template>
	<VRow>
		<VCol cols="12">
			<VAlert @click:close="OtpErrorAlert = false" v-model="OtpErrorAlert" border="start" color="red" variant="elevated"
				border-color="red" title="Error" icon="$error" :text="OtpError" v-if="OtpErrorAlert" closable />

			<VAlert @click:close="OtpSuccessAlert = false" v-model="OtpSuccessAlert" border="start" color="success"
				variant="elevated" border-color="success" title="Success" icon="$success" text="OTP sent to your email"
				v-if="OtpSuccessAlert" closable />
		</VCol>

		<VCol cols="12">
			<VForm @submit.prevent="sendOtp" ref="OtpFormRef">

				<VTextField label="Email" placeholder="you@example.com" v-model="email" prepend-inner-icon="i-mdi:email-outline"
					type="email" :loading="loading" :disabled="loading" />

				<VBtn text="Send" prepend-icon="i-mdi:send" class="mt-3" color="primary" type="submit" block
					:loading="loading" />

				<VBtn text="Back to login" prepend-icon="i-mdi:arrow-left" class="mt-3" type="button" block :loading="loading"
					to="/login" />
			</VForm>
		</VCol>
	</VRow>
</template>