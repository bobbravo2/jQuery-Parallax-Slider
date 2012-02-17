<?php 
sleep(rand(1, 3));
$image = file_get_contents('images/'.$_GET['filename']);
header("Content-Type: image/jpg");
header("Content-Transfer-Encoding: binary");
echo $image;
?>