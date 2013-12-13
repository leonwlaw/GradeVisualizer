<?php
require_once('./backend/db.php');

function getClassList($u_id) {
  $mysqli = connect_to_db();
  $stmt = $mysqli->prepare("SELECT c_id, name FROM classes WHERE u_id=?");
  $stmt->bind_param('i', $u_id);
  $stmt->bind_result($c_id, $name);
  $stmt->execute();
  $stmt->store_result();

  $classes = array();
  for ($i = 0; $i < $stmt->num_rows; ++$i) {
    $stmt->fetch();
    $classes[$i] = array('id'=>$c_id, 'name'=>$name);
  }
  return $classes;
}

function formatClassList($classList) {
  if (count($classList) > 0) {
    foreach ($classList as $class) {
      ?><li><a href="#" class='load-grades'>
      <span class="class-name"><?php echo ($class['name']) ? $class['name'] : "Untitled"; ?></span>
      <span class="class-id"><?php echo $class['id']; ?></span></a></li><?
    }
  } else {
    ?><li class='disabled'><a href="#">No classes found.</a></li><?
  }
}

$u_id = 0;
$classList = getClassList($u_id);

?>
<!DOCTYPE html>
<html>
  <head>
    <title>GradeVisualizer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script src="https://code.jquery.com/jquery.js"></script>

    <!-- Bootstrap -->
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css">

    <!-- Optional theme -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css">

    <!-- Latest compiled and minified JavaScript -->
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->

    <link rel="stylesheet" href="./css/base.css" type="text/css" />
    <script src="./scripts/gradevis.js" type="text/javascript"></script>
  </head>
  <body>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="header">
            <h1>GradeVisualizer</h1>
            <div>Your grade in action!</div>
          </div>
        </div>
        <div class="col-md-6 class-heading">
          <h2 class="class-heading">Your Grades for <input type="text" class="form-control current class-name" placeholder="Class Name" /><span class="current class-id"></span></h2>
        </div>
        <div class="col-md-6 class-heading">
          <div class="btn-group">
            <div class="btn-group">
              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                Load Grades <span class="caret"></span>
              </button>
              <ul class="dropdown-menu" role="menu">
                <?php formatClassList($classList); ?>
              </ul>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-primary save-grades">
                Save Grades
              </button>
              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu" role="menu">
                <li><a href="#">New class...</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-12">
          <table class="table score">
            <tr>
              <th>Assignment Type</th><th>Weight</th><th>Score</th><th></th>
            </tr>
            <!-- This element will be used as a basis for all the other assignment rows -->
            <tr class="template">
              <td><input type="text" class="form-control assignment-name" placeholder="New Assignment" /><span class="assignment-id"></span></td>
              <td>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Pending" />
                  <span class="input-group-addon">%</span>
                </div>
              </td>
              <td>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Pending" />
                  <span class="input-group-addon">%</span>
                </div>
              </td>
              <td><button type="button" class="btn btn-danger btn-xs remove-assignment"><span class="glyphicon glyphicon-minus-sign"></span></button></td>
            </tr>
            <tr>
              <td colspan="4">
                <button type="button" class="btn btn-default add-assignment">
                  Add Assignment
                </button>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 prediction">
          <h2>Prediction</h2>
          <div class="progress" role="progressbar">
            <div class="progress-bar progress-bar-success earned" style="width: 30%">30.0</div>
            <div class="progress-bar progress-bar-warning progress" style="width: 50%">50.0</div>
            <div class="progress-bar progress-bar-danger lost" style="width: 20%">20.0</div>
          </div>
          <table class="table">
            <tr><th>Expected</th><td class="expected-score">D</td></tr>
            <tr><th>Maximum</th><td class="maximum-score">B</td></tr>
            <tr><th>Median</th><td class="median-score">C</td></tr>
            <tr><th>Minimum</th><td class="minimum-score">D</td></tr>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>
