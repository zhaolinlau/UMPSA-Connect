<script setup>
definePageMeta({
	layout: 'guest',
})

const session = useSupabaseSession()

watch(session, async () => {
	if (session.value) {
		await navigateTo('/')
	}
}, { immediate: true })
</script>

<template>
	<v-container class="fill-height">
		<v-row align="center">
			<v-col cols="12" lg="6">
				<v-row>
					<v-col cols="12" class="d-flex align-center">
						<v-avatar :rounded="0" size="100" :border="0">
							<VImg src="/img/logo.webp" alt="logo.webp" :draggable="false" />
						</v-avatar>
						<p class="ml-3 text-h5 text-lg-h4">
							UMPSA Connect
						</p>
					</v-col>
					<v-col cols="12" class="hidden-sm-and-down">
						<VImg src="/img/online_connection.webp" alt="online_connection.webp" :draggable="false" />
					</v-col>
				</v-row>
			</v-col>

			<v-col cols="12" lg="6">
				<v-row>
					<v-col cols="12">
						<p class="text-lg-h4 text-h5">
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
			</v-col>
		</v-row>
	</v-container>
</template>