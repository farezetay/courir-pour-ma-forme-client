import { defineStore } from 'pinia'

const urlAPI = '/api/progress'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    activeSeason: null,
    sessions: [],
    completedSessionIds: [],
    currentSession: null,

    loading: false,
    saving: false,
    error: null,
    errorStatus: null,
  }),

  actions: {
    async getProgress() {
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        const response = await fetch(urlAPI, {
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        this.activeSeason = data.activeSeason
        this.sessions = data.sessions
        this.completedSessionIds = data.completedSessionIds
        this.currentSession = data.currentSession

        return data
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async startSeason(seasonId, mode = null) {
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        // mode vaut null pour une nouvelle saison,
        // "resume" pour reprendre ou "restart" pour recommencer.
        const body = mode ? { mode } : {}

        const response = await fetch(`${urlAPI}/seasons/${seasonId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
          this.errorStatus = response.status

          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        // Recharge la progression complète après le démarrage.
        await this.getProgress()

        return data
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async abandonSeason(seasonId) {
      this.loading = true
      this.error = null
      this.errorStatus = null

      try {
        const response = await fetch(`${urlAPI}/seasons/${seasonId}/abandon`, {
          method: 'POST',
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        this.activeSeason = null
        this.sessions = []
        this.completedSessionIds = []
        this.currentSession = null

        return data
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.loading = false
      }
    },

    async saveSessionProgress(progress) {
      this.saving = true
      this.error = null

      try {
        const response = await fetch(`${urlAPI}/sessions/${progress.sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',

          body: JSON.stringify({
            currentStepIndex: progress.currentStepIndex,
            remainingSeconds: progress.remainingSeconds,
            isCompleted: progress.isCompleted,
            distanceMeters: progress.distanceMeters ?? null,
            stepsCount: progress.stepsCount ?? null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.statusMessage || data.message || `Erreur HTTP ${response.status}`)
        }

        return data
      } catch (error) {
        this.error = error.message
        return null
      } finally {
        this.saving = false
      }
    },
    async importGuestProgress(guestProgress) {
      if (!guestProgress?.seasonId || !guestProgress?.sessionId) {
        return false
      }

      // Crée ou réactive la saison du compte.
      const startedSeason = await this.startSeason(guestProgress.seasonId)

      if (!startedSeason) {
        return false
      }

      // Copie la séance locale dans la progression MySQL.
      const savedProgress = await this.saveSessionProgress({
        sessionId: guestProgress.sessionId,
        currentStepIndex: guestProgress.currentStepIndex ?? 0,
        remainingSeconds: guestProgress.remainingSeconds ?? 0,
        isCompleted: guestProgress.isCompleted === true,
      })

      if (!savedProgress) {
        return false
      }

      // Recharge l’état MySQL après l’importation.
      await this.getProgress()

      return true
    },
  },
})
