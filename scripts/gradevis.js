/*********************************************
Script file for GradeVisualizer.

This script contains functionality that will make GradeVisualizer able
to calculate a user's grades, as well as add/remove assignments, and
load/save their grades to the server.

*********************************************/

function main() {
  var nextAssignmentId = 0;
  function updatePrediction() {
    var assignments = getAssignments($('table.score'));
    var scores = calculateScores(assignments);
    displayPrediction(scores, $(".prediction"));
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
      id = nextAssignmentId++;
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

  // Event handler to remove an assignment row from its owning table.
  function removeAssignment() {
    // Go up the DOM tree to find the table row
    // table -> tbody -> tr -> td -> input(remove button)
    $(this).parent().parent().remove();
    updatePrediction();
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
  });
}


$(main)