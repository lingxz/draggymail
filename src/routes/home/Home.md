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
- Do something fancy when you click archive, like put it into some app specific label (which I believe is what Sortd and DragApp does...). So when you click archive, it really is archiving, the Gmail way.

Other apps that do almost the same thing: (to be fair, when I thought of making this, there were only two such products that do this: Sortd and Moo.do. I didn't like how the Sortd UI looked and at that time Moo.do Gmail integration was a premium feature.)
- [Moo.do](https://www.moo.do/)
- [Sortd](https://www.sortd.com/)
- [Yanado](https://yanado.com/)
- [DragApp](https://www.dragapp.com/)
- [GmailKanban](https://github.com/hyojin/GmailKanban)


Code on GitHub. PRs welcome!


<a class="github-button" href="https://github.com/lingxz/draggymail" data-size="large" data-show-count="true" aria-label="Star ntkme/github-buttons on GitHub">Star</a>  <a class="github-button" href="https://github.com/lingxz/draggymail/fork" data-icon="octicon-repo-forked" data-size="large" data-show-count="true" aria-label="Fork ntkme/github-buttons on GitHub">Fork</a>
