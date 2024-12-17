# Backend boilerplate

Short description of the repository here.

## Install
```
git clone ...
npm i
cp .env-example .env
```

## Configure

Edit `.env` file, change variables:
```
NODE_ENV=development
...
```

## Launch

Description of how to launch all the processes.

Each process described here should have an `npm run` launch command.

## Folder structure

```
├── .github/              - actions and workflows
├── .husky/               - pre-commit hooks
├── dist/                 - [ignored] compiled code (if needed)
├── kubernetes/           - kubernetes configs
├── src/
│   ├── constants/        - top-level constants
│   ├── db/
│   │   ├── migrations/   - Prisma migrations
│   │   ├── repositories/ - database interaction layer
│   │   ├── index.ts      - export of Prisma models and utilities
│   │   ├── schema.prisma - database schema
│   ├── interfaces/       - top-level interfaces and types
│   ├── libs/             - common libraries
│   ├── services/         - project services
│   │   ├── service1/
│   │   ├── service2/
│   │   ├── service3/
│   ├── usecases/         - recurring patterns of interaction with repositories
│   ├── utils/            - helpers, libraries instances and other utilities
├── static/               - [ignored] static files
│   ├── public/           - publicly accessible files
├── tests/                - test scripts
├── tmp/                  - [ignored] any temporary/test code or files
├── .gitignore
├── .env                  - [ignored] global app env variables
├── .env-example
├── package.json
├── package-lock.json
└── ...
```
