<template>
	<div class="bg-teal-accent-1 fill-height">
		<v-container class="fill-height">
			<v-row class="h-100">
				<v-col md="6" class="hidden-sm-and-down">

				</v-col>

				<v-col cols="12" md="6" class="elevation-10 bg-white rounded h-100">
					<v-container class="fill-height">
						<v-row class="mx-md-16">
							<v-col cols="12">
								<p class="text-h3">
									Welcome back!
								</p>

								<p class="text-subtitle-1">
									Stay connected with your campus faster and smarter
								</p>
							</v-col>
							<v-col cols="12">
								<VAlert @click:close="loginAlert = false" v-model="loginAlert" border="start" color="error"
									variant="tonal" border-color="error" title="Error" icon="$error" :text="loginError" v-if="loginAlert"
									closable />
							</v-col>
							<v-col cols="12">
								<v-form @submit.prevent="login">

									<VTextField label="Email" placeholder="you@example.com" v-model="email"
										prepend-inner-icon="i-mdi:email-outline" type="email" />

									<VTextField label="Password" v-model="password"
										:append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'" :type="visible ? 'text' : 'password'"
										placeholder="example12345" prepend-inner-icon="i-mdi:lock-outline"
										@click:append-inner="visible = !visible" />

									<VBtn text="Login" type="submit" color="primary" block />
								</v-form>
							</v-col>
						</v-row>
					</v-container>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script setup>
definePageMeta({
	layout: false
})

const client = useSupabaseClient()
const visible = ref(false)
const password = ref('')
const email = ref('')
const loginError = ref('')
const loginAlert = ref(false)

const login = async () => {
	const { error } = await client.auth.signInWithPassword({
		email: email.value,
		password: password.value,
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