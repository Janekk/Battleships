module.exports = {
  isElementChildOf(c, p) {
    while ((c = c.parentNode) && c !== p);
    return !!c
  }
}
