# Roll Initiative

This is an attempt to identify effective tech stacks for building dynamic websites, and making as many apples-to-apples comparisons between frameworks and approaches by building the same application that runs against the same API in a variety of ways.

## Project Structure

This project makes use of [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) to simplify managing dependencies and running individual applications. Rather than needing to change directories to run scripts for individual applications, all commands should be set up to run from the project root like so:

```sh
# install dependencies for all projects
npm install

# start the Next.js app in production mode
npm run start:next

# start the Next.js app in development mode
npm run dev:next

# test the Next.js app
npm run test:next
```

When adding a new application, set it up in the `apps` folder with a name that describes the tech stack, such as `apps/next` or `app/11ty`. Then, update the root `package.json` so its `workspaces` field includes the new application, like so:

```json
"workspaces": [
  "apps/api",
  "apps/next",
  "apps/11ty"
]
```

For any application-specific npm scripts that exist, they should be mapped to the project root `package.json` in its `scripts` field, like so:

```json
"scripts": {
  "start": "npm start -w apps/api",
  "dev": "npm run dev -w apps/api",
  "test": "npm run test -w apps/api",
  "start:next": "npm start & npm start -w apps/next",
  "dev:next": "npm run dev & npm run dev -w apps/next",
  "test:next": "npm run test -w apps/next",
  "start:11ty": "npm start & npm start -w apps/11ty",
  "dev:11ty": "npm run dev & npm run dev -w apps/11ty",
  "test:11ty": "npm run test -w apps/11ty"
}
```

The `-w` flag will pass the command through to the specified app, so its npm script runs. For scripts where the API needs to be running, prepend the script with `npm start & ` or `npm run dev & ` so the API will run in parallel.

## To Do

- [ ] Set up first application
- [ ] Set up E2E testing for first application
- [ ] Set up another application
- [ ] Universalize E2E testing to run identically for each application
