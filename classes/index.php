<?php
/*
This page will allow users to retrieve the list of classes they saved.
*/
require_once('../backend/db.php');

// u_id should be an int. If it can't be interpreted as an int, then
// ignore the request and return an empty set.
$u_id = (isset($_GET['u_id']) &&
  is_numeric($_GET['u_id'])) ? intval($_GET['u_id']) : null;

if ($u_id === null) {
  echo json_encode(array());
  exit(0);
}

$mysqli = connect_to_db();
$stmt = $mysqli->prepare("SELECT c_id, name FROM classes WHERE u_id=?");
$stmt->bind_param("i", $u_id);
$stmt->bind_result($c_id, $classname);
$stmt->execute();
$stmt->store_result();

$classes = array();
for ($i = 0; $i < $stmt->num_rows; ++$i) {
  $stmt->fetch();
  $classes[$i] = array('id'=>$c_id, 'name'=>$classname);
}

echo json_encode($classes);
?>
