<template>
  <div class="lr">
    <h1>Lazy Redmine</h1>
    <p>
        En retard pour remplir les temps du trimestre ? Y'a qu'à cliquer !
		<span class="small">Retire les jours fériés et les week ends comme un grand</span>
    </p>
    <a :href="timesheetUrl"  target="_blank">
        <button class="button secondary">Ma page de temps Redmine</button>
    </a>
	<div>
		<input v-model="key" placeholder="Ma clé redmine" @change="updateForm('key', $event.target.value)">
    <input v-model="comments" placeholder="Comment" @change="updateForm('comments', $event.target.value)">
	</div>
	<div>
		<select v-model="project">
			<option v-for="p in projects" v-bind:value="p.id" v-bind:key="p.id">
				{{ p.name }}
			</option>
		</select>


		<select v-model="activity">
			<option v-for="a in activities" v-bind:value="a.id" v-bind:key="a.id">
				{{ a.name }}
			</option>
		</select>
	</div>
	<div class="calendar">
		<v-date-picker
			mode="range"
			v-model='days'
			color="red"
			is-dark
			is-inline
		/>
	</div>
	<button class="button primary submit" :disabled="!project || !key || !activity || loading" v-on:click="submit">PLZ HELP ME</button>
    <notifications group="notif" />
  {{timesheetUrl}}
  </div>
</template>

<script>
import axios from 'axios'
import * as moment from 'moment'

export default {
  name: 'Form',
  data () {
    return {
      timesheetUrl: '',
      loading: false,
      feries: null,
      key: '',
      comments: 'added via Lazy Redmine',
      days: {},
      project: 218,
      projects: [
        { name: 'R&D - Herow', id: 218},
        { name: '*Connecthings', id: 92}
      ],
      activity: 376,
      activities: [
        { name: 'Développement', id: 376},
        { name: 'Congé payés / RTT', id: 375},
      ]
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
    }
    axios({
            method: 'get',
            baseURL: '/api/baseurl',
            headers: {
              'Content-Type': 'application/json'
            }
    }).then(response => { this.timesheetUrl = response.data})

  },
  mounted () {
    fetch('https://jours-feries-france.antoine-augusti.fr/api/' + moment().year())
      .then(data => {return data.json()})
      .then(res=> {
        res = res.filter(x => x.nom_jour_ferie !== "Lundi de Pentecôte") // filter solidarity day https://www.service-public.fr/professionnels-entreprises/actualites/A13357
          .map(x => x.date)
        console.debug(res)
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
    submit: function () {
      var self = this
      this.loading = true
      for (var m = moment(this.days.start); m.isBefore(moment(this.days.end).add(1, 'days')); m.add(1, 'days')) {
        let dateFormatted = m.format('YYYY-MM-DD')
        if(m.isoWeekday() < 6 && !(this.feries.includes(dateFormatted))) {
          axios({
            method: 'post',
            baseURL: '/api/time_entries',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              key: this.key,
              project: this.project,
              comments: this.comments,
              hours: 8,
              activity: this.activity,
              date: dateFormatted
            }
          }).then(response => {
                if(response.status === 200) {
                    self.$notify({
                        group: 'notif',
                        type: 'success',
                        title: 'Success on ' + dateFormatted
                    })
                } else {
                    self.$notify({
                        group: 'notif',
                        type: 'error',
                        title: 'Error ' + response.status + ' on ' + dateFormatted
                    })
                }
              }
          ).catch(e => {
            self.$notify({
                group: 'notif',
                type: 'error',
                title: 'Error ' + e.response.status + ' on ' + dateFormatted,
                text: e.response.statusText
            })
          })
        }
      }
      setTimeout(() => {  self.loading = false; }, 2000)
    }
  }

}
</script>