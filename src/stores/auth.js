import { defineStore } from 'pinia'

const urlAPI = '/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Contiendra l’utilisateur connecté.
    user: null,

    loading: false,
    error: null,
  }),

  getters: {
    // true si un utilisateur est connecté.
    isAuthenticated: (state) => {
      return state.user !== null
    },

    // true uniquement pour un administrateur connecté.
    isAdmin: (state) => {
      return state.user?.role === 'admin'
    },
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/register`, {
          method: 'POST',

          // Informe l’API que nous envoyons du JSON.
          headers: {
            'Content-Type': 'application/json',
          },

          // Transforme l’objet JavaScript en JSON.
          body: JSON.stringify(userData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        // L’inscription ne connecte pas automatiquement.
        // Le composant pourra utiliser cette valeur pour
        // rediriger vers la page de connexion.
        return data
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async login(identifier, password) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          // Autorise l’envoi et la réception du cookie.
          credentials: 'include',

          body: JSON.stringify({
            identifier,
            password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        // L’API a validé le compte et créé le cookie.
        this.user = data

        return data
      } catch (error) {
        this.user = null
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async getCurrentUser() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/me`, {
          credentials: 'include',
        })

        // Une erreur 401 signifie simplement que
        // personne n’est actuellement connecté.
        if (response.status === 401) {
          this.user = null
          return
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        this.user = data.user
      } catch (error) {
        this.user = null
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/logout`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`)
        }

        // L’API a supprimé la session MySQL et le cookie.
        this.user = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
  },
})
