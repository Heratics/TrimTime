function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[\s\_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-|-$|/g, '');
}

module.exports = slugify;
