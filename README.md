different-ng-env
================

Angular environments requires multiple files for each environment you would eventually want to deploy it to and these files are required to be commited to the source control system of choice. This makes it difficult to keep private things like api keys, private paths of hashes in case of widely distributed projects.  

On top of that most automation engineers would like to avoid editing directly the typescript files mentioned before and would preffer to just supply environment variable.

Taking advantage of the wide spread usage of dotenv this helper tool will clear away your existing main/production environments file, ignore it for versioning (if using git, sorry SVN users), read only the environment variables you need and create a typescript file to be used by the Angular build script.
# Usage
<!-- usage -->
Installation
```sh-session
$ npm i different-ng-env
$ ng-env
```

Define in `.env.example` the environment variables you want available to your Angular runtime, for example
```
ENV = DEV
URL = "localhost:8080"
```

<!-- usagestop -->
# Commands
<!-- commands -->
The `-y` flag will look for a `.env.example` file, if none is found will create an empty one. It will also remove `./src/environments` folder from git versioning and add it to `.gitignore`
```sh-session
$ ng-env -y
```
<!-- commandsstop -->
