<script setup>
const props = defineProps({
	profile: Object,
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

const avatarFile = ref('')

const studentProfileForm = reactive({
	name: props.profile.name,
	gender: props.profile.gender,
	nationality: props.profile.nationality,
	avatar: props.profile.avatar,
	matric_id: props.student.matric_id,
	faculty: props.student.faculty,
	course: props.student.course,
})

const updateStudentProfile = async () => {
	loading.value = true

	await $fetch('/api/profiles', {
		method: 'put',
		body: {
			id: props.profile.id,
			name: studentProfileForm.name,
			gender: studentProfileForm.gender,
			nationality: studentProfileForm.nationality,
			avatar: studentProfileForm.avatar,
			role: props.profile.role
		}
	})

	await $fetch('/api/students', {
		method: 'put',
		body: {
			id: props.student.id,
			matric_id: studentProfileForm.matric_id,
			faculty: studentProfileForm.faculty,
			course: studentProfileForm.course,
		}
	})

	loading.value = false
	editProfile.value = false
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

	studentProfileForm.avatar = `${media_id.value}/${avatarFile.value.name}`
	await updateStudentProfile()
	avatarFile.value = ''
	uploadAvatar.value = false
	loading.value = false
}

const deleteMedia = async () => {
	await client.storage.from('images').remove([`profiles/${props.profile.avatar}`])
	await client.from('profiles').update({ avatar: '' }).eq('id', props.profile.id)
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
			<vForm @submit.prevent="updateStudentProfile">
				<VRow>
					<vCol cols="12" lg="6">
						<vTextField label="Name" v-model="studentProfileForm.name" :loading="loading"
							:disabled="!editProfile || loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Gender" :items="['Male', 'Female']" v-model="studentProfileForm.gender"
							:disabled="!editProfile || loading" :loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Nationality" :items="['Local', 'International']" :disabled="!editProfile || loading"
							:loading="loading" v-model="studentProfileForm.nationality" />
					</vCol>

					<vCol cols="12" lg="6">
						<vTextField label="Student ID" v-model="studentProfileForm.matric_id" disabled :loading="loading" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Faculty" :items="faculties" :disabled="!editProfile || loading" :loading="loading"
							v-model="studentProfileForm.faculty" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Course" :items="courses" :disabled="!editProfile || loading" :loading="loading"
							v-model="studentProfileForm.course" />
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
						<VBtn text="Edit" block type="button" color="secondary" @click="editProfile = true" />
					</vCol>
				</VRow>
			</vForm>
		</vCol>
	</vRow>
</template>