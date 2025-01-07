<script setup>
import { Line } from 'vue-chartjs'

const props = defineProps({
	staffs: Array
})

const departments = useDepartment()

const a = useArrayFilter(props.staffs, staff => staff.department == 'Academic and International Affairs Department')
const b = useArrayFilter(props.staffs, staff => staff.department == 'Employee Assistance Programme')
const c = useArrayFilter(props.staffs, staff => staff.department == 'Library')
const d = useArrayFilter(props.staffs, staff => staff.department == 'Office of the Vice-Chancellor')
const e = useArrayFilter(props.staffs, staff => staff.department == 'Research and Innovation Department')
const f = useArrayFilter(props.staffs, staff => staff.department == 'UMP Disability Services Unit (OkUMP)')
const g = useArrayFilter(props.staffs, staff => staff.department == 'Bursary Office')
const h = useArrayFilter(props.staffs, staff => staff.department == 'Internal Audit Unit')
const i = useArrayFilter(props.staffs, staff => staff.department == 'Occupational Safety and Health Management Office')
const j = useArrayFilter(props.staffs, staff => staff.department == `Registrar's Office`)
const k = useArrayFilter(props.staffs, staff => staff.department == 'Student Affairs & Alumni Department')
const l = useArrayFilter(props.staffs, staff => staff.department == 'UMP Press')

const data = {
	labels: departments,
	datasets: [
		{
			label: 'Number of Staffs',
			backgroundColor: '#04c8c5',
			data: [
				a.value.length,
				b.value.length,
				c.value.length,
				d.value.length,
				e.value.length,
				f.value.length,
				g.value.length,
				h.value.length,
				i.value.length,
				j.value.length,
				k.value.length,
				l.value.length
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