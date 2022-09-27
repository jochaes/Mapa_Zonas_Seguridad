<?php
    $conn_string = "host=localhost port=5432 dbname=sem_5 user=postgres password=olakease1697";
    $conn = pg_connect($conn_string);
    return $conn;
?>  
