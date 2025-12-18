export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const body = await readBody(event)

	if (body.translate) {
		const gemini = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': config.geminiKey
			},
			body: {
				contents: [{ 'parts': [{ 'text': body.text }] }]
			}
		})

		return gemini.candidates[0].content.parts[0].text
	} else {
		const gemini = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': config.geminiKey
			},
			body: {
				contents: body.contents
			}
		})

		return gemini.candidates[0].content
	}
})