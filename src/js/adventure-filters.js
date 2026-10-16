(function () {
  'use strict';

  var grid = document.getElementById('featured-adventure-grid');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-adventure-card]'));
  var destination = document.getElementById('trip-destination');
  var activity = document.getElementById('trip-activity');
  var difficulty = document.getElementById('trip-difficulty');
  var count = document.getElementById('trip-filter-count');
  var reset = document.getElementById('trip-filter-reset');
  if (!destination || !activity || !difficulty || !count || !reset) return;

  function applyFilters() {
    var visible = 0;
    cards.forEach(function (card) {
      var matches = (destination.value === 'all' || card.dataset.destination === destination.value) &&
        (activity.value === 'all' || card.dataset.activity === activity.value) &&
        (difficulty.value === 'all' || card.dataset.difficulty === difficulty.value);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = visible
      ? 'Showing ' + visible + ' featured adventure' + (visible === 1 ? '' : 's')
      : 'No trips match those filters. Clear a filter or contact our team for advice.';
  }

  [destination, activity, difficulty].forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  reset.addEventListener('click', function () {
    destination.value = 'all';
    activity.value = 'all';
    difficulty.value = 'all';
    applyFilters();
    destination.focus();
  });
})();
