var setSong = function(songNumber) {
	currentlyPlayingSongNumber = ParseInt(songNumber);
	currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'	// allows access to the data held in the attribute using DOM methods when the mouse leaves the table row, and the song number's table cell returns to its original state
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + songLength + '</td>'
      + '</tr>'
      ;

    var $row = $(template);

    var clickHandler = function() {
        // parseInt() function to convert song number references to integers
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            // revert to song number for currently playing song because user started playing new song
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            // switch from Play -> Pause button to indicate new song is playing
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updateSeekBarWhileSongPlays();
            updatePlayerBarSong();

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                // switch from Pause -> Play button to pause currently playing song
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };

    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        // parseInt() function to convert song number references to integers
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };

    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        // parseInt() function to convert song number references to integers
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
    };

    // call find() here to find the element with the .song-item-number class that's contained in whichever row is clicked
		// jQuery's click event listener executes the callback passed to it when the target element is clicked
    $row.find('.song-item-number').click(clickHandler);
    // first argument is a callback that executes when the user mouses over the $row element and the second is a callback executed when the mouse leaves $row
    $row.hover(onHover, offHover);
    // return $row, which is created with the event listeners attached
    return $row;
};

var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }

  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  // assign a new Buzz sound object and pass the audio file via the audioUrl property on the currentSongFromAlbum object
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    // pass in a settings object that has two properties defined, formats and preload
    formats: [ 'mp3' ], // an array of strings with acceptable audio formats and include the 'mp3' string because all of the songs are mp3s
    preload: true // tells Buzz to load the mp3s as soon as the page loads
  });
  setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;

  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  // call jQuery's text() method to replace the content of the text nodes
  $albumTitle.text(album.name);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  // jQuery's attr() method changes the element attribute using the same arguments
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (i = 0; i < album.songs.length; i++) {
    var $newRow= createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
    $albumSongList.append($newRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    // bind() the timeupdate event to currentSoundFile
    currentSoundFile.bind('timeupdate', function(event) {	// timeupdate is a custom Buzz event that fires repeatedly while time elapses during song playback
      // getTime() method to get the current time of the song and the getDuration() method for getting the total length of the song
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  // use the built-in JavaScript Math.max() function to make sure the percentage isn't less than zero and the Math.min() function to make sure it doesn't exceed 100
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  // convert the percentage to a string and add the % character
	// when the width of the .fill class and the left value of the .thumb class is set, the CSS interprets the value as a percent instead of a unit-less number between 0 and 100
  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    // use jQuery to find all elements in the DOM with a class of "seek-bar" that are contained within the element with a class of "player-bar"
    var $seekBars = $('.player-bar .seek-bar');	// will return a jQuery wrapped array containing both the song seek control and the volume control

    $seekBars.click(function(event) {
        // a jQuery-specific event value, which holds the X (or horizontal) coordinate at which the event occurred
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // divide offsetX by the width of the entire bar to calculate  seekBarFillRatio
        var seekBarFillRatio = offsetX / barWidth;
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }
        // pass $(this) as the $seekBar argument and seekBarFillRatio for its eponymous argument to updateSeekBarPercentage()
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    // find elements with a class of .thumb inside our $seekBars and add an event listener for the mousedown event
    $seekBars.find('.thumb').mousedown(function(event) {	// mousedown event will fire as soon as the mouse button is pressed down
        var $seekBar = $(this).parent();
        // bind() takes a string of an event instead of wrapping the event in a method
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        // bind the mouseup event with a .thumb namespace
        $(document).bind('mouseup.thumb', function() {
            // unbind() event method removes the previous event listeners that we just added
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
 };

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.name);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);

  $('.main-controls .play-pause').html(playerBarPauseButton);
};

// match the currently playing song's object with its corresponding index in the songs array
var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // incrementing the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // decrementing the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var togglePlayFromPlayerbar = function() {
  var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
  if (currentSoundFile.isPaused()) {
    $currentlyPlayingCell.html(pauseButtonTemplate);
    $(this).html(playerBarPauseButton);
    currentSoundFile.play();
  } else if (currentSoundFile) {
    $currentlyPlayingCell.html(playButtonTemplate);
    $(this).html(playerBarPlayButton);
    currentSoundFile.pause();
  }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// set of variables in the global scope that hold current song and album information
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerbar);
});
