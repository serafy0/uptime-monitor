# Uptime monitor

The main idea of the task is to build an uptime monitoring API server which allows authorized users to enter URLs they want monitored, and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

## Features

- Sign-up with email verification.
- Stateless authentication using JWT.
- Users can create a check to monitor a given URL if it is up or down.
- Users can edit, pause, or delete their checks if needed.
- Users may receive a notification on a webhook URL by sending HTTP POST request whenever a check goes down or up.
- Users should receive email alerts whenever a check goes down or up.
- Users can get detailed uptime reports about their checks availability, average response time, and total uptime/downtime.
- Users can group their checks by tags and get reports by tag.


## how to run locally

this api uses port 3000 by default
you should set up your own environment variables inside a `.env` file

```npm install```

```npm run dev```

then you should be able to open http://localhost:3000/api-docs/

- note that in order for the deployment docs to work as expected in the swagger schema you should always choose `http` for the schema


### running tests
``npm  test``

npm run dev
running tests

npm test

you can also use npm run test-with-coverage

## Technologies

- node.js
- MongoDB
- redis with bullmq for queues 
- mailjet for sending emails
- swagger for documentation

## deployment 

https://u-monitor.herokuapp.com/api-docs/


