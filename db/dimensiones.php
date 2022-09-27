<?php
    include 'conexion.php';
    $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
                                    ST_ymax(bb)*-1 as ymax, 
                                    ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
                                    ST_Ymax(bb)-ST_ymin(bb) as alto
                                from 
                                    (select ST_Extent(geom) bb from  tec.edificios) as extent
                                    ");

    
    $object_result = new stdClass();
    
    $object_result -> dimensiones = pg_fetch_all($result);

    $result = pg_query($conn, "select id, nombre, niveles, st_assvg(geom,1,2) as svg from tec.edificios");
    
    $object_result -> objetos = pg_fetch_all($result);

    echo json_encode($object_result);
    /*
    while ($row = pg_fetch_row($result)) {
        echo "xmin: $row[0]  ymax: $row[1]  ancho: $row[2]  alto: $row[3]";
        echo "<br />\n";
    }*/
?>