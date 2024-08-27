## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Have NodeJS installed (16.15.1)
- Have TypeScript installed
- Have PostgreSQL installed

### Installing

- Run `npm install`
- Go to the ROOT of the project and create a new file called `.env` with the content of `.env.example` and fill the env vars.

## Running the API

- Before running the Core API go to the ROOT of the project and enter `npm run docs`
- To run the Core API enter `npm run start:dev` in terminal

When you run the app it will automatically create a USER account with a role named Admin which has full privilegies.
The username and password to login into the accounts will appear in the terminal when you run the app for the first time (This will only work if there is no Roles created in the DB).

