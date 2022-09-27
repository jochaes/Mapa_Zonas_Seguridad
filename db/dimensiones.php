<?php 
    // include 'conexion.php';

    
    function returnEdificios() {

        
        $conn_string = "host=localhost port=5432 dbname=sem_5 user=postgres password=olakease1697";
        $conn = pg_connect($conn_string);

        
        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
            ST_ymax(bb)*-1 as ymax, 
            ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
            ST_Ymax(bb)-ST_ymin(bb) as alto
                from 
            (select ST_Extent(geom) bb from  tec.edificios) as extent");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);

        $result = pg_query($conn, "select id, nombre, niveles, st_assvg(geom,1,2) as svg from tec.edificios");

        $object_result -> objetos = pg_fetch_all($result);

        pg_close($conn);
        return json_encode($object_result);
    }


    function returnAceras() {
        $resultado = "hola";

        $conn_string = "host=localhost port=5432 dbname=sem_5 user=postgres password=olakease1697";
        $conn = pg_connect($conn_string);

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
            ST_ymax(bb)*-1 as ymax, 
            ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
            ST_Ymax(bb)-ST_ymin(bb) as alto
                from 
            (select ST_Extent(geom) bb from  tec.edificios) as extent");
 

        pg_close($conn);
        return $resultado;
    }
    

    switch ($_GET['action']) {
        case 'edificios':
            echo returnEdificios();
            break;
        case 'aceras':
            echo returnAceras();
            break;
        case 'vialidad':
            echo "vialidad";
            break;
        case 'zonasverdes':
            echo "Zonas Verdes";
            break;
    }




   
    /*
    while ($row = pg_fetch_row($result)) {
        echo "xmin: $row[0]  ymax: $row[1]  ancho: $row[2]  alto: $row[3]";
        echo "<br />\n";
    }*/
?>