/*********************************************
Script file for GradeVisualizer.

This script contains functionality that will make GradeVisualizer able
to calculate a user's grades, as well as add/remove assignments, and
load/save their grades to the server.

*********************************************/

function main() {
  function updatePrediction() {
    var assignments = getAssignments($('table.score'));
    var scores = calculateScores(assignments);
    displayPrediction(scores, $(".prediction"));
  }

  $('input[type=text]').change(updatePrediction);
  updatePrediction();
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
function Assignment(name, weight, score) {
  this.name = name;
  this.weight = weight;
  this.score = score;
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
      // If user didn't specify score, treat it as in-progress.
      if (assignment.score !== null) {
        scores[SCORE.EARNED] += earned;
        scores[SCORE.LOST] += assignment.weight - earned;
      } else {
        scores[SCORE.PROGRESS] += assignment.weight;
      }
    }
  }
  return scores;
}


function getAssignments(scoreTable) {
  var assignments = [];
  scoreTable.find('tr').each(function() {
    var inputs = $(this).find('input[type=text]');
    if (inputs.length) {
      var weight = $(inputs[SCORE_ROW.WEIGHT]).val();
      weight = weight ? parseFloat(weight) : null;
      var score = $(inputs[SCORE_ROW.SCORE]).val();
      score = score ? parseFloat(score) : null;
      assignments.push(new Assignment($(inputs[SCORE_ROW.NAME]).val(), weight,
        score));
    }
  });
  return assignments;
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
}

$(main)