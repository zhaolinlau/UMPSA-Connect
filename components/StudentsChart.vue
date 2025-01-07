<script setup>
import { Line } from 'vue-chartjs'

const props = defineProps({
	students: Array
})

const faculties = useFaculty()

const Computing = useArrayFilter(props.students, student => student.faculty == 'Faculty of Computing')
const Chemical = useArrayFilter(props.students, student => student.faculty == 'Faculty of Chemical and Process Engineering Technology')
const Civil = useArrayFilter(props.students, student => student.faculty == 'Faculty of Civil Engineering Technology')
const Electrical = useArrayFilter(props.students, student => student.faculty == 'Faculty of Electrical and Electronics Engineering Technology')
const Manufacturing = useArrayFilter(props.students, student => student.faculty == 'Faculty of Manufacturing and Mechatronic Engineering Technology')
const Mechanical = useArrayFilter(props.students, student => student.faculty == 'Faculty of Mechanical and Automotive Engineering Technology')
const Industrial = useArrayFilter(props.students, student => student.faculty == 'Faculty of Industrial Sciences and Technology')
const IndustrialManagement = useArrayFilter(props.students, student => student.faculty == 'Faculty of Industrial Management')

const data = {
	labels: faculties,
	datasets: [
		{
			label: 'Number of Students',
			backgroundColor: '#04c8c5',
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
	<Line :data="data" :options="options" />
</template>