// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	compatibilityDate: "2024-08-06",
	modules: ["vuetify-nuxt-module", "@nuxtjs/supabase", "@unocss/nuxt", "nuxt-security"],
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
		clientOptions: {
			auth: {
				flowType: 'pkce',
				autoRefreshToken: true,
				detectSessionInUrl: true,
				persistSession: true,
			},
		},
		cookieOptions: {
			maxAge: 60 * 60 * 8,
			sameSite: 'lax',
			secure: true
		}
	},
	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL
		}
	},
	security: {
		headers: {
			contentSecurityPolicy: {
				"img-src": ["'self'", "data:", `${process.env.SUPABASE_URL}`]
			},
			crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
			crossOriginResourcePolicy: 'cross-origin'
		},
		csrf: true
	}
})