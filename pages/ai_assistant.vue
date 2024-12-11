<script setup>
const text = ref('')
const loading = ref(false)
const contents = ref([])
const submitText = async () => {
	loading.value = true
	contents.value.push({
		role: 'user',
		parts: [{
			text: text.value
		}]
	})

	text.value = ''

	const data = await $fetch('/api/gemini', {
		method: 'post',
		body: {
			contents: contents.value
		}
	})

	contents.value.push(data)
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

	<VTextField v-model="text" label="Text" :loading="loading" :disabled="loading" class="mt-5" />
	<VBtn text="Send" color="primary" variant="elevated" @click="submitText" :loading="loading" />
</template>