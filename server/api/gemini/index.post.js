export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const body = await readBody(event)
	const gemini = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${config.geminiKey}`, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: {
			contents: body.contents
		}
	})

	return gemini.candidates[0].content
})