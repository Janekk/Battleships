module.exports = {
  isElementChildOf(c, p) {
    while ((c = c.parentNode) && c !== p);
    return !!c
  },

  addDoubleTapEvent(elem, speed, distance) {
    if (!('ontouchstart' in elem)) {
      // non-touch has native dblclick and no need for polyfill
      return;
    }

    // default dblclick speed to half sec
    speed = Math.abs(+speed) || 500;//ms
    // default dblclick distance to within 40x40 area
    distance = Math.abs(+distance) || 40;//px

    var taps, x, y,
      reset = function () {
        // reset state
        taps = 0;
        x = NaN;
        y = NaN;
      };

    reset();

    elem.addEventListener('touchstart', function (e) {
      var touch = e.changedTouches[0] || {},
        oldX = x,
        oldY = y;

      taps++;
      x = +touch.pageX || +touch.clientX || +touch.screenX;
      y = +touch.pageY || +touch.clientY || +touch.screenY;

      // NaN will always be false
      if (Math.abs(oldX - x) < distance &&
        Math.abs(oldY - y) < distance) {

        // fire dblclick event
        var e2 = document.createEvent('MouseEvents');
        if (e2.initMouseEvent) {
          e2.initMouseEvent(
            'dblclick',
            true,                   // dblclick bubbles
            true,                   // dblclick cancelable
            e.view,                 // copy view
            taps,                   // click count
            touch.screenX,          // copy coordinates
            touch.screenY,
            touch.clientX,
            touch.clientY,
            e.ctrlKey,              // copy key modifiers
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,               // copy button 0: left, 1: middle, 2: right
            touch.target);          // copy target
        }
        elem.dispatchEvent(e2);
      }

      setTimeout(reset, speed);

    }, false);

    elem.addEventListener('touchmove', function (e) {
      reset();
    }, false);
  }
}
