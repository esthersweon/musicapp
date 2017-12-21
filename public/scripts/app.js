console.log("Sanity Check: JS is working!");

$(document).ready(function(){
  console.log("Document loaded");

  $.ajax({
    method: 'GET',
    url: '/api/moods',
    success: onGetSuccess,
    error: onError
  });


  $(document).on('click', 'div.mood', function(e) { //displays the content of one mood the user clicked on
      $.ajax({
        method: 'GET',
        url: '/api/moods/'+$(this).attr('data-id'),
        success: onGetOneSuccess,
        error: onError
      });
    });

  // add new mood
  $('#addMoodButton').on('click', function(e) {
    $('#addMoodModal').modal(); //triggers modal to add new mood
      $('form').on('submit', function(e) {
        let formData = $(this).serialize();
        $.ajax({
          method: 'POST',
          url: '/api/moods',
          data: formData,
          success: onPostOneSuccess,
          error: onError
      });
    });
  });

  $(document).on('click','#addSongButton', function(e) {
    $('#addSongModal').modal(); //triggers modal to add a new song
    console.log("Song modal open!")
    let moodId = $(this).data('mood-id');
    console.log(moodId);
    $('form').on('submit', function(e) {
      e.preventDefault();
      $.ajax({
        method: 'POST',
        url: '/api/moods/'+moodId+'/songs',
        data: $('form').serialize(),
        success: onPostSongSuccess,
        error: onError
    });
  });
  });

  // edit notes on a song 
  $(document).on('click', '.edit', function(e) {
    e.preventDefault();
    console.log("edit button clicked");
    $(".editSpace").show();
    let songId = $(this).data('song-id');
    let moodId = $(this).data('mood-id');
    let reqUrl = ('/api/moods/' + moodId + '/songs/' + songId); 

    $(document).on('click','.editSave', function(e){
      let editVal = $("textarea#editNotes").html();
      console.log("here is the text", editVal);
      $.ajax({
        method: "PUT", 
        url: reqUrl, 
        success: function(data) {
          displayMood(data);
        },
        error: onError
      });
    });
  });

  //delete a song on click of X button
  $(document).on('click', '.delete', function(e) {
    e.preventDefault();
    let songId = $(this).data('song-id');
    let moodId = $(this).data('mood-id');
    let reqUrl = ('/api/moods/' + moodId + '/songs/' + songId );
    $.ajax({
      method: 'DELETE',
      url: reqUrl,
      success: function(data) {
        displayMood(data);
      },
      error: onError
    });
  });



  function renderMoodButton(mood) {
    let moodSelections = `<div class="col-2 mood" data-id=${mood._id} style="background-color:${mood.color}">${mood.name}</div>`
    $(".mood-selection").prepend(moodSelections);
  };

  function changeMoodBackground(mood) {
    let moodColor = mood.color;
    $(".current-mood").css("background-color", moodColor);
  }

  function displayAccordionContent(mood) {
      $("#songsAccordion").empty();
      let songsList = mood.songs;
        for (let i = 0; i < songsList.length; i++) {
          let songId = songsList[i]._id;
          let songName = songsList[i].name;
          let songArtist = songsList[i].artist;
          let songUrl = songsList[i].url;
          let songNotes = songsList[i].notes;
          let accordionHtml = `<div class="item" data-song-id=${songId}>
            <a data-toggle="collapse" data-parent="#songsAccordion" href="#songAccordion${i+1}" aria-expanded="false" aria-controls="songAccordion${i+1}">
              "${songName}" by ${songArtist}
            </a>

            <div id="songAccordion${i+1}" class="collapse" role="tabpanel">
              <div><iframe width="50%" height="300" scrolling="no" frameborder="no" src="${songUrl}&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe></div>

              <p class="mb-3">${songNotes}</p>
              <div class="form-group col-md-6 editSpace" style="display: none">
                <label for="editNotes">Notes:</label>
                <textarea class="form-control" id="editNotes" rows="3" name="notes"></textarea>
                  <button type="button" class="btn btn-light editSave">Save</button>
              </div>
              <button type="button" data-song-id=${songId} data-mood-id=${mood._id} class="btn btn-light edit"><i class="far fa-edit"></i></button>
              <button type="button" data-song-id=${songId} data-mood-id=${mood._id} class="btn btn-dark delete"><i class="fas fa-times"></i></button>
            </div>
          </div>`
          $("#songsAccordion").append(accordionHtml);
        };
  };

  function displayMood(mood) {
    let $currentMood = $(".current-mood");
    $currentMood.empty();
    let titleContent = `<div class="row" data-mood-id=${mood._id}>
        <div class="col-md-6 mood-title"><h1>${mood.name}</h1></div>
        <div class="col-md-6 mood-title"><p>${mood.description}</p></div>
      </div>
      <div class="col-md-6 mood-title"><h3>SONGS</h3></div>`
    let accordionDiv = `<div class="col-md-12" id="songsAccordion" data-children=".item"></div>`
    let addSongButton = `<div class="col-md-12"><button type="button" data-mood-id=${mood._id} id="addSongButton"class="btn btn-light"><i class="fas fa-plus"></i></button></div>`
      $currentMood.append(titleContent);
      $currentMood.append(accordionDiv);
      displayAccordionContent(mood);
      $currentMood.append(addSongButton);
  };

  function onGetSuccess(moodsData) {
    console.log(moodsData);
    moodsData.forEach(function(mood) {
      renderMoodButton(mood);
    });
  };

  function onGetOneSuccess(oneMood) {
    changeMoodBackground(oneMood);
    displayMood(oneMood);
  };

  function onPostOneSuccess(postedSong) {
    renderMoodButton(postedSong);
    onGetOneSuccess(postedSong);
  };

  function onPostSongSuccess(postedSong) {
    console.log(postedSong);
    displayAccordionContent(postedSong);
  };

  function onError(err) {
    console.log("There was an error ", err);
  };


}); //document ready end
