# Faux - batteries included TypeScript Express starter

Features:
* Model-View-Service-Controller pattern
* Password and token authentication
* MongoDB singleton
* Backend template rendering via eta.js

## Getting Started
> Neat, but how do I use this?

Neat indeed, and getting started is pretty easy! Each page is treated as its own module - if you take a peak into `src/core/pages` you can see some examples of what that looks like. 

These pages follow the below file structure:
```
page
  └─── controllers      # controllers for the page
  └─── jobs             # CRON jobs for the page
  └─── models           # database models for the page 
  └─── services         # the service contracts for the page 
  └─── views            # root frontend folder for the page
      │─── styles       # scss files for the page
      │─── tempaltes    # eta templates for the page
```

The rough flow of how things look is:
- client makes a request
- router looks for controller matching request
- controller calls service contract which executes our business logic
- service contract optionally calls any models it needs to prepare data
- service contract renders our view with our data and sends it back to the controller
- controller sends back response 
- client sees page 😎

The goal is to have a largely decoupled core that can then be abstracted out into these page modules, to keep things clean and predictable

### If pages are isolated modules, how do shared resources work?
#### **Backend**
The way we have things setup right now is that any shared module should be added to the `core` as a `core module`. An example of this is our `authentication` module, which handles all things authentication - including:
- controllers we can call (login, register, token auth, etc)
- services it needs (ex for token generation)
- models
- etc

If you need something that will be used for multiple different pages, ideally it too gets added as a `core module` and has a generic access method so that it isn't too coupled to the project

#### **Frontend**
Shared frontend components, ex generic templates or styles, can be added to the root `pages/_components` directory

### How does frontend compilation work?
If you take a peak at our `BuildTaskRunner`, you can see how we find all SCSS, static content, and ETA templates and compile them. The TL;DR is that we `glob` and `watch` folders and anytime we detect a change, we compile it out and ship it to `dist/` folder

If you run via `npm run devel` or via the docker image, this is handled for you - so you just need to run that to hit the ground running

## Running
### Docker based envrionment
Run:
```
docker compose up -d
```

To tail nodejs:
```
docker logs nodejs -f
```

### Non docker based development:
```
npm run devel
```

For linting:
```
npm run lint
```

## Style guide
All functions will have a `DocBlock` to describe its purpose
```js
/**
* Short function description
*/
function name () {
  ...
}
```

All functions will be static typed
```js
/**
* Print name and age to console
*/
function name (name: string, age: number): void {
  console.log(name, age)
}
```

All functions will have full docblocks (for API generation and editor hints)
```js
/**
* Print name and age to console
* 
* @param {string} name the users name
* @param {number} age the users age
* @returns {void}
*/
function name (name: string, age: number): void {
  console.log(name, age)
}
```

Filenames to match class names
```js
// GetCoffee.ts
export class GetCoffee {
  ...
}
```
