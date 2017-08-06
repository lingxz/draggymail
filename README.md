# draggymail

Drag your emails around like in trello boards.

## Introduction

### What it is
- A kanban tool to organize your emails in Gmail
- An alternative way to read and manage emails, tailored to my taste and preferences
- A project for me to learn React and Redux concepts

### What it isn't
- Properly tested (yet)
- A complete replacement for Gmail

### What it does
- Pulls your emails from the gmail api
- Polls the Gmail API every 10 seconds for changes (might try to change this to use the google PubSub and add Socket.io)
- Uses your current gmail labels for the boards (so even if you don't use this app anymore, your email will still be organized in the proper labels)
- Stores the label IDs in the database
- Stores your emails in the redux store (which is stored in browser memory)

### What it does not do
- Create app specific gmail labels for you and force you to use them (like [DragApp](https://www.dragapp.com/) does)
- Store your emails or important information in the server (only your email address, refresh token, and a list of labels you designated as boards will be stored, for reference look in the [src/data](https://github.com/lingxz/gmail-kanban/tree/master/src/data) folder)
- Delete any of your emails permanently (the oauth permission scope does not include that), so if something screws up there will be no irreversible damage done...
- Do something fancy when you click archive, like put it into some app specific label (which I believe is what Sortd and DragApp does...). So when you click archive, it really is archiving, the Gmail way

Other apps that do almost the same thing: (to be fair, when I thought of making this, there were only two such products that do this: Sortd and Moo.do. I didn't like how the Sortd UI looked and at that time Moo.do Gmail integration was a premium feature.)
- [Moo.do](https://www.moo.do/)
- [Sortd](https://www.sortd.com/)
- [Yanado](https://yanado.com/)
- [DragApp](https://www.dragapp.com/)
- [GmailKanban](https://github.com/hyojin/GmailKanban)

### Technologies used
- React
- Redux
- Express
- Sequelize
- Sqlite database
- React-dnd
- A bunch of other libraries

## Run the app

This project was built from [React Starter Kit](https://github.com/kriasoft/react-starter-kit/), so full instructions on how to run, build, and deploy can be found in their [Getting Started docs](https://github.com/kriasoft/react-starter-kit/blob/master/docs/getting-started.md).

Basically, after cloning the app, you can install packages by running

```yarn install```

Then to run it locally in dev mode (with HMR and browsersync all loaded)

```yarn start```

To run it in production mode:

```yarn start -- --release```

To build:

```yarn build```

Or for production:

```yarn build -- --release```

## Todo
- Add editor to write emails
  - Save as draft when written halfway
  - Load contacts for easy auto complete when typing recipients
  - Encode and send emails with gmail api
- Bulk actions on emails (change labels, archive, trash)
- Implement batching for http requests (important!)
- Implement undo
- Keyboard shortcuts
- Email search
- Refactor css properly and potentially add color themes
- UNIT TESTS
