<?php
/*
This page will allow users to retrieve the list of classes they saved.
*/
require_once('../backend/db.php');
session_start();

// This will be present if the user has logged in via facebook. If it
// can't be interpreted as an int, then ignore the request and return an
// empty set.
$u_id = (isset($_SESSION['fb_189336231272827_user_id']) &&
  is_numeric($_SESSION['fb_189336231272827_user_id'])) ?
  intval($_SESSION['fb_189336231272827_user_id']) : null;

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
