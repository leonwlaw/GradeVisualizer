<?php
require_once('facebook/facebook.php');

function connect_to_facebook() {
  $facebook = new Facebook(array(
    'appId'  => '189336231272827',
    'secret' => 'ed852b6f992f185714f4e91901dca5f8',
  ));
  return $facebook;
}

?>