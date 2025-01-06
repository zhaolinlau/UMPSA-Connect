<script setup>
const textForm = reactive({
	text: ''
})
const loading = ref(false)
const contents = ref([])
const textFormRef = ref(null)
const textRules = ref({
	text: [
		value => {
			if (value) return true
			return 'Text is required.'
		}
	]
})

const sendText = async () => {
	try {
		loading.value = true
		const { valid } = await textFormRef.value.validate()

		if (valid) {
			contents.value.push({
				role: 'user',
				parts: [{
					text: textForm.text
				}]
			})

			textFormRef.value.reset()

			const data = await $fetch('/api/gemini', {
				method: 'post',
				body: {
					contents: contents.value
				}
			})

			contents.value.push(data)			
		}

	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<VContainer>
		<VRow justify="center">
			<template v-for="content in contents" :key="content">
				<VCol cols="12" lg="7">
					<VDivider />
				</VCol>
				<VCol cols="12" lg="7" :class="content.role == 'user' ? 'text-end' : ''">
					<p :class="`font-weight-bold ${content.role == 'user' ? 'text-primary' : 'text-secondary'}`">
						{{ content.role == 'user' ? 'You' : 'AI Assistant' }}:</p>
					<div v-for="part in content.parts">
						<VueMarkdown :markdown="part.text" />
					</div>
				</VCol>
			</template>

			<VCol cols="12" lg="7">
				<VForm @submit.prevent="sendText" ref="textFormRef">
					<VTextarea v-model="textForm.text" label="Text" :rules="textRules.text" :loading="loading"
						:disabled="loading" />
					<VBtn text="Send" color="primary" variant="elevated" type="submit" :loading="loading" id="send_text" />
				</VForm>
			</VCol>
		</VRow>
	</VContainer>
</template>