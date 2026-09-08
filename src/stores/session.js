import { defineStore } from 'pinia'

let timerId = null
const STORAGE_KEY = 'running-session-progress'

export const useSessionStore = defineStore('session', {
  state: () => ({
    activeSession: null,
    currentStepIndex: 0,
    remainingSeconds: 0,
    isRunning: false,
    isCompleted: false,
    activeSeasonId: null,
    completedSessionIds: [],
    saveLocally: true,
  }),
  getters: {
    currentStep: (state) => {
      if (!state.activeSession) {
        return null
      }
      return state.activeSession.steps[state.currentStepIndex]
    },
  },
  actions: {
    playCurrentStepAudio() {
      const step = this.currentStep
      if (!step) {
        return
      }

      const audioPath = `/audio/${step.type}.mp3`
      const sound = new Audio(audioPath)
      sound.play().catch((error) => {
        console.log('Lecture audio impossible: ', error)
      })
    },
    resetSession() {
      this.pauseTimer()

      if (!this.activeSession) {
        return
      }

      this.currentStepIndex = 0
      this.remainingSeconds = this.activeSession.steps[0].durationSeconds
      this.isCompleted = false

      this.completedSessionIds = this.completedSessionIds.filter(
        (sessionId) => sessionId !== this.activeSession.id,
      )

      this.saveProgress()
    },
    startTimer() {
      if (this.isRunning || !this.activeSession || this.isCompleted) {
        return
      }
      this.isRunning = true
      this.playCurrentStepAudio()
      timerId = setInterval(() => {
        this.remainingSeconds--
        if (this.remainingSeconds === 0) {
          this.nextStep()
          return
        }
        this.saveProgress()
      }, 20)
    },

    nextStep() {
      const nextIndex = this.currentStepIndex + 1
      if (nextIndex >= this.activeSession.steps.length) {
        this.finishSession()
        return
      }
      this.currentStepIndex = nextIndex
      this.remainingSeconds = this.activeSession.steps[this.currentStepIndex].durationSeconds
      this.playCurrentStepAudio()
      this.saveProgress()
    },
    pauseTimer() {
      clearInterval(timerId)
      timerId = null
      this.isRunning = false
      this.saveProgress()
    },
    finishSession() {
      this.pauseTimer()
      this.remainingSeconds = 0
      this.isCompleted = true
      if (!this.completedSessionIds.includes(this.activeSession.id)) {
        this.completedSessionIds.push(this.activeSession.id)
      }
      this.saveProgress()
    },
    prepareSession(session, seasonId, saveLocally = true) {
      this.pauseTimer()

      this.activeSession = session
      this.currentStepIndex = 0
      this.remainingSeconds = session.steps[0].durationSeconds
      this.isRunning = false
      this.isCompleted = false
      this.activeSeasonId = seasonId
      this.saveLocally = saveLocally
    },
    saveProgress() {
      if (!this.activeSession || !this.saveLocally) {
        return
      }
      const progress = {
        seasonId: this.activeSeasonId,
        sessionId: this.activeSession.id,
        currentStepIndex: this.currentStepIndex,
        remainingSeconds: this.remainingSeconds,
        isCompleted: this.isCompleted,
        completedSessionIds: this.completedSessionIds,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    },
    restoreProgress() {
      if (!this.activeSession) {
        return
      }

      const savedProgress = localStorage.getItem(STORAGE_KEY)

      if (!savedProgress) {
        return
      }

      try {
        const progress = JSON.parse(savedProgress)

        if (progress.seasonId !== this.activeSeasonId) {
          return
        }
        this.completedSessionIds = progress.completedSessionIds || []

        if (progress.sessionId !== this.activeSession.id) {
          return
        }
        this.currentStepIndex = progress.currentStepIndex
        this.remainingSeconds = progress.remainingSeconds
        this.isCompleted = progress.isCompleted
        this.isRunning = false
      } catch (error) {
        console.log('La sauvegarde est illisible :', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    resetWeek(week) {
      if (!week || !this.activeSession) {
        return
      }

      this.pauseTimer()

      const weekSessionIds = week.sessions.map((session) => session.id)

      this.completedSessionIds = this.completedSessionIds.filter(
        (sessionId) => !weekSessionIds.includes(sessionId),
      )

      if (weekSessionIds.includes(this.activeSession.id)) {
        this.currentStepIndex = 0
        this.remainingSeconds = this.activeSession.steps[0].durationSeconds
        this.isCompleted = false
      }

      this.saveProgress()
    },
    restoreCompletedSessions(seasonId) {
      const savedProgress = localStorage.getItem(STORAGE_KEY)

      if (!savedProgress) {
        return
      }

      try {
        const progress = JSON.parse(savedProgress)

        if (progress.seasonId !== seasonId) {
          return
        }

        this.completedSessionIds = progress.completedSessionIds || []
      } catch (error) {
        console.log('La progression est illisible :', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    restoreServerProgress(progress, completedSessionIds) {
      // Copie les séances terminées récupérées depuis MySQL.
      this.completedSessionIds = [...completedSessionIds]

      // Cette séance n’a peut-être encore jamais été commencée.
      if (!progress) {
        return
      }

      this.currentStepIndex = progress.currentStepIndex
      this.remainingSeconds = progress.remainingSeconds
      this.isCompleted = progress.isCompleted
      this.isRunning = false
    },
    getLocalProgress() {
      const savedProgress = localStorage.getItem(STORAGE_KEY)

      if (!savedProgress) {
        return null
      }

      try {
        return JSON.parse(savedProgress)
      } catch (error) {
        console.log('La progression locale est illisible :', error)
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
    },

    clearLocalProgress() {
      localStorage.removeItem(STORAGE_KEY)
    },

    clearSessionState() {
      clearInterval(timerId)
      timerId = null

      this.activeSession = null
      this.currentStepIndex = 0
      this.remainingSeconds = 0
      this.isRunning = false
      this.isCompleted = false
      this.activeSeasonId = null
      this.completedSessionIds = []
      this.saveLocally = true
    },
  },
})
