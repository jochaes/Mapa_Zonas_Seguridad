<?php

  $conn = pg_connect("host=localhost port=5432 dbname=sem_5 user=postgres password=olakease1697");
  $result = pg_query($conn, "SELECT * FROM idesca.distritos");

  
  if(!$result){
    echo 'Error en la consulta';
    exit;
  };


?>

