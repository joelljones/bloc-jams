var buildCollectionItemTemplate = function() {
  var template =
    '<div class="collection-album-container column fourth">'
  + '  <img src="assets/images/album_covers/01.png"/>'
  + '  <div class="collection-album-info caption">'
  + '    <p>'
  + '      <a class="album-name" href="album.html">The Colors</a>'
  + '      <br/>'
  + '      <a href="album.html">Pablo Picasso</a>'
  + '      <br/>'
  + '      X songs'
  + '      <br/>'
  + '    </p>'
  + '  </div>'
  + '</div>'
  ;

  // this function returns the markup string as a jQuery object, which we'll call a jQuery template
  return $(template);
};

$(window).load(function() {
  var $collectionContainer = $('.album-covers');
  // empty() method empties, or removes, any text or other elements from the element(s) it is called on
  $collectionContainer.empty();
  for (var i = 0; i < 12; i++) {
    var $newThumbnail = buildCollectionItemTemplate();
    // with each loop, append the template content to the collection container
    $collectionContainer.append($newThumbnail);
  }
});
