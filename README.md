# Faux

> ⚠️ This project is still very much Work in Progress 🚧

## Preamble
In my spare time I have been creating a batteries included web framework in NodeJS using Fastify, with its core focuses being speed, modularity and extendability. 

The framework comes equipped with server-side rendering (SSR) support using the blazing fast art-templates project (similar to EJS), as well as a database driver with built in (optional) caching using Redis (or Dragonfly). 

This project is coming out of a common need from projects that I have created over the last several years, and aims to be hyper performant while also getting out of your way to allow you to focus on the things that you do best - develop.

The current state of the project is in alpha, but is usable and is already being used in some of my projects - including in GodotAssetLibrary, which is implementing a precursor of this project.

In the future I plan to add the ability to wrap around existing Node software(s) to act as an API bridge or interface, providing a seamless developer experience between the projects - but this is much longer term.

As a big advocate of open source, this project is being developed under the very permissive MIT license.

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

## Code guide
* Models can (and should!) throw errors
* Following TS Standard (as best as resonably possible)
