<script setup>
const props = defineProps({
	student: Object
})
const faculties = useFaculty()

const courses = useCourse()

const client = useSupabaseClient()

const editProfile = ref(false)

const loading = ref(false)

const uploadAvatar = ref(false)

const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const studentFormRef = ref()
const avatarFormRef = ref()

const avatarRule = ref({
	avatar: [
		value => {
			if (value.length > 0) return true
			return 'Avatar is required.'
		}
	],
})

const studentProfileRules = ref({
	password: [
		value => {
			if (value) return true
			return 'Password is required.'
		}
	],
	confirm_password: [
		value => {
			if (value) return true
			return 'Confirm Password is required.'
		}
	],
	matric_id: [
		value => {
			if (value) return true
			return 'Matric ID is required.'
		}
	],
	name: [
		value => {
			if (value) return true
			return 'Name is required.'
		}
	],
	gender: [
		value => {
			if (value) return true
			return 'Gender is required.'
		}
	],
	nationality: [
		value => {
			if (value) return true
			return 'Nationality is required.'
		}
	],
	faculty: [
		value => {
			if (value) return true
			return 'Faculty is required.'
		}
	],
	course: [
		value => {
			if (value) return true
			return 'Course is required.'
		}
	]
})

const avatarFile = ref(null)

const studentProfileForm = reactive({
	name: props.profile.name,
	gender: props.profile.gender,
	nationality: props.profile.nationality,
	avatar: props.profile.avatar,
	matric_id: props.student.matric_id,
	faculty: props.student.faculty,
	course: props.student.course,
})

const updateProfile = async () => {
	await $fetch('/api/profiles', {
		method: 'put',
		body: {
			user_id: props.profile.user_id,
			name: studentProfileForm.name,
			gender: studentProfileForm.gender,
			nationality: studentProfileForm.nationality,
			avatar: studentProfileForm.avatar,
			role: props.profile.role
		}
	})
}

const updateStudent = async () => {
	await $fetch('/api/students', {
		method: 'put',
		body: {
			user_id: props.student.user_id,
			matric_id: studentProfileForm.matric_id,
			faculty: studentProfileForm.faculty,
			course: studentProfileForm.course,
		}
	})
}

const updateStudentProfile = async () => {
	loading.value = true

	const { valid } = await studentFormRef.value.validate()

	if (valid) {
		await updateProfile()
		await updateStudent()
		editProfile.value = false
	}

	loading.value = false
}

const uploadAvatarFile = async () => {
	loading.value = true

	const { valid } = await avatarFormRef.value.validate()

	if (valid) {
		if (props.profile.avatar) {
			await deleteMedia()
		}

		await randomNumber()
		await client.storage.from('images').upload(`profiles/${media_id.value}/${avatarFile.value.name}`, avatarFile.value, {
			cacheControl: '3600',
			upsert: false
		})

		studentProfileForm.avatar = `${media_id.value}/${avatarFile.value.name}`
		await updateProfile()
		await updateStudent()
		avatarFile.value = null
		uploadAvatar.value = false
	}

	loading.value = false
}

const deleteMedia = async () => {
	await client.storage.from('images').remove([`profiles/${props.profile.avatar}`])
	await client.from('profiles').update({ avatar: '' }).eq('id', props.profile.id)
}
</script>

<template>
	<vBtn icon="i-mdi:pencil" color="secondary" @click="editStudentDialog = true" />

	<VDialog v-model="editStudentDialog" max-width="750">
		<VCard title="Edit Student">
			<VContainer>
				<VRow align="center">
					<vCol cols="1">
						<VAvatar
							:image="profile.avatar ? client.storage.from('images').getPublicUrl(`profiles/${profile.avatar}`).data.publicUrl : '/img/blank-profile-picture-973460_1280.png'"
							size="100" rounded="circle" accept="image/*" />
					</vCol>

					<vCol cols="5">
						<VForm @submit.prevent="uploadAvatarFile" class="ml-3" v-if="uploadAvatar" ref="avatarFormRef">
							<VFileInput label="Avatar File" v-model="avatarFile" :loading="loading" :rules="avatarRule.avatar"
								:disabled="loading" />
							<VBtn block type="submit" color="primary" text="Save" :loading="loading" />
							<VBtn type="button" block class="mt-3" color="error" text="Cancel" :loading="loading"
								@click="uploadAvatar = false" />
						</VForm>

						<VBtn type="button" color="secondary" text="Upload" class="ml-3" :loading="loading"
							@click="uploadAvatar = true" v-else />
					</vCol>
				</VRow>

				<vForm @submit.prevent="updateStudentProfile" ref="studentFormRef">
					<VRow>
						<vCol cols="12" lg="6">
							<vTextField label="Name" v-model="studentProfileForm.name" :rules="studentProfileRules.name"
								:loading="loading" :disabled="!editProfile || loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Gender" :items="['Male', 'Female']" :rules="studentProfileRules.gender"
								v-model="studentProfileForm.gender" :disabled="!editProfile || loading" :loading="loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Nationality" :items="['Local', 'International']" :rules="studentProfileRules.nationality"
								:disabled="!editProfile || loading" :loading="loading" v-model="studentProfileForm.nationality" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Matric ID" v-model="studentProfileForm.matric_id"
								:rules="studentProfileRules.matric_id" disabled :loading="loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Faculty" :items="faculties" :rules="studentProfileRules.faculty"
								:disabled="!editProfile || loading" :loading="loading" v-model="studentProfileForm.faculty" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Course" :items="courses" :rules="studentProfileRules.course"
								:disabled="!editProfile || loading" :loading="loading" v-model="studentProfileForm.course" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Save" block type="submit" color="primary" :loading="loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Cancel" block type="button" color="error" @click="editStudentDialog = false"
								:loading="loading" />
						</vCol>
					</VRow>
				</vForm>
			</VContainer>
		</VCard>
	</VDialog>
</template>