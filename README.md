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

