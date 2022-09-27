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
  for (geom in geometrias){
      figura = document.createElementNS(xmlns, "path");
      figura.setAttribute ("d", geometrias[geom].svg);
      figura.setAttribute("stroke", "black");
      figura.setAttribute("class", "objeto_espacial");
      figura.setAttribute("id", capa);
      figura.setAttribute("fill", colorRGB());
      figura.setAttribute("stroke-width", ancho_proporcional);
      figura.setAttribute("onclick", "mostrarEdificio(" + geometrias[geom].id+ ")");
      svg.appendChild(crear_grupoSVG(figura, geometrias[geom].nombre));
  }
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

function generarNumero(numero){
  return (Math.random() * numero).toFixed(0);
}

function colorRGB(){
  var coolor = '(' + generarNumero(255)+ "," + generarNumero(255)+ ","+ generarNumero(255)+ ", 0.5)";
  return "rgba" + coolor;
}