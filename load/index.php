<?php

require_once('../backend/db.php');

// classid should be an int. If it can't be interpreted as an int,
// then consider it as being a new class.
$classid = (isset($_GET['classid']) &&
  is_numeric($_GET['classid'])) ? intval($_GET['classid']) : null;

if ($classid == null) {
  echo json_encode(false);
  exit(0);
}

$mysqli = connect_to_db();
$stmt = $mysqli->prepare("SELECT name FROM classes WHERE c_id=?");
$stmt->bind_param("i", $classid);
$stmt->bind_result($classname);
$stmt->execute();
$stmt->fetch();
$stmt->close();

$stmt = $mysqli->prepare("SELECT a_id, name, weight, score FROM assignments WHERE c_id=?");
$stmt->bind_param("i", $classid);
$stmt->bind_result($assignmentid, $name, $weight, $score);
$stmt->execute();
$stmt->store_result();

$assignments = array();
for ($i = 0; $i < $stmt->num_rows; ++$i) {
  $stmt->fetch();
  $assignments[$i] = array(
    "id"=>$assignmentid,
    "name"=>$name,
    "weight"=>$weight,
    "score"=>$score
    );
}

$classinfo = array(
  "classname"=>$classname, "assignments"=>$assignments);

echo json_encode($classinfo);
?>
