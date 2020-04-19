<template>
  <div class="lr">
    <h1>Lazy Redmine</h1>
    <p>
      En retard pour remplir les temps du trimestre ? Y'a qu'à cliquer !
      <span
        class="small"
      >N'ajoute pas de temps aux jours fériés et aux week ends</span>
      <span
        class="small"
      >Ne dépasse jamais 8h par jour</span>
    </p>
    <a
      :href="timesheetUrl"
      target="_blank"
    >
      <button class="button secondary">Ma page de temps Redmine</button>
    </a>
    <div class="container">
      <div class="label-input">
        <label
          class="flex50"
          for="checkbox"
        >Clé redmine</label>
        <input
          v-model="key"
          class="input flex50"
          placeholder="Ma clé redmine"
          @change="updateForm('key', $event.target.value)"
        >
      </div>
      <div class="label-input">
        <label
          class="flex50"
          for="checkbox"
        >Commentaire</label>
        <input
          v-model="comments"
          class="input flex50"
          placeholder="Comment"
          @change="updateForm('comments', $event.target.value)"
        >
      </div>
      <div class="label-input">
        <label for="checkbox">Nombre d'heure</label>
        <input
          v-model="hours"
          class="input flex50"
          type="number"
          step="0.10"
          min="0.1"
          max="8"
          placeholder="Hours"
          :disabled="fillhours"
          @change="updateForm('hours', $event.target.value)"
        >
        <input
          id="checkbox"
          v-model="fillhours"
          type="checkbox"
        >
        <label for="checkbox">Compléter les journées</label>
      </div>
    </div>
    <div class="container flex">
      <div class="selector">
        <vselect
          v-model="project"
          label="name"
          :options="projects"
          placeholder="Projet"
          :disabled="!key"
        />
      </div>
      <div class="selector">
        <vselect
          v-model="activity"
          label="name"
          :options="activities"
          placeholder="Activité"
          :disabled="!project"
        />
      </div>
    </div>
    <div class="container flex">
      <v-date-picker
        v-model="days"
        mode="range"
        color="red"
        is-dark
        is-inline
      />
    </div>
    <button
      class="button primary submit"
      :disabled="!project || !key || !activity || loading"
      @click="submit"
    >
      PLZ HELP ME
    </button>
    <notifications group="notif" />
  </div>
</template>

<script>
import axios from 'axios'
import * as moment from 'moment'
import debounce from 'debounce'

export default {
  name: 'Form',
  data () {
    return {
      fillhours: false,
      timesheetUrl: '',
      loading: false,
      feries: null,
      key: '',
      comments: 'added via Lazy Redmine',
      days: {},
      hours: 8,
      project: null,
      projects: [],
      activity: null,
      activities: []
    }
  },
  watch: {
    key: function (newEnv, oldEnv) {
      if (newEnv.length) {
        this.getProjects(newEnv, null)
      } else {
        this.projects = []
        this.project = null
      }
    },
    // putting watchers since vselect @change is broken https://github.com/sagalbot/vue-select/issues/545
    activity: function (newEnv, oldEnv) {
      this.updateForm('activity', newEnv)
    },
    project: function (newEnv, oldEnv) {
      this.updateForm('project', newEnv)
      if (newEnv != null && newEnv.id != null) {
        this.getActivities(this.key, newEnv.id)
      } else {
        this.activities = []
        this.activity = null
      }
    }
  },
  created () {
    const storedForm = this.openStorage()
    if (storedForm) {
      if (storedForm.key) {
        this.key = storedForm.key
      }
      if (storedForm.comments) {
        this.comments = storedForm.comments
      }
      if (storedForm.hours) {
        this.hours = storedForm.hours
      }
      if (storedForm.activity) {
        this.activity = storedForm.activity
      }
      if (storedForm.project) {
        this.project = storedForm.project
      }
      this.getProjects = debounce(this.getProjects, 500)
    }
    axios({
      method: 'get',
      baseURL: '/api/baseurl',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      this.timesheetUrl = response.data
    })
  },
  mounted () {
    fetch(
      `https://jours-feries-france.antoine-augusti.fr/api/${moment().year()}`
    )
      .then(data => data.json())
      .then(res => {
        res = res
          .filter(x => x.nom_jour_ferie !== 'Lundi de Pentecôte') // filter solidarity day https://www.service-public.fr/professionnels-entreprises/actualites/A13357
          .map(x => x.date)
        this.feries = res
      })
  },
  methods: {
    openStorage () {
      return JSON.parse(localStorage.getItem('form'))
    },
    saveStorage (form) {
      localStorage.setItem('form', JSON.stringify(form))
    },
    updateForm (input, value) {
      this[input] = value

      let storedForm = this.openStorage() // extract stored form
      if (!storedForm) storedForm = {} // if none exists, default to empty object

      storedForm[input] = value // store new value
      this.saveStorage(storedForm) // save changes into localStorage
    },
    submit () {
      const self = this
      this.loading = true
      for (
        let m = moment(this.days.start);
        m.isBefore(moment(this.days.end).add(1, 'days'));
        m.add(1, 'days')
      ) {
        const dateFormatted = m.format('YYYY-MM-DD')
        if (
          m.isoWeekday() < 6 &&
                    !this.feries.includes(dateFormatted)
        ) {
          axios({
            method: 'post',
            baseURL: '/api/time_entries/check',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              key: this.key,
              date: dateFormatted
            }
          }).then(response => {
            let timespent = 0
            response.data.time_entries.forEach(x => {
              timespent += x.hours
            })
            if (timespent < 8) {
              this.putTimeEntry(dateFormatted, timespent)
            }
          }).catch(e => {
            console.error(e)
          })
        }
      }
      setTimeout(() => {
        self.loading = false
      }, 2000)
    },
    putTimeEntry (date, timespent) {
      const h = this.fillhours
        ? 8 - timespent
        : Math.min(this.hours, 8 - timespent)
      axios({
        method: 'post',
        baseURL: '/api/time_entries',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          key: this.key,
          project: this.project.id,
          comments: this.comments,
          hours: h,
          activity: this.activity.id,
          date
        }
      })
        .then(response => {
          if (response.status === 200) {
            this.$notify({
              group: 'notif',
              type: 'success',
              title: `Success on ${date} added ${h} hours`
            })
          } else {
            this.$notify({
              group: 'notif',
              type: 'error',
              title: `Error ${response.status} on ${date}`
            })
          }
        })
        .catch(e => {
          this.$notify({
            group: 'notif',
            type: 'error',
            title: `Error ${e.response.status} on ${date}`,
            text: e.response.statusText
          })
        })
    },
    getProjects (key, offset) {
      axios({
        method: 'post',
        baseURL: '/api/projects',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          key: key,
          offset: offset
        }
      }).then(response => {
        this.projects = this.projects.concat(response.data.projects)
        const returned = 100 * (offset + 1)
        if (returned < response.data.total_count) this.getProjects(key, returned)
      })
    },
    getActivities (key, id) {
      axios({
        method: 'post',
        baseURL: '/api/activities',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          key: key,
          id: id
        }
      }).then(response => {
        this.activities = response.data.project.time_entry_activities
      })
    }
  }
}
</script>
