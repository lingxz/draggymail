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
  const receivers = header.split(",");
  const recipientsList = [];
  const recipientsListPrintable = [];
  for (var i = 0; i < receivers.length; i++) {
    let parsedObj = parseEmailHeader(receivers[i])
    recipientsList.push(parsedObj);
    if (parsedObj.name || parsedObj.email) {
      if (parsedObj.name) {
        recipientsListPrintable.push(parsedObj.name)
      } else {
        recipientsListPrintable.push(parsedObj.email)
      }
      recipientsList.push(parsedObj);
    }
  }
  return { recipientsList, recipientsListPrintable }
}

