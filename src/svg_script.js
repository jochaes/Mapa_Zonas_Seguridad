//Variables globales
var svgGlobal = ""
var mouseX = 0
var mouseY = 0
let pin

var cachedViewBox = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
}

/**
 * Llama a la base de datos para pedir las dimensiones de la capa Zonas Verdes (por ser la más amplia)
 *  y con esa información crea y carga el SVG a la variable local
 *  y luego carga las otras capas
 */
function cargar_figura() {
	fetch("./db/dimensiones.php?action=dimensiones")
		.then(response => response.json())
		.then(data => crearSVG("100%", "100%", data.dimensiones[0]))
		.then(cargarCapas()) //Carga las otras capas
}

/**
 * Se encarga de Llamar al servidor para que le devuelva la capa seleccionada
 * @param nombreCapa El nombre de la tabla en la base de datos
 */
function cargarCapaBD(nombreCapa) {
	fetch(`./db/dimensiones.php?action=${nombreCapa}`)
		.then(response => response.json())
		.then(data => cargarCapa("100%", "100%", data, nombreCapa)) // Carga la Capa al SVG
}

/**
 * Función que se encarga de cargar todas las capas necesarias al SVG
 */
function cargarCapas() {
	const capas = ["edificios", "aceras", "zonasverdes", "vialidad", "zonaseguridad", "rutasevacuacion"]
	capas.forEach(capa => cargarCapaBD(capa))
}

/**
 * Pinta las figuras en el SVG
 * @param width       ancho del elemento SVG que se va a colocar en el SVG
 * @param height      alto del elemento SVG que se va a colocar en el SVG
 * @param geometrias  Lista de geometrias de la capa
 * @param capa        nombre de la capa para darle id al elemento g del SVG
 */
function cargarCapa(width, height, geometrias, capa) {
	// console.log("Creando la capa de: " + capa)
	// console.log(geometrias)
	// svg = crearSVG(width, height, geometrias.dimensiones[0])

	ancho = parseFloat(geometrias.dimensiones[0].ancho)
	alto = parseFloat(geometrias.dimensiones[0].alto)

	if (alto > ancho) {
		ancho_proporcional = alto / height
	} else {
		ancho_proporcional = ancho / width
	}

	if (capa === "zonaseguridad" || capa === "rutasevacuacion") {
		crear_path(svgGlobal, geometrias.objetos, ancho_proporcional, capa, false)
	} else {
		crear_path(svgGlobal, geometrias.objetos, ancho_proporcional, capa, true)
	}
}

/**
 * Función que se encarga de Pintar el SVG padre de las figuras
 * @param width
 * @param height
 * @param dimensiones Dimensiones de la Capa
 */
function crearSVG(width, height, dimensiones) {
	var xmlns = "http://www.w3.org/2000/svg"
	let o_svg = document.createElementNS(xmlns, "svg")
	o_svg.setAttribute("id", "svg")
	o_svg.setAttribute("width", width)
	o_svg.setAttribute("height", height)
	vb =
		parseFloat(dimensiones.xmin) +
		" " +
		parseFloat(dimensiones.ymax) +
		" " +
		parseFloat(dimensiones.ancho) +
		" " +
		parseFloat(dimensiones.alto)
	o_svg.setAttribute("viewBox", vb)

	svgGlobal = o_svg
	document.getElementById("mapa").appendChild(svgGlobal)
}

/**
 * Crea el Path para cada figura de la lista de geometrias
 * @param svg                 SVG en dónde se va a pintar el elemento g que contendrá las geometrias
 * @param geometrias          Lista de geometrias para general el path de cada una
 * @param ancho_proporcional
 * @param capa                Nombre de la capa g
 * @param mostrar             True / False para mostrar la capa cuando se ingresa al SVG
 */
function crear_path(svg, geometrias, ancho_proporcional, capa, mostrar) {
	let xmlns = "http://www.w3.org/2000/svg"
	let capaId = "capa-" + capa

	// Elemento g dentro del SVG para cada capa
	let g = document.createElementNS("http://www.w3.org/2000/svg", "g")
	g.setAttribute("shape-rendering", "inherit")
	g.setAttribute("pointer-events", "all")
	g.setAttribute("id", capaId)

	if (!mostrar) {
		g.setAttribute("class", "d-none")
	}

	for (geom in geometrias) {
		figura = document.createElementNS(xmlns, "path")
		figura.setAttribute("d", geometrias[geom].svg)
		figura.setAttribute("class", "objeto_espacial")
		figura.setAttribute("id", ` ${capa}  ${geometrias[geom].id} : ${geometrias[geom].nombre} `)

		if (!mostrar) {

			//Colores específicos para las rutas de evacuacion y zonas de seguridad 
			if(capa === "rutasevacuacion"){
				figura.setAttribute("fill", "rgba(0,0,0,0)")
				figura.setAttribute("stroke", "blue")
			}else{
				figura.setAttribute("fill", "rgba(0,255,0,1)")
				figura.setAttribute("stroke", "yellow")
			}


		} else {
			figura.setAttribute("fill", colorRGB())
			figura.setAttribute("stroke", "black")

		}

		figura.setAttribute("stroke-width", ancho_proporcional)
		if (capa === "edificios") figura.setAttribute("onclick", "mostrarEdificio(this)")
		g.appendChild(figura)
	}

	svg.appendChild(g)
}





/**
 * Crea un ZoomIn en el punto que se dió click sobre el edificio
 * Sólo se activa cuando se da click sobre un edificio
 * @param element Elemento Path del Edificio
 */
function mostrarEdificio(element) {

	tag_VistaDetalle = document.getElementById("vistaDetalle")

	
	if (!tag_VistaDetalle.classList.contains("d-none")) {
		ocultarEdificio()
		return
	} 

	const id = element.id

	//Toma el Valor del viewbox
	var viewBox = svgGlobal.viewBox.baseVal

	//Crea Puntos en el SVG
	var point_mouse = svgGlobal.createSVGPoint()
	var point_center_svg = svgGlobal.createSVGPoint()

	//Guarda la Posicieon del Viewbox para volver a el después
	cachedViewBox.x = viewBox.x
	cachedViewBox.y = viewBox.y
	cachedViewBox.width = viewBox.width
	cachedViewBox.height = viewBox.height

	//Factores de Escala
	var scaleFactor = 15
	var scaleDelta = 1 / scaleFactor

	// point.x = element.getBBox().x
	// point.y = element.getBBox().y

	//Detecta la posicion del click sobre el edificio
	point_mouse.x = mouseX
	point_mouse.y = mouseY

	point_center_svg.x = viewBox.width / 2
	point_center_svg.y = viewBox.height / 2

	//Convierte los puntos al sistema de coordenadas en cómo están ordenadas las figuras del SVG, CRM05
	var startPoint = point_mouse.matrixTransform(svgGlobal.getScreenCTM().inverse())
	var puntoCentral = point_center_svg.matrixTransform(svgGlobal.getScreenCTM().inverse())

	console.log("PCx" + puntoCentral.x)
	console.log("PCy" + puntoCentral.y)

	//El Nuevo Valor del Viewbox
	var fromVars = {
		x: viewBox.x,
		y: viewBox.y,
		width: viewBox.width,
		height: viewBox.height,
		ease: Power2.easeOut,
	}

	console.log("SPx:" + startPoint.x)
	console.log("SPy:" + startPoint.y)
	console.log("VBx:" + viewBox.x)
	console.log("VBy:" + viewBox.y)

	distanciaAlCentro_x = puntoCentral.x - startPoint.x
	distanciaAlCentro_y = puntoCentral.y - startPoint.y

	//Se escala el Viewbox
	viewBox.x -= (startPoint.x - viewBox.x) * (scaleDelta - 1) - 10
	viewBox.y -= (startPoint.y - viewBox.y) * (scaleDelta - 1)

	viewBox.width *= scaleDelta
	viewBox.height *= scaleDelta

	TweenLite.from(viewBox, 0.8, fromVars) //Crea el Efecto de Zoom in sobre el SVG

	document.getElementById("info_edificio").innerHTML = id

	cambiarVisibilidad("btn-show-hide-zonas-seguridad")
	cambiarVisibilidad("btn-show-hide-rutas-evacuacion")
	cambiarVisibilidad("vistaGeneral")
	cambiarVisibilidad("vistaDetalle")
	ocultarCapa("capa-aceras")
	ocultarCapa("capa-vialidad")
	ocultarCapa("capa-zonasverdes")
	// alert('EDIFICIO:' + id)
}

/**
 * Carga el Viewbox cache para volver a las dimensiones anterires al ZoomIN
 * @param viewBox Viewbox con ZoomIn
 */
function zoomOutSvg(viewBox) {
	TweenLite.to(viewBox, 0.4, {
		x: cachedViewBox.x,
		y: cachedViewBox.y,
		width: cachedViewBox.width,
		height: cachedViewBox.height,
	})
}

/**
 * Carga la Vista General
 * ZoomOut del edificio
 */
function ocultarEdificio() {
	var viewBox = svgGlobal.viewBox.baseVal

	cambiarVisibilidad("vistaGeneral")
	cambiarVisibilidad("vistaDetalle")
	cambiarVisibilidad("capa-aceras")
	cambiarVisibilidad("capa-vialidad")
	cambiarVisibilidad("capa-zonasverdes")
	cambiarVisibilidad("btn-show-hide-zonas-seguridad")
	cambiarVisibilidad("btn-show-hide-rutas-evacuacion")

	zoomOutSvg(viewBox)
}

/**
 * Cambia la visibilidad de la capa seleccionada
 * Carga el elemento g del SVG según el ID
 * Si existe el atributo display:none es xq no se está viendo, entonces se elimina para visualizar la capa
 *
 *
 * @param btn_id El identificador del Botón para sabaer cual se presionó
 */
function cambiarVisibilidad(btn_id) {
	let id_capa = ""

	switch (btn_id) {
		case "btn-show-hide-edificios":
			id_capa = "capa-edificios"
			break

		case "btn-show-hide-aceras":
			id_capa = "capa-aceras"
			break

		case "btn-show-hide-vialidad":
			id_capa = "capa-vialidad"
			break

		case "btn-show-hide-zonas-verdes":
			id_capa = "capa-zonasverdes"
			break

		case "btn-show-hide-zonas-seguridad":
			id_capa = "capa-zonaseguridad"
			break
		case "btn-show-hide-rutas-evacuacion":
			id_capa = "capa-rutasevacuacion"
			break

		default:
			id_capa = btn_id
			break
	}

	let capa = document.getElementById(id_capa) //Toma el Id del elemento g del SVG

	if (capa.classList.contains("d-none")) {
		capa.classList.remove("d-none")
	} else {
		ocultarCapa(id_capa)
	}
}
/**
 * Oculta una Capa por su ID
 */
function ocultarCapa(id_capa) {
	let capa = document.getElementById(id_capa)
	capa.classList.add("d-none")
}

/**
 * Genera un Número Aleatorio
 */
function generarNumero(numero) {
	return (Math.random() * numero).toFixed(0)
}

/**
 * Retorna el valor para el atributo color del CSS de cada path que pinta la geometria
 */
function colorRGB() {
	var coolor = "(" + generarNumero(255) + "," + generarNumero(255) + "," + generarNumero(255) + ", 0.5)"
	return "rgba" + coolor
}

/**
 * Toma la Posicion actual del evento de click
 */
function getPosicionCursor(event) {
	mouseX = event.clientX
	mouseY = event.clientY
	// console.log("Click en: " + mouseX + "," + mouseY)
}

//Localización

/**
 * Pinta el Pin en el SVG
 * @param dimensiones La posicion del punto dentro del SVG
 */
function crearpunto(dimensiones) {
	let xmlns = "http://www.w3.org/2000/svg"
	// Elemento g dentro del SVG para cada capa
	let g = document.createElementNS("http://www.w3.org/2000/svg", "g")
	g.setAttribute("shape-rendering", "inherit")
	g.setAttribute("pointer-events", "all")
	g.setAttribute("id", "Capapuntogeografico")
	figura = document.createElementNS(xmlns, "path")
	figura.setAttribute(
		"d",
		`M ${dimensiones.xmin} ${dimensiones.ymax} l -0.21 -0.62 0.06 -0.67 0.31 -0.59 0.49 -0.41 0.64 -0.2 0.64 0.06 0.59 0.31 0.41 0.49 0.2 0.64 -0.06 0.64 -0.31 0.59 -0.49 0.41 -0.64 0.2 -0.64 -0.06 -0.57 -0.29 z`
	)
	figura.setAttribute("stroke", "red")
	figura.setAttribute("class", "objeto_espacial")
	figura.setAttribute("id", "punto")
	figura.setAttribute("stroke-width", "10px")
	g.appendChild(figura)
	svg.appendChild(g)
}

/**
 * Si logra tomar la localizacion entonces pinta el punto en el mapa
 * @param pos Posicion del Usuairo
 */
function success(pos) {
	const crd = pos.coords
	console.log("Se detectó localizacion en: lat: " + crd.latitude + " long: " + crd.longitude)

	puntos = crd.longitude + "," + crd.latitude
	fetch(`./db/dimensiones.php?action=${puntos}`)
		.then(response => response.json())
		.then(data => crearpunto(data.dimensiones[0]))
	// if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
	//   console.log('Congratulations, you reached the target');
	//   navigator.geolocation.clearWatch(id);
	// }
}
/**
 * Error cuando el pin no logra obtener la localización
 * @param err Eror de la Geolocalizacion
 */
function error(err) {
	console.error(`ERROR LOCALIZACION (${err.code}): ${err.message}`)
}

/**
 * Opciones para localizador
 */
options = {
	enableHighAccuracy: false,
	timeout: 5000,
	maximumAge: 0,
}

//Activa la Geolocalizacion
pin = navigator.geolocation.watchPosition(success, error, options)
