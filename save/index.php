<?php

require_once('../backend/db.php');
session_start();

if (isset($_POST['classname']) && isset($_POST['assignments'])) {
  try {
    // classid should be an int. If it can't be interpreted as an int,
    // then consider it as being a new class.
    $classid = (isset($_POST['classid']) &&
      is_numeric($_POST['classid'])) ? intval($_POST['classid']) : null;
    $classname = $_POST['classname'];
    $assignments = $_POST['assignments'];

    // This will be present if the user has logged in via facebook. If it
    // can't be interpreted as an int, then ignore the request and return an
    // empty set.
    $u_id = (isset($_SESSION['fb_189336231272827_user_id']) &&
      is_numeric($_SESSION['fb_189336231272827_user_id'])) ?
      intval($_SESSION['fb_189336231272827_user_id']) : null;

    if ($u_id === null) {
      echo "Not logged in";
      exit(0);
    }

    $mysqli = connect_to_db();

    if ($classid === null) {
      // This is a new class
      $stmt = $mysqli->prepare("INSERT INTO classes (u_id, name) VALUES (?, ?)");
      $stmt->bind_param("is", $u_id, $classname);
      $stmt->execute();

      $classid = $mysqli->insert_id;
    } else {
      // This is an old class. Update its name if necessary.
      $stmt = $mysqli->prepare("INSERT INTO classes (c_id, u_id, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=?");
      $stmt->bind_param("iiss", $classid, $u_id, $classname, $classname);
      $stmt->execute();

    }

    $stmt = $mysqli->prepare("INSERT INTO assignments (c_id, a_id, name, weight, score) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, weight=?, score=?");

    // Build the list of referenced assignment IDs
    $assignment_ids = array();
    foreach ($assignments as $assignment) {
      $stmt->bind_param("iisiisii",
        // Insert part
        $classid, $assignment['id'], $assignment['name'], $assignment['weight'], $assignment['score'],
        // Update part
        $assignment['name'], $assignment['weight'], $assignment['score']);
      $stmt->execute();
      $assignment_ids[count($assignment_ids)] = intval($assignment['id']);
    }

    // Remove any assignments that weren't referenced.
    $assignment_ids_string = "(".implode(", ", $assignment_ids).")";
    $stmt = $mysqli->prepare("DELETE FROM assignments WHERE c_id=? AND a_id NOT IN ".$assignment_ids_string);
    echo "DELETE FROM assignments WHERE c_id=? AND a_id NOT IN ".$assignment_ids_string;
    $stmt->bind_param("i", $classid);
    $stmt->execute();

    // Return the class ID so that future saves will update instead of
    // add a new entry into the database.
    echo json_encode($classid);
    exit(0);
  } catch (Exception $e) {
    echo json_encode(false);
    exit(1);
  }
  exit(0);
}

?>
