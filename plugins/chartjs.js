import { Chart as ChartJS, registerables } from 'chart.js'

export default defineNuxtPlugin(nuxtApp => {
	ChartJS.register(...registerables)
})