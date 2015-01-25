var pubsub = function(l, u, r, i) {
  return function(n, f) {
    r = l[n] = l[n] || [], i = -1;
    if (f && f.call) r.push(f);
    else while (r[++i]) r[i].apply(u, arguments);
  }
}({});

module.exports = pubsub;
