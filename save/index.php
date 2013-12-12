<?php

require_once('../backend/db.php');


if (isset($_POST['classname']) && isset($_POST['assignments'])) {
  try {
    $classid = isset($_POST['classid'])? $_POST['classid'] : null;
    $classname = $_POST['classname'];
    $assignments = $_POST['assignments'];

    $mysqli = connect_to_db();

    $u_id = 0;
    // This is a new class
    $stmt = $mysqli->prepare("INSERT INTO classes (u_id, name) VALUES (?, ?)");
    $stmt->bind_param("is", $u_id, $classname);
    $stmt->execute();

    $c_id = $mysqli->insert_id;
    $stmt = $mysqli->prepare("INSERT INTO assignments (c_id, a_id, name, weight, score) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, weight=?, score=?");

    foreach ($assignments as $assignment) {
      $stmt->bind_param("iisiisii",
        // Insert part
        $c_id, $assignment['id'], $assignment['name'], $assignment['weight'], $assignment['score'],
        // Update part
        $assignment['name'], $assignment['weight'], $assignment['score']);
      $stmt->execute();
    }

    // Return the class ID so that future saves will update instead of
    // add a new entry into the database.
    echo json_encode($c_id);
    exit(0);
  } catch (Exception $e) {
    echo json_encode(false);
    exit(1);
  }
  exit(0);
}

?>
