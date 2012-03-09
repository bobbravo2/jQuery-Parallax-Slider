<?php 
sleep(rand(1, 3) * 0.5);
$file = 'images/'.$_GET['filename'];
$image = file_get_contents($file);
// header("Not Modified",TRUE,304);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($file)) . ' GMT',TRUE);
header("Content-Type: Image");
// die();
header('Expires: '.gmdate('D, d M Y H:i:s \G\M\T', time() + (7*24*60*60)), TRUE);
header("Pragma: public");
header("Cache-Control: public");
header("Content-Transfer-Encoding: binary");
echo $image;
?>