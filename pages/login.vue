<script setup>
definePageMeta({
	layout: 'guest',
	middleware: 'auth'
})
</script>

<template>
	<VContainer class="fill-height">
		<vRow align="center">
			<vCol cols="12" lg="6">
				<vRow>
					<vCol cols="12" class="d-flex align-center">
						<v-avatar :rounded="0" size="100" :border="0">
							<VImg src="/img/logo.webp" alt="logo.webp" :draggable="false" />
						</v-avatar>
						<p class="ml-3 text-h5 text-lg-h4">
							UMPSA Connect
						</p>
					</vCol>
					<vCol cols="12" class="hidden-md-and-down">
						<VImg src="/img/online_connection.webp" alt="online_connection.webp" :draggable="false" />
					</vCol>
				</vRow>
			</vCol>

			<vCol cols="12" lg="6">
				<vRow>
					<vCol cols="12">
						<p class="text-lg-h4 text-h5">
							Welcome back!
						</p>

						<p class="text-subtitle-1">
							Stay connected with your campus faster and smarter
						</p>
					</vCol>
					<vCol cols="12">
						<LoginForm />
					</vCol>
				</vRow>
			</vCol>
		</vRow>
	</VContainer>
</template>