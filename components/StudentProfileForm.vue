<script setup>
const props = defineProps({
	profile: Object,
	student: Object
})

const route = useRoute()

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
	await $fetch('/api/storage', {
		method: 'DELETE',
		body: {
			path: `profiles/${props.profile.avatar}`
		}
	})
	await $fetch('/api/profiles', {
		method: 'PUT',
		body: {
			delete_avatar: true,
			user_id: props.profile.user_id
		}
	})
}
</script>

<template>
	<vRow>
		<vCol cols="12">
			<p>PROFILE INFORMATION</p>
			<VDivider class="mb-3" />
		</vCol>

		<vCol cols="12">
			<VRow align="center" justify="center" justify-lg="start">
				<vCol cols="12" lg="1">
					<div class="d-flex justify-center justify-lg-start">
						<VAvatar
							:image="profile.avatar ? client.storage.from('images').getPublicUrl(`profiles/${profile.avatar}`).data.publicUrl : '/img/blank-profile-picture-973460_1280.png'"
							size="100" rounded="circle" accept="image/*" />
					</div>
				</vCol>

				<vCol cols="12" lg="5">
					<div class="mx-3">
						<VForm @submit.prevent="uploadAvatarFile" v-if="uploadAvatar" ref="avatarFormRef">
							<VFileInput label="Avatar File" v-model="avatarFile" :loading="loading" :rules="avatarRule.avatar"
								:disabled="loading" />
							<VBtn block type="submit" color="primary" text="Save" :loading="loading" />
							<VBtn type="button" block class="mt-3" color="error" text="Cancel" :loading="loading"
								@click="uploadAvatar = false" />
						</VForm>

						<div class="d-flex justify-center justify-lg-start" v-else>
							<VBtn type="button" color="secondary" text="Upload" :loading="loading" @click="uploadAvatar = true" />
						</div>
					</div>
				</vCol>
			</VRow>
		</vCol>

		<vCol cols="12">
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
						<vTextField label="Matric ID" v-model="studentProfileForm.matric_id" :rules="studentProfileRules.matric_id"
							:loading="loading" :disabled="!editProfile || loading" v-if="route.params.user_id == profile.user_id" />						
						<vTextField label="Matric ID" v-model="studentProfileForm.matric_id" :rules="studentProfileRules.matric_id"
							:loading="loading" disabled v-else />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Faculty" :items="faculties" :rules="studentProfileRules.faculty"
							:disabled="!editProfile || loading" :loading="loading" v-model="studentProfileForm.faculty" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Course" :items="courses" :rules="studentProfileRules.course"
							:disabled="!editProfile || loading" :loading="loading" v-model="studentProfileForm.course" />
					</vCol>

					<template v-if="editProfile">
						<vCol cols="12" lg="6">
							<VBtn text="Save" block type="submit" color="primary" :loading="loading" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Cancel" block type="button" color="error" @click="editProfile = false" :loading="loading" />
						</vCol>
					</template>

					<template v-else>
						<vCol cols="12" lg="6">
							<VBtn text="Edit" block type="button" color="secondary" @click="editProfile = true" />
						</vCol>
						<VCol cols="12" lg="6">
							<VBtn text="Back" block type="button" color="grey" to="/admin/students"
								v-if="route.params.user_id == props.profile.user_id" />
						</VCol>
					</template>
				</VRow>
			</vForm>
		</vCol>
	</vRow>
</template>