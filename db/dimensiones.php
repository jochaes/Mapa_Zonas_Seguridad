<?php 
    // include 'conexion.php';

    /**
     * Crea la conexion con la base de datos local
     * Cambiar los datos de conexion para adecuarlos a su base de datos local
     */
    function dbConnection() {
        //ELison
        // $host= 'localhost';
        // $port= '5432';
        // $dbname= 'localhost';
        // $user= 'postgres';
        // $password='1234';
        // $conn_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password}";  
        // $conn = pg_connect($conn_string); //Crea la conexion   
        // return $conn;

        //Josue

        $host= 'localhost';
        $port= '5432';
        $dbname= 'sem_5';
        $user= 'postgres';
        $password='olakease1697';
        $conn_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password}";  
        $conn = pg_connect($conn_string); //Crea la conexion   
        return $conn;
    }

    /**
     * Retorna las Dimensiones para crear el SVG 
     * En este caso utilizamos la capa de Zonas Verdes ya que es la más amplia 
     */
    function returnDimensiones(){   
        $schema = 'tec'; // Esquema de la base de datos, Cambiar este datos según su instalación local
            
        $conn = dbConnection();

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  {$schema}.zonas_verdes) as extent;");
                
        $object_result = new stdClass(); //Crea una clase para guardar el dato 

        $object_result -> dimensiones = pg_fetch_all($result);

        pg_close($conn);

        return json_encode($object_result);
    }


    function returnPoint($punto){
        $schema = 'tec'; // Esquema de la base de datos, Cambiar este datos según su instalación local
        $str_arr = explode (",", $punto); 

        // $corX = -84.509951;
        // $corY = 10.362561;

        $conn = dbConnection();
        $result = pg_query($conn, "update tec.coordenadas set geom = st_makepoint({$str_arr[0]},{$str_arr[1]})  where id=1;");
        // $resultado = pg_query($conn, "update tec.coordenadas set geom = st_makepoint({$corX},{$corY})  where id=1;");
        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, ST_ymax(bb)*-1 as ymax from (select ST_Transform(geom,5367) as bb from tec.coordenadas where id=1)as extent;");
        $object_result = new stdClass(); //Crea una clase para guardar el dato 
        $object_result -> dimensiones = pg_fetch_all($result);

        pg_close($conn);
        return json_encode($object_result); 
    }


    /**
     * Devuelve la capa seleccionada desde la base de datos 
     * @param nombreCapa 
     * @param consulta Consulta con las diferentes columnas que desea cargar 
     */


    function returnCapa($nombreCapa, $consulta){
        $schema = 'tec'; // Esquema de la base de datos, Cambiar este datos según su instalación local

        $conn = dbConnection();
        $consultaCapa = "{$consulta} {$schema}.{$nombreCapa}"; //Contruccion de la consulta
        

        $result = pg_query($conn, "Select ST_XMin(bb) as xmin, 
        ST_ymax(bb)*-1 as ymax, 
        ST_Xmax(bb)-ST_Xmin(bb) as ancho, 
        ST_Ymax(bb)-ST_ymin(bb) as alto
            from 
        (select ST_Extent(geom) bb from  {$schema}.{$nombreCapa}) as extent;");

        $object_result = new stdClass();

        $object_result -> dimensiones = pg_fetch_all($result);
        
        $result_1 = pg_query($conn, $consultaCapa);  // Realiza la consulta a la base de datos

        $object_result -> objetos = pg_fetch_all($result_1);
        
        pg_close($conn);
        return json_encode($object_result);
    }


    switch ($_GET['action']) {
        case 'dimensiones':
            echo returnDimensiones();
            break;
        case 'edificios':
            echo returnCapa('edificios', 'select id, nombre, niveles, st_assvg(geom,1,2) as svg from ');
            break;
        case 'aceras':
            // En el QGIS la columna aparece como DESCIPCION no descripcion 
            echo returnCapa("aceras", "select id, descipcion, tipo, st_assvg(geom,1,2) as svg from ");
            break;
        case 'vialidad':
            echo returnCapa("vialidad", "select id, nombre, tipo, st_assvg(geom,1,2) as svg from ");
            break;
        case 'zonasverdes':
            echo returnCapa("zonas_verdes", "select id, nombre, tipo, st_assvg(geom,1,2) as svg from ");
            break;
        case 'zonaseguridad':
            echo returnCapa("zonas_seguridad", "select id_0, capacidad, area, st_assvg(geom,1,2) as svg from ");
            break;
        case 'rutasevacuacion':
            echo returnCapa("rutas_evacuacion", "select id, capacidad, st_assvg(geom,1,2) as svg from ");
            break;
        default:
            echo returnPoint($_GET['action']);
            break;
    }



    /*
    while ($row = pg_fetch_row($result)) {
        echo "xmin: $row[0]  ymax: $row[1]  ancho: $row[2]  alto: $row[3]";
        echo "<br />\n";
    }*/
?>



