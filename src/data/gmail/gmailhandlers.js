import * as GmailFetch from './gmailfetch';


export function handleSyncMailBoxUnreadCount(auth, mailbox, forceFullSync) {
  // call out to google
  const label = mailbox.label;
  const messagesTotal = mailbox.messagesTotal
  GmailFetch.fetchMailBoxLabel(auth, label)
    .then(({ response }) => {
      // update model, decide if we changed
      return Promise.resolve({
        changed: forceFullSync || messagesTotal !== response.messagesTotal,
      })
    })
    .then(({ changed }) => {
      if (!changed) { return Promise.resolve() };
      return Promise.resolve()
        .then(() => {
          return GmailFetch.fetchThreadIds(auth, '')
        })
        .then(({ response }) => {
          // Step 2.3: find the changed threads
          const threads = response.threads || [];
          const currentThreadsIndex = mailbox.latestUnreadThreads.reduce((acc, thread) => {
            acc[thread.id] = thread
            return acc
          }, {})

          const changedThreads = threads.reduce((acc, thread) => {
            if (!currentThreadsIndex[thread.id]) {
              acc.push(thread)
            } else if (currentThreadsIndex[thread.id].historyId !== thread.historyId) {
              acc.push(thread)
            } else if ((currentThreadsIndex[thread.id].messages || []).length === 0) {
              acc.push(thread)
            }
            return acc
          }, [])

          return { threads: threads, changedThreads: changedThreads, resultSizeEstimate: response.resultSizeEstimate }
        })
    })
    .then(({threads, changedThreads, resultSizeEstimate}) => {
      if (changedThreads.length !== 0) {
        const changedIndexed = changedThreads.reduce((acc, thread) => {
          thread.messages = (thread.messages || []).map((message) => {
            return {
              id: message.id,
              threadId: message.threadId,
              historyId: message.historyId,
              internalDate: message.internalDate,
              snippet: message.snippet,
              labelIds: message.labelIds,
              payload: {
                headers: message.payload.headers.filter((header) => {
                  const name = header.name.toLowerCase()
                  return name === 'subject' || name === 'from' || name === 'to'
                })
              }
            }
          })
          acc[thread.id] = thread
          return acc
        }, {})
        return { threads: threads, changedIndex: changedIndexed }
      } else {
        return { threads: threads, changedIndex: {} }
      }
    })
}

