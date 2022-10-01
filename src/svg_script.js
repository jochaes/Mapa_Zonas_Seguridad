
var svgGlobal = ""  //Variable Global que tendrá la información del SVG 

var mouseX = 0
var mouseY = 0

function getPosicionCursor(event){
  
  mouseX = event.clientX
  mouseY = event.clientY

  console.log("Click en: " + mouseX + "," + mouseY );
}

/**
 * Llama a la base de datos para pedir las dimensiones de la capa Zonas Verdes (por ser la más amplia)
 *  y con esa información crea y carga el SVG a la variable local 
 *  y luego carga las otras capas
 */
function cargar_figura(){
  fetch('./db/dimensiones.php?action=dimensiones')
  .then(response => response.json())
  .then(data => crearSVG('100%', '100%', data.dimensiones[0]))
  .then(cargarCapas()) //Carga las otras capas 
}


/**
 * Se encarga de Llamar al servidor para que le devuelva la capa seleccionada 
 * @param nombreCapa El nombre de la tabla en la base de datos 
 */
function cargarCapaBD(nombreCapa){
  fetch(`./db/dimensiones.php?action=${nombreCapa}`)
  .then(response => response.json())
  .then(data => cargarCapa('100%', '100%', data, nombreCapa)); // Carga la Capa al SVG 
}

/**
 * Función que se encarga de cargar todas las capas necesarias al SVG 
 */
function cargarCapas(){

  const capas = ['edificios','aceras','zonasverdes','vialidad','zonaseguridad','rutasevacuacion']
  capas.forEach(capa => cargarCapaBD(capa))
}


/**
 * Pinta las figuras en el SVG
 * @param width       ancho del elemento SVG que se va a colocar en el SVG 
 * @param height      alto del elemento SVG que se va a colocar en el SVG 
 * @param geometrias  Lista de geometrias de la capa 
 * @param capa        nombre de la capa para darle id al elemento g del SVG 
 */
function cargarCapa(width, height, geometrias, capa){
  console.log("Creando la capa de: " + capa);
  console.log(geometrias);

  // svg = crearSVG(width, height, geometrias.dimensiones[0])

  ancho = parseFloat(geometrias.dimensiones[0].ancho)
  alto = parseFloat(geometrias.dimensiones[0].alto)

  if (alto>ancho){
      ancho_proporcional = alto / height
  }
  else
  {
      ancho_proporcional = ancho / width;
  }

  if(capa === 'zonaseguridad' || capa === 'rutasevacuacion'){
    crear_path(svgGlobal, geometrias.objetos, ancho_proporcional, capa, false);
  }else{
    crear_path(svgGlobal, geometrias.objetos, ancho_proporcional, capa, true);
  }

//      document.getElementById("mapa").appendChild(svg)  
  
}

/**
 * Función que se encarga de Pintar el SVG padre de las figuras 
 * @param width
 * @param height
 * @param dimensiones Dimensiones de la Capa 
 */
function crearSVG(width,height, dimensiones){
  console.log("crearSVG");

  var xmlns = "http://www.w3.org/2000/svg";
  let o_svg = document.createElementNS(xmlns, "svg");

  o_svg.setAttribute('id','svg');
  o_svg.setAttribute('width',width);
  o_svg.setAttribute('height',height);
  vb = parseFloat(dimensiones.xmin) + ' ' +parseFloat(dimensiones.ymax) + ' ' +parseFloat(dimensiones.ancho) + ' ' + parseFloat(dimensiones.alto);
  o_svg.setAttribute('viewBox', vb);

  svgGlobal = o_svg
  document.getElementById("mapa").appendChild(svgGlobal)  
  // return (o_svg)
}

/**
 * Crea el Path para cada figura de la lista de geometrias
 * @param svg                 SVG en dónde se va a pintar el elemento g que contendrá las geometrias
 * @param geometrias          Lista de geometrias para general el path de cada una
 * @param ancho_proporcional  
 * @param capa                Nombre de la capa g 
 * @param mostrar             True / False para mostrar la capa cuando se ingresa al SVG 
 */

function crear_path(svg , geometrias , ancho_proporcional, capa, mostrar){
  let xmlns = "http://www.w3.org/2000/svg";
  let capaId = "capa-"+capa;

  // Elemento g dentro del SVG para cada capa 
  let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute('shape-rendering', 'inherit');
  g.setAttribute('pointer-events', 'all');
  g.setAttribute('id', capaId);

  if(!mostrar) {
    g.setAttribute('display', 'none')
  }

  for (geom in geometrias){
      figura = document.createElementNS(xmlns, "path");
      figura.setAttribute("d", geometrias[geom].svg);
      figura.setAttribute("stroke", "black");
      figura.setAttribute("class", "objeto_espacial");
      figura.setAttribute("id", capa+geometrias[geom].id)


      if(!mostrar){
        figura.setAttribute("fill","rgba(255,0,0,0.5)" );  
      }else{
        figura.setAttribute("fill", colorRGB());
      }

      figura.setAttribute("stroke-width", ancho_proporcional);
      if (capa === 'edificios') figura.setAttribute("onclick", "mostrarEdificio(this)");
      g.appendChild(figura)
  }

  svg.appendChild( g );
}

/**
 * Crea un G para el SVG pero ya lo hacemos en crear_path 
 */
// function crear_grupoSVG(svg, descripcion){
//   var xmlns = "http://www.w3.org/2000/svg";
//   grupo = document.createElementNS(xmlns, "g");
//   titulo = document.createElementNS(xmlns, "title");
//   titulo.innerHTML = descripcion
//   grupo.appendChild(titulo);
//   grupo.appendChild(svg);
//   return (grupo)
// }

/**
 * Acá es donde tiene que: 
 *  [] Hacer Zoom 
 *  [] Mostrar la info del Edificio() y que haya un botón que se devuelva a la vista General
 *  [] Cambiar la visibilidad de las capas de Zonas de Seguridad y Rutas de Evacuacion 
 * 
 * todo:
 *  
 */

var cachedViewBox = {
  x: 0,
  y: 0,
  width: 0,
  height:0
}

function mostrarEdificio(element){
  const id = element.id

  console.log(element.getBBox());
  
  var viewBox = svgGlobal.viewBox.baseVal
  var point = svgGlobal.createSVGPoint()

  cachedViewBox.x = viewBox.x
  cachedViewBox.y = viewBox.y
  cachedViewBox.width = viewBox.width
  cachedViewBox.height = viewBox.height

 
  var scaleFactor = 20
  var scaleDelta = 1 / scaleFactor
  
  // point.x = element.getBBox().x
  // point.y = element.getBBox().y

  point.x = mouseX
  point.y = mouseY

  var startPoint = point.matrixTransform(svgGlobal.getScreenCTM().inverse())
  
  var fromVars = {
    x:viewBox.x,
    y:viewBox.y,
    width:viewBox.width,
    height:viewBox.height,
    ease:Power2.easeOut
  }

  viewBox.x -= (startPoint.x - viewBox.x) * (scaleDelta - 1)
  viewBox.y -= (startPoint.y - viewBox.y) * (scaleDelta - 1)
  viewBox.width *= scaleDelta
  viewBox.height *= scaleDelta
  
  TweenLite.from(viewBox, 0.5, fromVars)


  // //Cambia la visibilidad de las capas de Zonas de seguridad y Evacuacion 
  // cambiarVisibilidadCapa('btn-show-hide-zonas-seguridad')
  // cambiarVisibilidadCapa('btn-show-hide-rutas-evacuacion')

  // alert('EDIFICIO:' + id)





}


/**
 * Cambia la visibilidad de la capa seleccionada 
 * Carga el elemento g del SVG según el ID 
 * Si existe el atributo display:none es xq no se está viendo, entonces se elimina para visualizar la capa
 * 
 * 
 * @param btn_id El identificador del Botón para sabaer cual se presionó 
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
      id_capa = 'capa-zonasverdes'
      break

    case 'btn-show-hide-zonas-seguridad':
      id_capa = 'capa-zonaseguridad'
      break
    case 'btn-show-hide-rutas-evacuacion':
      id_capa = 'capa-rutasevacuacion'
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

/**
 * Genera un Número Aleatorio 
 */
function generarNumero(numero){
  return (Math.random() * numero).toFixed(0);
}

/** 
 * Retorna el valor para el atributo color del CSS de cada path que pinta la geometria 
 */
function colorRGB(){
  var coolor = '(' + generarNumero(255)+ "," + generarNumero(255)+ ","+ generarNumero(255)+ ", 0.5)";
  return "rgba" + coolor;
}

