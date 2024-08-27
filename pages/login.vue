<script setup>
definePageMeta({
	layout: false,
	middleware: 'login-auth'
})
</script>

<template>
	<div class="fill-height">
		<v-container class="fill-height">
			<v-row>
				<v-col cols="12" class="d-flex align-center">
					<v-avatar :rounded="0" size="100" :border="0" class="ml-4">
						<VImg src="/img/logo.webp" alt="logo.webp" />
					</v-avatar>
					<p class="ml-3 text-h5 text-lg-h4">
						UMPSA Connect
					</p>
				</v-col>
				<v-col md="6" class="hidden-sm-and-down">
					<v-container class="fill-height">
						<v-row>
							<v-col cols="12">
								<VImg src="/img/online_connection.webp" alt="online_connection.webp" />
							</v-col>
						</v-row>
					</v-container>
				</v-col>

				<v-col cols="12" lg="6">
					<v-container>
						<v-row>
							<v-col cols="12">
								<p class="text-lg-h4 text-h5">
									Welcome back!
								</p>

								<p class="text-lg-subtitle-1 text-subtitle-2">
									Stay connected with your campus faster and smarter
								</p>
							</v-col>
							<v-col cols="12">
								<LoginForm />
							</v-col>
						</v-row>
					</v-container>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>