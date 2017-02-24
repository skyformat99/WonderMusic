<?php

# Powered by Joyce Song

require_once 'NeteaseMusicAPI.php';

# Initialize
$api = new NeteaseMusicAPI();
$playlistid=$_GET["playlistid"];

# Get data
$result = $api->playlist($playlistid);

# return JSON, just use it
$data=json_decode($result);
header('Content-type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin:*");
echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);

