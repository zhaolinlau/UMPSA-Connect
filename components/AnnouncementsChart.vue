<script setup>
import { Radar } from 'vue-chartjs'

const props = defineProps({
	announcements: Array
})

const faculties = useFaculty()

const Computing = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Computing')
const Chemical = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Chemical and Process Engineering Technology')
const Civil = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Civil Engineering Technology')
const Electrical = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Electrical and Electronics Engineering Technology')
const Manufacturing = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Manufacturing and Mechatronic Engineering Technology')
const Mechanical = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Mechanical and Automotive Engineering Technology')
const Industrial = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Industrial Sciences and Technology')
const IndustrialManagement = useArrayFilter(props.announcements, announcement => announcement.target_user == 'Faculty of Industrial Management')

const data = {
	labels: faculties,
	datasets: [
		{
			label: 'Number of Announcements',
			backgroundColor: '#04c8c5',
			borderColor: '#04c8c5',
			pointBackgroundColor: '#04c8c5',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: '#04c8c5',
			data: [
				Computing.value.length,
				Chemical.value.length,
				Civil.value.length,
				Electrical.value.length,
				Manufacturing.value.length,
				Mechanical.value.length,
				Industrial.value.length,
				IndustrialManagement.value.length
			]
		}
	]
}

const options = {
	responsive: true
}

</script>

<template>
	<Radar :data="data" :options="options" />
</template>