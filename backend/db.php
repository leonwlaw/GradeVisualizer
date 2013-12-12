<?php

class DatabaseConnectionError extends Exception {}

function connect_to_db() {
  $mysqli = new mysqli('localhost', 'gradevis', 'XBn5VgBw8fZr9d8e', 'gradevisdb');

  if ($mysqli->connect_error) {
    throw new DatabaseConnectionError('Connect Error (' . $mysqli->connect_errno . ') '
      . $mysqli->connect_error);
  }

  return $mysqli;
}
