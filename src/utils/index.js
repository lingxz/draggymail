export function parseEmailHeader(header) {
  const extract = { name: "", email: "" };
  const emails = header.match(/[^@<\s]+@[^@\s>]+/g);
  if (emails) {
    extract.email = emails[0];
  }
  const names = header.split(/\s+/);

  if (names.length > 1) {
    names.pop();
    extract.name = names.join(" ").replace(/"/g, "");
  }
  return extract;
}

export function parseEmailHeadersTo(header) {
  let receiverEmails = header.match(/[^@<\s]+@[^@\s>]+/g);

  const splitIndices = [];
  for (var i = 0; i < receiverEmails.length; i++) {
    const receiver = receiverEmails[i];
    const idx = header.indexOf(receiver);
    if (header[idx + receiver.length + 1] === ',') {
      splitIndices.push(idx + receiver.length + 1)
    } else {
      splitIndices.push(idx + receiver.length + 2)
    }
  }

  const parts = []
  for (var sindex = 0; sindex < splitIndices.length; sindex++) {
    let splitIndex = splitIndices[sindex];
    let prev = 0;
    if (sindex !== 0) {
      prev = splitIndices[sindex-1];
    }
    let part = header.substr(prev, splitIndex)
    console.log(part);
    if (part[0] === ',') {
      parts.push(part.substring(2))
    } else {
      parts.push(part);
    }
  }

  const recipientsList = [];
  const recipientsListPrintable = [];
  for (var i = 0; i < parts.length; i++) {
    let parsedObj = parseEmailHeader(parts[i])
    if (parsedObj.name || parsedObj.email) {
      if (parsedObj.name) {
        const names = parsedObj.name.split(',')
        if (names.length > 1) {
          recipientsListPrintable.push(names[1])
        } else {
          recipientsListPrintable.push(names[0])
        }
      } else {
        recipientsListPrintable.push(parsedObj.email)
      }
      recipientsList.push(parsedObj);
    }
  }
  return { recipientsList, recipientsListPrintable }
}

