/*********************************************
Script file for GradeVisualizer.

This script contains functionality that will make GradeVisualizer able
to calculate a user's grades, as well as add/remove assignments, and
load/save their grades to the server.

*********************************************/

function main() {
  // Setup for facebook integration
  initFacebook();

  $('input[type=text]').change(updatePrediction);
  updatePrediction();
  $('.add-assignment').click(addNewAssignmentEvent);
  $('.remove-assignment').click(removeAssignment);

  $('.save-grades').click(saveGrades);
  $('.load-grades').click(loadGradesEvent);

  // Add some default assignments
  addNewAssignment("Homework 1");
  addNewAssignment("Homework 2");
  addNewAssignment("Homework 3");
  addNewAssignment("Midterm 1");
  addNewAssignment("Midterm 2");
  addNewAssignment("Final");
}


/*********************************************
Constants
*********************************************/
var SCORE = {
  EARNED: "earned",
  PROGRESS: "progress",
  LOST: "lost",
};

var SCORE_ROW = {
  NAME: 0,
  WEIGHT: 1,
  SCORE: 2,
};

/*********************************************
Global Definitions
*********************************************/
var g_nextAssignmentId = 0;

/*********************************************
Function/Object Definitions
*********************************************/

// Data structure used to hold Assignment data.
function Assignment(name, weight, score, id) {
  this.name = name;
  this.weight = weight;
  this.score = score;
  this.id = id;
  return this;
};


function calculateScores(assignments) {
  var scores = {};
  scores[SCORE.EARNED] = 0;
  scores[SCORE.PROGRESS] = 0;
  scores[SCORE.LOST] = 0;

  for (var i in assignments) {
    var assignment = assignments[i];
    var earned = assignment.weight * assignment.score / 100;
    // Ignore if user didn't specify weight
    if (assignment.weight !== null) {
      if (assignment.score !== null) {
        scores[SCORE.EARNED] += earned;
        scores[SCORE.LOST] += assignment.weight - earned;
      }
    }
  }
  scores[SCORE.PROGRESS] = (100 - scores[SCORE.EARNED]
    - scores[SCORE.LOST]);
  return scores;
}


function getAssignments(scoreTable) {
  var assignments = [];
  scoreTable.find('tr').each(function() {
    var inputs = $(this).find('input[type=text]');
    if (inputs.length && !$(this).hasClass('template')) {
      var weight = $(inputs[SCORE_ROW.WEIGHT]).val();
      weight = weight ? parseFloat(weight) : null;
      var score = $(inputs[SCORE_ROW.SCORE]).val();
      score = score ? parseFloat(score) : null;
      var id = $(this).find('.assignment-id').html();
      id = id ? parseInt(id) : null;
      assignments.push(new Assignment($(inputs[SCORE_ROW.NAME]).val(), weight,
        score, id));
    }
  });
  return assignments;
}


function scoreToGradeLetter(score) {
  if (score >= 90) {
    return 'A';
  } else if (score >= 80) {
    return 'B';
  } else if (score >= 70) {
    return 'C';
  } else if (score >= 60) {
    return 'D';
  }
  return 'F';
}


function displayPrediction(scores, predictionDiv) {
  // Update the progressbar to display the current values.
  for (var type in scores) {
    var bar = predictionDiv.find('.progress-bar.'+type);
    bar.html(
      // Fixed to 1 decimal point to not overwhelm the user with
      // unnecessary data.
      scores[type].toFixed(1))
      .css('display', (scores[type] > 0) ? 'block' : 'none')
      .css('width', scores[type]+'%');
  }

  // Update the letter grades
  // Expected score is a linear extrapolation of the student's past
  // performance. We take their average performance and expand it to
  // a scale of 100%.
  predictionDiv.find('.expected-score').html(scoreToGradeLetter(
    scores[SCORE.EARNED] / (scores[SCORE.EARNED] + scores[SCORE.LOST]) * 100));
  // Maximum score assumes the student gets 100% on remaining
  // assignments.
  predictionDiv.find('.maximum-score').html(scoreToGradeLetter(
    100 - scores[SCORE.LOST]));
  // Median score assumes the student gets 50% on remaining assignments.
  predictionDiv.find('.median-score').html(scoreToGradeLetter(
    scores[SCORE.EARNED] + 0.5 * scores[SCORE.PROGRESS]));
  // Minimum score assumes the student gets 0% on remaining assignments.
  predictionDiv.find('.minimum-score').html(scoreToGradeLetter(
    scores[SCORE.EARNED]));
}


function saveGrades() {
  var classname = $('.class-name').val();
  var classidstr = $('.class-id').html();
  // When classidstr is not yet set, the DOM will have it set to "".
  // Trying to parseInt will give NaN and break the backend.
  var classid = (classidstr) ? parseInt(classidstr) : null;
  var assignments = getAssignments($('table.score'));
  $.ajax({
    type: 'POST',
    url: './save/',
    data: {
      classname: classname,
      classid: classid,
      assignments: assignments,
    }
  }).success(function(data, status, jqXHR) {
    // The server will return to us a class id.
    var classid = parseInt(data);
    $('.current.class-id').html(classid);

    // Update the load-grade entry with the new name
    var load_grade_links = $('.load-grades .class-id');
    for (var i = 0; i < load_grade_links.length; ++i) {
      var grade_link = $(load_grade_links[i]);
      if (parseInt(grade_link.html()) == classid) {
        grade_link.parent().find('.class-name').html(classname);
        break;
      }
    }
  });
}


// This is called by facebook when their SDK is fully loaded.
function initFacebook() {
  (function (d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));

  // Here we run a very simple test of the Graph API after login is successful.
  // This testAPI() function is only called in those cases.
  function testAPI() {
    FB.api('/me', function(response) {
      showClasses(response.id);
    });
  }

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '189336231272827',
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
    // for any authentication related change, such as login, logout or session refresh. This means that
    // whenever someone who was previously logged out tries to log in again, the correct case below
    // will be handled.
    FB.Event.subscribe('auth.authResponseChange', function(response) {
      // Here we specify what we do with the response anytime this event occurs.
      if (response.status === 'connected') {
        // The response object is returned with a status field that lets the app know the current
        // login status of the person. In this case, we're handling the situation where they
        // have logged in to the app.
        testAPI();
      } else if (response.status === 'not_authorized') {
        // In this case, the person is logged into Facebook, but not into the app, so we call
        // FB.login() to prompt them to do so.
        // In real-life usage, you wouldn't want to immediately prompt someone to login
        // like this, for two reasons:
        // (1) JavaScript created popup windows are blocked by most browsers unless they
        // result from direct interaction from people using the app (such as a mouse click)
        // (2) it is a bad experience to be continually prompted to login upon page load.
        FB.login();
      } else {
        // In this case, the person is not logged into Facebook, so we call the login()
        // function to prompt them to do so. Note that at this stage there is no indication
        // of whether they are logged into the app. If they aren't then they'll see the Login
        // dialog right after they log in to Facebook.
        // The same caveats as above apply to the FB.login() call here.
        FB.login();
      }
    });
  };
}

function loadGradesEvent() {
  var classid = parseInt($(this).find('.class-id').html());
  if (!isNaN(classid)) {
    loadGrades(classid);
  }
  return false;
}

function loadGrades(classid) {
  $.ajax({
    url: './load/',
    dataType: 'json',
    data: {
      classid: classid,
    }
  }).success(function(data, status, jqXHR) {
    var classname = data['classname'];
    var assignments = data['assignments'];

    $('.current.class-name').val(classname);
    $('.current.class-id').html(classid);
    $('tr:not(.template) td .remove-assignment').click();
    for (var i in assignments) {
      var assignment = assignments[i];
      addNewAssignment(assignment.name, assignment.weight, assignment.score, assignment.id);
    }
  });
}

function showClasses(u_id) {
  $.ajax({
    url: './classes/',
    dataType: 'json',
    data: {
      u_id: u_id
    }
  }).success(function(classes, status, jqXHR) {
    var classlist = $('.class-list');
    $('li.load-grades:not(.template)').remove();

    for (var i in classes) {
      var classLink = $('.load-grades.template').clone();
      classLink.find('.class-name').html(classes[i].name.length ? classes[i].name : "Untitled");
      classLink.find('.class-id').html(classes[i].id);
      classLink.removeClass('template');
      classLink.click(loadGradesEvent);
      classlist.append(classLink);
    }

    if (classes.length == 0) {
      var classLink = $('.load-grades.template').clone();
      classLink.find('.class-name').html("No classes found! Save a class to populate this list.");
      classLink.removeClass('template')
        .addClass('disabled')
        .click(loadGradesEvent);
      classlist.append(classLink);
    }
  })
}

// Wrapper around addNewAssignmentEvent so that the jQuery click
// event object isn't passed onto addNewAssignment.
function addNewAssignmentEvent() {
  addNewAssignment();
}

function addNewAssignment(name, weight, score, id) {
  // The template exists in the HTML file, so that we don't have to
  // build the assignment row from scratch. This is more readable!
  var assignmentRow = $('tr.template').clone();
  assignmentRow.removeClass('template');

  var inputs = assignmentRow.find('input[type=text]');
  inputs.change(updatePrediction);

  $(inputs.get(0)).val(name);
  $(inputs.get(1)).val(weight);
  $(inputs.get(2)).val(score);

  if (id === undefined || id === null || id == "") {
    id = g_nextAssignmentId++;
  }
  assignmentRow.find('.assignment-id').html(id);

  assignmentRow.find('.remove-assignment').click(removeAssignment);

  // The last child of the table body is the "Add new Assignment"
  // button, and we definitely want the assignment to come before
  // that.
  $('table.score tbody tr:last-child').before(assignmentRow);

  // The user probably wants to start changing the assignment details
  // if name wasn't specified
  if (!name || !name.length) {
    assignmentRow.find('td:first-child input[type=text]').focus();
  }
}

function updatePrediction() {
  var assignments = getAssignments($('table.score'));
  var scores = calculateScores(assignments);
  displayPrediction(scores, $(".prediction"));
}

// Event handler to remove an assignment row from its owning table.
function removeAssignment() {
  // Go up the DOM tree to find the table row
  // table -> tbody -> tr -> td -> input(remove button)
  $(this).parent().parent().remove();
  updatePrediction();
}


$(main)