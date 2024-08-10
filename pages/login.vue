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
				<v-col md="6" class="hidden-sm-and-down">
					<v-container class="fill-height">
						<v-row>
							<v-col cols="12">

							</v-col>
							<v-col cols="12">
								<VImg src="/img/undraw_online_connection_6778.svg" />
							</v-col>
						</v-row>
					</v-container>
				</v-col>

				<v-col cols="12" md="6">
					<v-container class="fill-height">
						<v-row class="mx-lg-16">
							<v-col cols="12">
								<p class="text-h3">
									Welcome back!
								</p>

								<p class="text-subtitle-1">
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