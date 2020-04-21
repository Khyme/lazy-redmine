const express = require('express')
const axios = require('axios')
const app = express()
const config = require('config');

const port = 3000

var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(express.static('../front/dist'))

const httpClient = axios.create({
	method: 'post',
	baseURL: config.get('redmineBaseUrl'),
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json'
	}
})

app.post('/api/time_entries', (req, res) =>
	httpClient.post('/time_entries.json', {
		"time_entry": {
			"project_id": req.body.project,
			"hours": req.body.hours,
			"activity_id": req.body.activity,
			"comments": req.body.comments,
			"spent_on": req.body.date
		}
	}, {
		headers: { 'X-Redmine-API-Key': req.body.key }
	}).then(response => {
		res.send(response.data)
	}).catch(e => {
		res.sendStatus(e.response.status)
		console.error(e)
	})
)

app.post('/api/time_entries/check', (req, res) =>
	httpClient.get('/time_entries.json?user_id=me&spent_on=' + req.body.date, {
		headers: { 'X-Redmine-API-Key': req.body.key }
	}).then(response => {
		res.send(response.data)
	}).catch(e => {
		res.sendStatus(e.response.status)
		console.error(e)
	})
)

app.post('/api/projects', (req, res) => {
	let url = req.body.offset ? '/projects.json?limit=100&offset=' + req.body.offset : '/projects.json?limit=100'
	httpClient.get(url, {
		headers: { 'X-Redmine-API-Key': req.body.key }
	}).then(response => {
		response.data.projects = response.data.projects.filter(x => x.status === 1)
		res.send(response.data)
	}).catch(e => {
		res.sendStatus(e.response.status)
		console.error(e)
	})
})

app.post('/api/activities', (req, res) => {
	httpClient.get('/projects/' + req.body.id + '.json?include=time_entry_activities', {
		headers: { 'X-Redmine-API-Key': req.body.key }
	}).then(response => {
		res.send(response.data)
	}).catch(e => {
		res.sendStatus(e.response.status)
		console.error(e)
	})
})

app.get('/api/myTimesheetUrl', (req, res) =>
	res.send(config.get('redmineBaseUrl') + '/time_entries?user_id=me')
)

app.listen(port)
