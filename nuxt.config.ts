

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	compatibilityDate: "2024-08-06",
	modules: ["vuetify-nuxt-module", "@nuxtjs/supabase", "@unocss/nuxt"],
	vuetify: {
		vuetifyOptions: {
			icons: {
				defaultSet: 'unocss-mdi'
			},
			theme: {
				defaultTheme: 'myCustomTheme',
				themes: {
					myCustomTheme: {
						colors: {
							primary: '#15a195',
							secondary: '#1a478fff'
						}
					}
				}
			}
		}
	},
	supabase: {
		redirectOptions: {
			login: '/login',
			callback: '/confirm',
			include: undefined,
			exclude: [],
			cookieRedirect: false,
		},
		cookieOptions: {
			maxAge: 60 * 60 * 8,
			sameSite: 'lax',
			secure: true
		},
		clientOptions: {
			auth: {
				flowType: 'pkce',
				autoRefreshToken: true,
				detectSessionInUrl: true,
				persistSession: true,
			},
		}
	}
})