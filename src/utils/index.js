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
