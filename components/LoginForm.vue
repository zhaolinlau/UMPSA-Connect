<script setup>
const config = useRuntimeConfig()
const client = useSupabaseClient()
const visible = ref(false)
const password = ref('')
const email = ref('')
const loading = ref(false)
const loginError = ref('')
const loginAlert = ref(false)
const loginFormRef = ref(null)

const login = async () => {
	try {
		loading.value = true
		const { error } = await client.auth.signInWithPassword({
			email: email.value,
			password: password.value
		})

		if (error) {
			throw createError(error)
		}

		loginAlert.value = false
		loginError.value = ''
		await loginFormRef.value.reset()
		await navigateTo('/confirm')
	} catch (error) {
		loginError.value = error.message
		loginAlert.value = true
	} finally {
		loading.value = false
	}
}

const googleLogin = async () => {
	try {
		loading.value = true
		const { error } = await client.auth.signInWithOAuth({
			provider: 'google',
			options: {
				queryParams: {
					access_type: 'offline',
					prompt: 'consent',
				},
				redirectTo: `${config.public.siteUrl}/confirm`
			}
		})

		if (error) {
			throw createError(error)
		}

		await navigateTo('/')
		loginError.value = ''
		loginAlert.value = false
	} catch (error) {
		loginError.value = error.message
		loginAlert.value = true
	} finally {
		loading.value = false
	}
}

const microsoftLogin = async () => {
	try {
		loading.value = true
		const { error } = await client.auth.signInWithOAuth({
			provider: 'azure',
			options: {
				scopes: ['email', 'offline_access'],
				redirectTo: `${config.public.siteUrl}/confirm`
			}
		})

		if (error) {
			throw createError(error)
		}

		await navigateTo('/')
		loginError.value = ''
		loginAlert.value = false
	} catch (error) {
		loginError.value = error.message
		loginAlert.value = true
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
		<VCol cols="12">
			<VAlert @click:close="loginAlert = false" v-model="loginAlert" border="start" color="red" variant="elevated"
				border-color="red" title="Error" icon="$error" :text="loginError" v-if="loginAlert" closable />
		</VCol>

		<VCol cols="12">
			<VForm @submit.prevent="login" ref="loginFormRef">

				<VTextField label="Email" placeholder="you@example.com" v-model="email" prepend-inner-icon="i-mdi:email-outline"
					type="email" />

				<VTextField label="Password" v-model="password" :append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'"
					:type="visible ? 'text' : 'password'" placeholder="example12345" prepend-inner-icon="i-mdi:lock-outline"
					@click:append-inner="visible = !visible" />

				<div class="d-flex justify-end">
					<VBtn class="text-decoration-underline" color="primary" to="/forgot_password" text="Forgot password?"
						variant="text" />
				</div>

				<VBtn class="my-4" text="Login" prepend-icon="i-mdi:login" type="submit" color="primary" block />
				<VDivider>OR</VDivider>
				<VBtn text="Continue with" append-icon="i-mdi:google" class="mt-3" type="button" block @click="googleLogin" />
				<VBtn text="Continue with" append-icon="i-mdi:microsoft" class="mt-3" type="button" block
					@click="microsoftLogin" />
			</VForm>
		</VCol>
	</VRow>
</template>