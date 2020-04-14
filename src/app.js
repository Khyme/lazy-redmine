const express = require('express')
const axios = require('axios')
const app = express()
const port = 3000
var bodyParser = require('body-parser')

app.use(bodyParser.json())

app.post('/api', (req, res) =>
    axios({
		method: 'post',
		baseURL: 'https://redmine.adtag.fr/time_entries.json',
		timeout: 5000,
		headers: {
			'Content-Type': 'application/json',
			'X-Redmine-API-Key': req.body.key
		},
		data: {
			"time_entry":{
				"project_id":req.body.project,
				"hours":req.body.hours,
				"activity_id":req.body.activity,
				"comments":"added via Lazy Redmine",
				"spent_on":req.body.date
			}
		}
    }).then(response => {
          res.send(response.data)
	}).catch(e => {
		console.log(e)
	})
)

app.listen(port)