<script setup>
const props = defineProps({
	profile: Object,
	staff: Object
})

const departments = ref([
	'Academic and International Affairs Department',
	'Employee Assistance Programme',
	'Library',
	'Office of the Vice-Chancellor',
	'Research and Innovation Department',
	'UMP Disability Services Unit (OkUMP)',
	'Bursary Office',
	'Internal Audit Unit',
	'Occupational Safety and Health Management Office',
	`Registrar's Office`,
	'Student Affairs & Alumni Department',
	'UMP Press'
])

const positions = ref([
	'Vice-Chancellor',
	'Deputy Vice-Chancellor (Academic and International)',
	'Deputy Vice-Chancellor (Research and Innovation)',
	'Deputy Vice-Chancellor (Student Affairs and Alumni)',
	'Dean',
	'Deputy Dean (Academic)',
	'Deputy Dean (Student Affairs)',
	'Deputy Dean (Research and Innovation)',
	'Head of Department',
	'Senior Lecturer',
	'Lecturer',
	'Assistant Registrar',
	'Administrative Officer',
	'Librarian',
	'IT Officer',
	'Research Officer',
	'Technician',
	'Lab Assistant',
	'Student Counselor',
	'Public Relations Officer',
	'Financial Officer',
	'Safety Officer',
	'Audit Executive',
	'Facilities Manager',
	'Project Manager',
	'Welfare Officer',
	'Press Editor',
	'Disability Services Coordinator'
])

const client = useSupabaseClient()

const editProfile = ref(false)

const loading = ref(false)

const uploadAvatar = ref(false)

const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const avatarFile = ref('')

const staffProfileForm = reactive({
	name: props.profile.name,
	gender: props.profile.gender,
	nationality: props.profile.nationality,
	avatar: props.profile.avatar,
	employee_id: props.staff.employee_id,
	department: props.staff.department,
	position: props.staff.position,
})

const updateStaffProfile = async () => {
	loading.value = true

	await $fetch('/api/profiles', {
		method: 'put',
		body: {
			id: props.profile.id,
			name: staffProfileForm.name,
			gender: staffProfileForm.gender,
			nationality: staffProfileForm.nationality,
			avatar: staffProfileForm.avatar,
			role: props.profile.role
		}
	})

	await $fetch('/api/staffs', {
		method: 'put',
		body: {
			id: props.staff.id,
			employee_id: staffProfileForm.employee_id,
			department: staffProfileForm.department,
			position: staffProfileForm.position,
		}
	})

	loading.value = false
}

const uploadAvatarFile = async () => {
	loading.value = true

	if (props.profile.avatar) {
		await deleteMedia()
	}

	await randomNumber()
	await client.storage.from('images').upload(`profiles/${media_id.value}/${avatarFile.value.name}`, avatarFile.value, {
		cacheControl: '3600',
		upsert: false
	})

	staffProfileForm.avatar = `${media_id.value}/${avatarFile.value.name}`
	await updateStaffProfile()
	avatarFile.value = ''
	uploadAvatar.value = false
	loading.value = false
}

const deleteMedia = async () => {
	await client.storage.from('images').remove([`profiles/${props.profile.avatar}`])
	await client.from('profiles').update({ avatar: null }).eq('id', props.profile.id)
}
</script>

<template>
	<vRow>
		<vCol cols="12">
			<p>PROFILE INFORMATION</p>
			<VDivider class="mb-3" />
		</vCol>

		<vCol cols="12">
			<VRow align="center">
				<vCol cols="1">
					<VAvatar
						:image="profile.avatar ? client.storage.from('images').getPublicUrl(`profiles/${profile.avatar}`).data.publicUrl : '/img/blank-profile-picture-973460_1280.png'"
						size="100" rounded="circle" accept="image/*" />
				</vCol>

				<vCol cols="5">
					<VForm @submit.prevent="uploadAvatarFile" class="ml-3" v-if="uploadAvatar">
						<VFileInput label="Avatar File" v-model="avatarFile" :loading="loading" :disabled="loading" />
						<VBtn block type="submit" color="primary" text="Save" :loading="loading" />
						<VBtn type="button" block class="mt-3" color="error" text="Cancel" :loading="loading"
							@click="uploadAvatar = false" />
					</VForm>

					<VBtn type="button" color="secondary" text="Upload" class="ml-3" :loading="loading"
						@click="uploadAvatar = true" v-else />
				</vCol>
			</VRow>
		</vCol>

		<vCol cols="12">
			<vForm @submit.prevent="updateStaffProfile">
				<VRow>
					<vCol cols="12" lg="6">
						<vTextField label="Name" clearable v-model="staffProfileForm.name" :disabled="!editProfile || loading"
							:loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Gender" :items="['Male', 'Female']" v-model="staffProfileForm.gender"
							:disabled="!editProfile || loading" :loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Nationality" :items="['Local', 'International']" v-model="staffProfileForm.nationality"
							:disabled="!editProfile || loading" :loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<vTextField label="Employee ID" v-model="staffProfileForm.employee_id" :disabled="!editProfile || loading"
							:loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Department" :items="departments" v-model="staffProfileForm.department"
							:disabled="!editProfile || loading" :loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Position" :items="positions" v-model="staffProfileForm.position"
							:disabled="!editProfile || loading" :loading="loading" />
					</vCol>

					<template v-if="editProfile">
						<vCol cols="12" lg="6">
							<VBtn text="Save" block type="submit" color="primary" :loading="loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Cancel" block type="button" color="error" @click="editProfile = false" :loading="loading" />
						</vCol>
					</template>

					<vCol cols="12" lg="6" v-else>
						<VBtn text="Edit" block type="button" color="secondary" @click="editProfile = true" :loading="loading" />
					</vCol>
				</VRow>
			</vForm>
		</vCol>
	</vRow>
</template>