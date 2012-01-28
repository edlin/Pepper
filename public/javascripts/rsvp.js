/*jsl:option explicit*/
$(document).ready(function() {

  var previous = "",
    names = [],
    parties = [];

  $.ajax({
    type: 'POST',
    url: 'get_names',
    data: {},
    dataType: 'json',
    success: function(result) {
      names = result.data;
      parties = result.parties;
    }
  });

  // keyup on tab, submit, and enter
  $('#name_in').keydown(function(event) {
    switch (event.keyCode) {
      case 9: // tab
      case 13: // enter
        event.preventDefault();
        submit_name();
        break;
    }
  });

  $('#name_in').keyup(function(event) {
    var selected;
    switch (event.keyCode) {
      case 38: // up
        selected = $('.selected');
        if (selected.prev().length !== 0) {
          selected.removeClass('selected');
          selected.prev().addClass('selected');
        }
        break;
      case 40: // down
        selected = $('.selected');
        if (selected.next().length  !== 0) {
          selected.removeClass('selected');
          selected.next().addClass('selected');
        }
        break;
    }
  });

  $('#name_in').keyup(function(event) {
    // need to ignore certain values
    if ($.inArray(event.keyCode,[9, 13, 38, 40]) !== -1) {
      return;
    }
    var input = $(this).val(),
      matched = [],
      i,
      hints = $('#hints');
      hints.empty();

      if (input.length > 1) {
        var patt=new RegExp('^'+input+'| '+input,'i');
        for (i = 0; i < names.length; i++) {
          if (names[i].match(patt)) {
            matched.push(names[i]);
          }
        }

        var top = 0,
          guessElem;
        for (i = 0; i < matched.length; i++) {
          // create the new divs
          if (i === 0) {
            guessElem  = $('<div class="selected guess">');
          } else {
            guessElem  = $('<div class="guess">');
          }
          guessElem.html(matched[i]);
          guessElem.css('top', top);
          top += 26;
          hints.append(guessElem);
        }

        $('.guess').hover(function() {
          $('.guess').removeClass('selected');
          $(this).addClass('selected');
        }, function() {
        });

        $('.guess').click(function() {
          submit_name();
        });

      }
  });

  $('#submit').click(function(e) {
    e.preventDefault();
    submit_name();
  });

  var submit_name = function() {
    var selected = $('.selected');
    if ((selected.length === 0 && previous !== $('#name_in').val())) { //      len === 0 || previous !== name_in
      $('#error_box').html('Please try again');
      return;
    }

    var i = 0, 
      j, 
      matched = [], 
      input = selected.html() || previous, 
      accordion = $('#accordion'), 
      partyElem,
      leadElem,
      contentElem, 
      content = 'hello world', 
      link, 
      rsvpSelect,
      rsvpElem,
      notesElem,
      floatElem,
      submitElem,
      qElem,
      hashElem,
      notesHeaderElem;

    previous = input;

    $('#name_in').val(input);
    $('#hints').empty();
    $('#accordion').empty();
    $('#error_box').empty();

    for (i = 0; i < parties.length; i++) {
      if ( $.inArray(input, parties[i].people)!== -1) {
        if (parties[i].desc) {
          leadElem = '<h3><a href="#"><div class="name">' + input +'</div><div class="desc">'+parties[i].tag+' - '+parties[i].desc+'</div></a></h3>';
        } else {
          leadElem = '<h3><a href="#"><div class="name">' + input +'</div><div class="desc">'+parties[i].tag+'</div></a></h3>';
        }
        contentElem = '<form action="/rsvp" method="post">';
        if (parties[i].done) {
          contentElem += '<p>Seems like you have already registered.</p>';
          contentElem += '<p>Please contact david.marrying.hannah@gmail.com if this is incorrect.</p>';
        } else {
          /// other people in the party
          /// Rsvping for: # people
          /// notes: 
          /// submit
          var party_names = parties[i].people[0];
          for (j = 1; j < parties[i].people.length; j++) {
            party_names += ', '+parties[i].people[j];
          }   


          partyElem = '<div class="party" name="party">People in party: '+party_names+'</div>';        
          rsvpSelect = '<select name="count">';
          for (j = parties[i].count; j >= 0; j--) {
            rsvpSelect += '<option value='+j+'>'+j+'</option>';
          }
          rsvpSelect += '</select>';
          rsvpElem = '<div class="rsvp_count">RSVP-ing for '+rsvpSelect+' people.</div>';

          notesElem = '<div class="notes_box">';
          notesElem += '<textarea class="notes" name="notes" cols="66" rows="5"></textarea>';
          notesElem += '</div>';
          floatElem = '<div class="clear"></div>';
          submitElem = '<div class="submit_button">';
          submitElem += '<input type="submit" value="Submit">';
          submitElem += '</div>';
          qElem = '<input type="hidden" name="q", value="register">';
          hashElem = '<input type="hidden" name="hash", value="'+parties[i].hash+'">';
          notesHeaderElem = '<div class="notes_hdr">Additional Notes: <span> (e.g. Special Accomodations or Dietary Restrictions) </span></div>';

          contentElem += partyElem;
          contentElem += rsvpElem;
          contentElem += notesHeaderElem;
          contentElem += notesElem;
          contentElem += floatElem;
          contentElem += submitElem;
          contentElem += qElem;
          contentElem += hashElem;
        }

        contentElem += '</form>';
        accordion.append(leadElem+contentElem);
      }
    }
    $('.notes').keyup(function() {
      if($(this).val().length > 140) {
        $(this).val($(this).val().substring(0,140));
      }
    });

    $( "#accordion" ).accordion("destroy" );
    $("#accordion").accordion({active: "none", collapsible: true});      
  };

});
