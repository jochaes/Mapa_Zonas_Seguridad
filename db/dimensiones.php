<?php 
    // include 'conexion.php';

    function dbConnection() {
        $conn_string = "host=localhost port=5432 dbname=sem_5 user=postgres password=olakease1697";
        $conn = pg_connect($conn_string);
        return $conn;
    }

    function returnDimensiones(){
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  tec.zonas_verdes) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);

        pg_close($conn);
        return json_encode($object_result);
    }

    
    function returnEdificios() {
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  tec.edificios) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);


        $result_1 = pg_query($conn, "select id, nombre, niveles, st_assvg(geom,1,2) as svg from tec.edificios");
        $object_result -> objetos = pg_fetch_all($result_1);
        pg_close($conn);
        return json_encode($object_result);
    }


    function returnZonasVerdes() {
        
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  tec.zonas_verdes) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);

        $result_1 = pg_query($conn, "select id, nombre, tipo, st_assvg(geom,1,2) as svg from tec.zonas_verdes");

        $object_result -> objetos = pg_fetch_all($result_1);
        pg_close($conn);
        return json_encode($object_result);
    }


    function returnZonasSeguridad() {
        
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  tec.zonas_seguridad) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);

        $result_1 = pg_query($conn, "select id_0, capacidad, area, st_assvg(geom,1,2) as svg from tec.zonas_seguridad");

        $object_result -> objetos = pg_fetch_all($result_1);
        pg_close($conn);
        return json_encode($object_result);
    }

    function returnRutasEvacuacion() {
        
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  tec.rutas_evacuacion) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);

        $result_1 = pg_query($conn, "select id, capacidad, st_assvg(geom,1,2) as svg from tec.rutas_evacuacion");

        $object_result -> objetos = pg_fetch_all($result_1);
        pg_close($conn);
        return json_encode($object_result);
    }
    

    switch ($_GET['action']) {
        case 'dimensiones':
            echo returnDimensiones();
            break;
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
            echo returnZonasVerdes();
            break;
        case 'zonaseguridad':
            echo returnZonasSeguridad();
            break;
        case 'rutasevacuacion':
            echo returnRutasEvacuacion();
            break;
    }




   
    /*
    while ($row = pg_fetch_row($result)) {
        echo "xmin: $row[0]  ymax: $row[1]  ancho: $row[2]  alto: $row[3]";
        echo "<br />\n";
    }*/
?>