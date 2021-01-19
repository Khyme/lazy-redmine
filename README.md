# lazy-redmine

A simple webapp to rapidly fill redmine timesheets by daterange using it's [REST api](https://www.redmine.org/projects/redmine/wiki/Rest_api), requiring *user's api access key* which is not stored on the server.

## Build and run

### Using docker

```
docker build -t lazy-redmine .
docker run --rm -p 3000:3000 lazy-redmine
```

You can now open your browser on http://localhost:3000

### Dev build

#### Initial setup

```sh
cd back && npm install
cd ../front && npm install
```

#### Start dev environment (with hot-reload)

```sh
# backend on port 3000
cd back && npm run dev

# frontend on port 8080
cd front && npm run serve
```

### Configuration

See [VueJS reference](https://cli.vuejs.org/config/).
