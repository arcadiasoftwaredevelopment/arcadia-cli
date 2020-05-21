<p align="center"><img width="100" src="https://i.imgur.com/jkzSrTC.png" alt="Arcadia Software Development logo"></p>

<p align="center">
  <a href="https://app.circleci.com/pipelines/github/arcadiasoftwaredevelopment/create-arcadia-project?branch=master"><img src="https://img.shields.io/circleci/build/github/arcadiasoftwaredevelopment/create-arcadia-project/master.svg?sanitize=true" alt="Build Status"></a>
  <a href="https://codecov.io/gh/arcadiasoftwaredevelopment/create-arcadia-project?branch=master"><img src="https://codecov.io/gh/arcadiasoftwaredevelopment/create-arcadia-project/branch/master/graph/badge.svg" alt="Coverage Status" /></a>
  <a href="https://www.npmjs.com/package/@arcadiasoftwaredevelopment/create-arcadia-project"><img src="https://img.shields.io/npm/v/%40arcadiasoftwaredevelopment%2Fcreate-arcadia-project.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/@arcadiasoftwaredevelopment/create-arcadia-project"><img src="https://img.shields.io/npm/l/%40arcadiasoftwaredevelopment%2Fcreate-arcadia-project.svg?sanitize=true" alt="License"></a>
</p>

# create-arcadia-project
The command line tool that is used to create project and increase productivity for Arcadia Software Development company.

## Installation and Usage

    npm i @arcadiasoftwaredevelopment/create-arcadia-project -g

**Login to Bitbucket**

    create-arcadia-project login

**List all available project templates**

    create-arcadia-project template --list
**Clean-up downloaded project templates from your local storage**

    create-arcadia-project template --clean
**Create new project**

    create-arcadia-project new --template <TEMPLATE_NAME> --project <PROJECT_NAME> --database <DATABASE_NAME>

