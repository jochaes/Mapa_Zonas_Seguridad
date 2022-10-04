<?php
    function dbConnection() {
        $host= 'localhost';
        $port= '5432';
        $dbname= 'localhost';
        $user= 'postgres';
        $password='1234';
        $conn_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password}";  
        $conn = pg_connect($conn_string); //Crea la conexion   
        return $conn;
    }
?>  
