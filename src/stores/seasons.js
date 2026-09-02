import { defineStore } from 'pinia'

const urlAPI = '/api/seasons'

export const useSeasonsStore = defineStore('seasons', {
  state: () => ({
    seasons: [],
    selectedSeason: null,
    loading: false,
    error: null,
  }),
  getters: {
    allSeasons: (state) => {
      return state.seasons
    },
    isLoading: (state) => {
      return state.loading
    },
    ifError: (state) => {
      return state.error
    },
  },
  actions: {
    async getApiSeasons() {
      this.loading = true
      this.error = null
      this.selectedSeason = null

      try {
        const response = await fetch(urlAPI)
        if (!response.ok) {
          throw new Error('Erreur HTTP ' + response.status)
        }

        const data = await response.json()
        this.seasons = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async getApiSeason(id) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/${id}`)
        if (!response.ok) {
          throw new Error('Erreur HTTP ' + response.status)
        }

        const data = await response.json()
        this.selectedSeason = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
  },
})
