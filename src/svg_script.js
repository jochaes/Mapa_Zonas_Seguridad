function cargar_figura(){
  fetch('./db/dimensiones.php?action=edificios')
  .then(response => response.json())
  .then(data => verMapa('100%', '100%', data, "edificios"));

}

/**
 * Pinta las figuras en el SVG
 */
function verMapa(width, height, geometrias, capa){

  console.log(geometrias);

  svg = crearSVG(width, height, geometrias.dimensiones[0])

  ancho = parseFloat(geometrias.dimensiones[0].ancho)
  alto = parseFloat(geometrias.dimensiones[0].alto)

  if (alto>ancho){
      ancho_proporcional = alto / height
  }
  else
  {
      ancho_proporcional = ancho / width;
      crear_path(svg, geometrias.objetos, ancho_proporcional, capa);
      console.log(svg);

      document.getElementById("mapa").appendChild(svg)  
  }
}

/**
 * Función que se encarga de Pintar el SVG padre de las figuras 
 */
function crearSVG(width,height, dimensiones){
  var xmlns = "http://www.w3.org/2000/svg";
  let o_svg = document.createElementNS(xmlns, "svg");

  o_svg.setAttribute('id','svg');
  o_svg.setAttribute('width',width);
  o_svg.setAttribute('height',height);
  vb = dimensiones.xmin + ' ' +dimensiones.ymax + ' ' +dimensiones.ancho + ' ' + dimensiones.alto;
  o_svg.setAttribute('viewBox', vb);

  return (o_svg)
}

/**
 * Crea el Path para cada figura de la lista de geometrias
 */
function crear_path(svg , geometrias , ancho_proporcional, capa){
  let xmlns = "http://www.w3.org/2000/svg";
  let capaId = "capa-"+capa;

  // Elemento g dentro del SVG para cada capa 
  let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute('shape-rendering', 'inherit');
  g.setAttribute('pointer-events', 'all');
  g.setAttribute('id', capaId);

  for (geom in geometrias){
      figura = document.createElementNS(xmlns, "path");
      figura.setAttribute ("d", geometrias[geom].svg);
      figura.setAttribute("stroke", "black");
      figura.setAttribute("class", "objeto_espacial");
      figura.setAttribute("fill", colorRGB());
      figura.setAttribute("stroke-width", ancho_proporcional);
      figura.setAttribute("onclick", "mostrarEdificio(" + geometrias[geom].id+ ")");
      g.appendChild(figura)
  }

  svg.appendChild( g );

}


function crear_grupoSVG(svg, descripcion){
  var xmlns = "http://www.w3.org/2000/svg";
  grupo = document.createElementNS(xmlns, "g");
  titulo = document.createElementNS(xmlns, "title");
  titulo.innerHTML = descripcion
  grupo.appendChild(titulo);
  grupo.appendChild(svg);
  return (grupo)
}

function mostrarEdificio(id){
  alert('EDIFICIO:' + id)
}

/**
 * Cambia la visibilidad de la capa seleccionada 
 */
function cambiarVisibilidadCapa(btn_id){
  let id_capa = ''
  switch (btn_id) {
    case 'btn-show-hide-edificios':
      id_capa = 'capa-edificios'
      break;
    case 'btn-show-hide-aceras':
      id_capa = 'capa-aceras'
      break;
    
    case 'btn-show-hide-vialidad':
      id_capa = 'capa-vialidad'
      break

    case 'btn-show-hide-zonas-verdes':
      id_capa = 'capa-zonas-verdes'
      break
  }

  let capa = document.getElementById(id_capa)  //Toma el Id del elemento g del SVG 

  let elementVisibility = capa.getAttribute('display')  //Se usa display para que no lo deje hacer click sobre elementos escondidos 

  if (elementVisibility == null) {
    capa.setAttribute('display', 'none')
  }else{
    capa.removeAttribute('display')
  }

}

function generarNumero(numero){
  return (Math.random() * numero).toFixed(0);
}

function colorRGB(){
  var coolor = '(' + generarNumero(255)+ "," + generarNumero(255)+ ","+ generarNumero(255)+ ", 0.5)";
  return "rgba" + coolor;
}