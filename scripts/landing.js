var animatePoints = function() {
  var revealPoint = function() {
    // $(this) references a different .point element each time jQuery executes the revealPoint() callback
    $(this).css({
      opacity: 1,
      transform: 'scaleX(1) translateY(0)'
    });
  };

  // $.each() function iterates over each .point element and executes the callback function, revealPoint
  $.each($('.point'), revealPoint);
};

$(window).load(function() {
  // since no arguments are passed to the function, we get the object's height
  if ($(window).height() > 950) {
    animatePoints();
  }

  // since no arguments are passed to the function, we get the object's height
  var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;

  // jQuery's scroll() "method" is still an event handler, but the jQuery wrapper obscures the appearance of events. when the window scrolls, the function executes
  $(window).scroll(function(event) {
    if ($(window).scrollTop() >= scrollDistance) {
      animatePoints();
    }
  });
});
