<script setup>
const config = useRuntimeConfig()
const client = useSupabaseClient()
const visible = ref(false)
const password = ref('')
const email = ref('')
const loginError = ref('')
const loginAlert = ref(false)

const login = async () => {
	const { error } = await client.auth.signInWithPassword({
		email: email.value,
		password: password.value
	})

	if (error) {
		loginError.value = error.message
		loginAlert.value = true
	} else {
		await navigateTo('/confirm')
		loginError.value = ''
		loginAlert.value = false
	}
}

const googleLogin = async () => {
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
		loginError.value = error.message
		loginAlert.value = true
	} else {
		await navigateTo('/')
		loginError.value = ''
		loginAlert.value = false
	}
}

const microsoftLogin = async () => {
	const { error } = await client.auth.signInWithOAuth({
		provider: 'azure',
		options: {
			scopes: ['email', 'offline_access'],
			redirectTo: `${config.public.siteUrl}/confirm`
		}
	})

	if (error) {
		loginError.value = error.message
		loginAlert.value = true
	} else {
		await navigateTo('/')
		loginError.value = ''
		loginAlert.value = false
	}
}
</script>

<template>
	<v-row>
		<v-col cols="12">
			<VAlert @click:close="loginAlert = false" v-model="loginAlert" border="start" color="error" variant="tonal"
				border-color="error" title="Error" icon="$error" :text="loginError" v-if="loginAlert" closable />
		</v-col>

		<v-col cols="12">
			<v-form @submit.prevent="login">

				<VTextField label="Email" placeholder="you@example.com" v-model="email" prepend-inner-icon="mdi-email-outline"
					type="email" />

				<VTextField label="Password" v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
					:type="visible ? 'text' : 'password'" placeholder="example12345" prepend-inner-icon="mdi-lock-outline"
					@click:append-inner="visible = !visible" />

				<VBtn class="mb-4" text="Login" prepend-icon="mdi-login" type="submit" color="primary" block />
				<v-divider>OR</v-divider>
				<VBtn text="Continue with" append-icon="mdi-google" class="mt-3" type="button" block @click="googleLogin" />
				<VBtn text="Continue with" append-icon="mdi-microsoft" class="mt-3" type="button" block @click="microsoftLogin" />
			</v-form>
		</v-col>
	</v-row>
</template>