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

	loading.value = false
}
</script>

<template>
	<div v-for="content in contents" :key="content" class="mt-5">
		<p>{{ content.role }}:</p>
		<div v-for="part in content.parts">
			<p>{{ part.text }}</p>
		</div>
	</div>

	<VForm @submit.prevent="sendText" ref="textFormRef">
		<VTextField v-model="textForm.text" label="Text" :rules="textRules.text" :loading="loading" :disabled="loading"
			class="mt-5" />
		<VBtn text="Send" color="primary" variant="elevated" type="submit" :loading="loading" />
	</VForm>
</template>