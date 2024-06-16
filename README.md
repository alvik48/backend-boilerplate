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

## Recommended folder structure

```
├── .github/              - actions and workflows
├── .husky/               - pre-commit hooks
├── kubernetes/           - kubernetes configs
├── src/
│   ├── api/              - if you have an API server
│   ├── constants/        - top-level constants
│   ├── db/
│   │   ├── prisma/       - prisma migrations
│   │   ├── repositories/ - database interaction layer
│   │   ├── schema.prisma - database schema
│   ├── interfaces/       - top-level interfaces and types
│   ├── jobs/             - "work-and-die" scripts
│   ├── libs/             - common libraries
│   ├── usecases/         - recurring patterns of interaction with repositories
│   ├── utils/            - helpers, libraries instances and so on
│   ├── workers/          - constantly running scripts
├── dist/                 - [ignored] compiled code (if needed)
├── tests/                - tests scripts
├── tmp/                  - [ignored] any temporary/test code or files
├── .gitignore
├── .env                  - [ignored] global app env variables
├── .env-example
├── package.json
├── package-lock.json
└── ...
```
