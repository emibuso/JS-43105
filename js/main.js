// Clase molde para instrumentos
class Alimento {
    constructor(id, imagen = false, nombre, marca, precio,vendidos) {
        this.id= id;
        this.imagen = imagen;
        this.nombre = nombre;
        this.marca = marca;
        this.precio = parseInt(precio);
        this.vendidos = parseInt(vendidos);
    }
}
// clase Carrito para agregar productos al carrito
class Carrito{
    constructor(){
        const carritoStorage = JSON.parse(localStorage.getItem('carrito'))
        this.carrito= carritoStorage || [];
        this.total = 0;
        this.totalProductos = 0;
        this.listar();
    }
    // Método para saber si un instrumento está en el carrito
    estaEnCarrito({id}){
        return this.carrito.find((Alimento) => Alimento.id===id)
    }
    //Agregar al carrito, si está en el carrito lo suma sino lo agrega
    agregar(alimento){
        let productoenCarrito = this.estaEnCarrito(alimento);
        if(productoenCarrito){
            // sumar la cantidad
            productoenCarrito.cantidad++;
        }else{
            // agregar al carrito
            this.carrito.push({ ...alimento, cantidad: 1});
            localStorage.setItem('carrito', JSON.stringify(this.carrito));
        }
    this.listar();
    }
    //Método para quitar directamente un producto del carrito sin importar la cantidad de productos que haya en el mismo
    quitar(id){
        const indice = this.carrito.findIndex((producto) => producto.id===id);
        this.carrito.splice(indice,1);
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.listar();
    }
    // restar un producto del carrito, si la cantidad es mayor que 1 resta , si es 1 lo elimina
    restar(id){
        const indice = this.carrito.findIndex((producto) => producto.id===id);
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        }else{
        this.carrito.splice(indice,1)
        }
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.listar();
    }
    //Método para sumar cantidades del producto que está en el carrito
    sumar(id){
        const indice = this.carrito.findIndex((producto) => producto.id===id);
        this.carrito[indice].cantidad++;
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
        this.listar();
    }
    //Método para eliminar directamente todos los productos del carrito 
    vaciarCarrito() {
        this.carrito = []; 
        localStorage.removeItem('carrito'); 
        this.listar(); 
    }
    // Método para limpiar el carrito una vez que se presiona el boton de "pagar"
    comprarCarrito() {
        this.carrito = []; 
        localStorage.removeItem('carrito'); 
        this.listar();
    }
    //listar los productos del carrito
    listar(){
        divCarrito.innerHTML = '';
        this.total = 0;
        this.totalProductos = 0;
        for (const producto of this.carrito){
            divCarrito.innerHTML += `
            <h5>${producto.nombre} ${producto.marca} </h5>
            <p> Precio unitario: ${producto.precio}</p>
            <b> Sub total: $ ${producto.precio * producto.cantidad} </b>
            <p> Cantidad: ${producto.cantidad}</p> 
            <div class="botonesCarrito">
                <img src="img/menos2.png" class="botonRestar" data-id="${producto.id}" alt="">
                <img src="img/eliminar.png" class="botonQuitar" data-id="${producto.id}" alt="">
                <img src="img/mas2.png" class="botonSumar" data-id="${producto.id}" alt="">
            </div>

            `
            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
        }
         // Ocultar elementos si no hay productos en el carrito 
        if (this.totalProductos > 0) {
            botonComprar.classList.remove("ocultar"); 
            vaciarCarrito.classList.remove("ocultar"); 
            comprando.innerText =''
            comprando.innerText =`continua comprando`;
            total.classList.remove('ocultar');
            tituloCarrito.innerText =`Productos en carrito:`;
        } else {
            botonComprar.classList.add("ocultar"); 
            vaciarCarrito.classList.add("ocultar"); 
            comprando.innerText =''
            comprando.innerText     =`Selecciona tu producto`;
            total.classList.add("ocultar"); 
            tituloCarrito.innerText =''
            tituloCarrito.innerText +=`CARRITO VACÍO`;
        }
        // funcion del boton de quitar
        const botonesQuitar= document.querySelectorAll('.botonQuitar');
        for (const boton of botonesQuitar){
            boton.addEventListener('click',() => {
                const id = (boton.dataset.id);
                this.quitar(id);
            }
        )}
        // funcion del boton de quitar
        const restar= document.querySelectorAll('.botonRestar');
        for(const bRestar of restar){
            bRestar.addEventListener('click',() => {
                const id = (bRestar.dataset.id);
                this.restar(id)
            }
        )}
        // funcion del boton de sumar
        const sumar= document.querySelectorAll('.botonSumar');
        for(const bSumar of sumar){
            bSumar.addEventListener('click',() => {
            const id = (bSumar.dataset.id);
            this.sumar(id)
            }
            )};
        // actualizar valores span
        spanCantidadProductos.innerHTML= this.totalProductos;
        spanTotalCarrito.innerHTML= this.total;
    }
}
// variable global para productos
let productos=[];
const categoriaSeleccionada = "MLA1403";
const limiteProductos =30;
async function apiProductosDeMercadoLibre(categoria = categoriaSeleccionada) {
        const response = await fetch('https://api.mercadolibre.com/sites/MLA/search?category=${categoriaSeleccionada}&limit=${limiteProductos}&offset=0');
        const api = await response.json();
        const productosMercadoLibre = api.results;
        console.log(productosMercadoLibre);
        productos = [];
        for (const productoMl of productosMercadoLibre) {
        
            productos.push(new Alimento(
                productoMl.id,
                productoMl.thumbnail_id,
                productoMl.title.slice(0, 30) + "...",
                productoMl.attributes[0].value_name,
                productoMl.price,
                productoMl.sold_quantity
            ));
        }
        // Resuelve la promesa con los datos
        return productos;
}
// Llama a apiProductosDeMercadoLibre y luego ejecuta filtrosMarca(), si no se hace en ese orden la funcion de filtros marca no carga debido a que cargarCatalogo es asincrónica
apiProductosDeMercadoLibre().then((productosapi) => {
    mostrarLoading();
    cargarCatalogo(productosapi);
    filtrosMarca(productosapi);
});
// Busca un producto por ID, si lo encuentra lo retorna en forma de objeto
function registroPorId(id){
    return productos.find((alimento) => alimento.id === id);
}
//  Funcion de cargar el catalogo, tiene clases de bootstrap y modifica en html en la seccion de catalogo
function cargarCatalogo(productos) {
    divCatalogo.innerHTML = '';
    divCatalogo.className = 'row';
    for (const producto of productos) {
        divCatalogo.innerHTML +=  `
            <div class="card mb-3" style="max-width:700px;">
                <div class="row g-0">
                    <div class="col-md-5">
                        <img class="imagenesCatalogo" src="https://http2.mlstatic.com/D_604790-${producto.imagen}-V.webp" />
                    </div>
                    <div class="col-md-7">
                        <div class="card-body">
                            <h4>${producto.nombre} </h4>
                            <p><b>Marca:</b> ${producto.marca}</p>
                            <p><b>Total vendidos:</b> ${producto.vendidos}</p>
                            <p><b>Precio: $ ${producto.precio}</b></p>
                            <div>
                                <a href="#" class="btn btn-success botonAgregar" data-id="${producto.id}">Agregar al Carrito</a>
                            </div>   
                        </div>
                    </div>
                </div>
            </div>
        `;
        // botones agregar al carrito
        const botonesagregar = document.querySelectorAll(".botonAgregar");
        for (const botones of botonesagregar) {
            botones.addEventListener('click', (event) => {
                event.preventDefault();
                const id = (botones.dataset.id);
                const alimento = registroPorId(id);
                carrito.agregar(alimento);
                Swal.fire({
                    position: 'top',
                    title: 'Producto agregado al carrito',
                    showConfirmButton: false,
                    timer: 1000
                })
            });
        }
    }
}
// funcion de loadind para llamar antes que se carguen los productos del catálogo
function mostrarLoading() {
    Swal.fire({
        title: "Buscando Productos",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
        Swal.showLoading();
        },
    });
}
// funcion de loadind para llamar antes que se carguen los productos más vendidos
function loading(){
    Swal.fire({
        title: "Cargando productos mas vendidos",
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
        Swal.showLoading();
        },
    });
}

// elementos 
const divCatalogo = document.querySelector("#divCatalogo"); 
const divCarrito = document.querySelector('#carritoMostrar');
const spanCantidadProductos = document.querySelector('#cantidadProductos');
const spanTotalCarrito = document.querySelector('#totalCarrito');
const tituloCarrito = document.querySelector('.tituloCarrito');
const total = document.querySelector('.total');
const formBuscar = document.querySelector('#formBuscar');
const inputBuscar = document.querySelector('#inputBuscar');
const checkbox = document.querySelector('#checkbox');
const divFiltrosMarca = document.querySelector('#filtrosMarca');
const botonFiltros = document.querySelector("#filtros");
const botonCarrito = document.querySelector("#carrito");
const vaciarCarrito = document.querySelector('#vaciar');
const ordenar = document.querySelector('#seleccionar');
const pagar = document.getElementById('botonComprar');
const comprando = document.getElementById('btnSeguirComprando');

// objeto carrito
const carrito = new Carrito(); 

// Evento para eliminar todos los productos del carrito
vaciarCarrito.addEventListener('click', () => {
    carrito.vaciarCarrito();
    Swal.fire({
        position: 'top',
        title: 'Carrito eliminado',
        showConfirmButton: false,
        timer: 1000
    })
});
// Evento para reiniciar carrito al comprar
pagar.addEventListener('click', () => {
    carrito.comprarCarrito();
    Swal.fire({
        title: "¡Su compra ha sido realizada con éxito !",
        text: "Gracias por confiar en nosotros",
        icon: "success",
        confirmButtonText: "Realiza una nueva Compra",
    });
});
// eventos del buscador (busca por la descripción del producto una vez que se carga la funcion cargarCatalogo dentro de esos mismos productos cargados)
let resultados=[];
function apiProductosBusqueda(palabra) {
    // Filtra los productos por nombre o descripcion, teniendo en cuenta la palabraBusqueda
    return productos.filter((alimento) =>
        alimento.nombre && alimento.nombre.toLowerCase().includes(palabra)
    );
}
formBuscar.addEventListener('submit',(event)=>{
    event.preventDefault();
    const palabra= inputBuscar.value;
    resultados = apiProductosBusqueda(palabra.toLowerCase())
    cargarCatalogo(resultados);
})
inputBuscar.addEventListener('keyup',(event)=>{
    event.preventDefault();
    const palabra= inputBuscar.value;
    resultados = apiProductosBusqueda(palabra.toLowerCase())
    cargarCatalogo(resultados);
})

// Cargar los resultados de la busqueda
cargarCatalogo(resultados);

// función para generar las marcas de los instrumentos del catalogo para luego realizar un filtro sobre dichas marcas
function filtrosMarca(productos) {
    // Array para almacenar las marcas de productos agregados
    const marcasAgregadas = [];
    // ciclo for para buscar las marcas de los productos del catalogo y no repetir ninguna
    for (const alimento of productos) {
        if (!marcasAgregadas.includes(alimento.marca)) {
        divFiltrosMarca.innerHTML +=  
        `<div>
            <input type="checkbox" name="check" id="check">
            <label for="check">${alimento.marca}</label>
        </div>`;
        // Agregar el nombre del producto al array de nombres agregados
        marcasAgregadas.push(alimento.marca);
        }
    }
}
// Evento para desplegar los filtros generados en función filtrosMarca
botonFiltros.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".seccionFiltros").classList.toggle("desplegarFiltros");
});
// función para filtrar los productos cargagos con la funcion asincrónica "cargarCatalogo" según los filtros obtenidos por marca
function filtrarCatalogo() {
    const checkboxes = divFiltrosMarca.querySelectorAll('input[type="checkbox"]');
    // Se usa el metodo Array.from() para convertir los resultados obtenidos en un array de elementos
    const marcasFiltradas = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        // El método map recorre cada checkbox y retorna un nuevo Array con los valores de las marcas de los elementos siguientes (nextElementSibling) de los checkboxes
        .map((checkbox) => checkbox.nextElementSibling.textContent);

    if (marcasFiltradas.length === 0) {
        // Mostrar todos los productos si no hay filtros seleccionados
        cargarCatalogo(productos); 
    } else {
        const productosFiltrados = productos.filter(
            (producto) => marcasFiltradas.includes(producto.marca)
        );
        // Mostrar los productos filtrados por marca
        cargarCatalogo(productosFiltrados); 
    }
}
// Evento para llamar la función de filtrar el catálogo según marca
divFiltrosMarca.addEventListener('change', filtrarCatalogo);

// Funciones para ordenar los productos del catálogo según su precio
function mostrarProductosPorPrecioAscendente(productos) {
    const productosOrdenados = productos.slice().sort((a, b) => a.precio - b.precio);
    cargarCatalogo(productosOrdenados);
}
function mostrarProductosPorPrecioDescendente(productos) {
    const productosOrdenados = productos.slice().sort((a, b) => b.precio - a.precio);
    cargarCatalogo(productosOrdenados);
}
// Eventos para llamar a las funciones de orden de precio
ordenar.addEventListener('change', (event) => {
    event.preventDefault();
    const valorSeleccionado = ordenar.value;
    if (valorSeleccionado === 'precioMenor') {
        event.preventDefault()
        mostrarProductosPorPrecioAscendente(productos);
    } else if (valorSeleccionado === 'precioMayor') {
        mostrarProductosPorPrecioDescendente(productos); 
    } else if (valorSeleccionado === 'defecto') {
        cargarCatalogo(productos);
    }
})

const btnMasVendidos = document.querySelector('#botonMasVendidos');
// Función para encontrar los productos más vendidos de acuerdo a su cantidad
function masVendidos(productos) {
    const productosMasVendidos = productos.slice().sort((a, b) => b.vendidos - a.vendidos);
    loading();
    cargarCatalogo(productosMasVendidos.slice(0,5));
    console.log(productosMasVendidos.slice(0,5));
}
// Evento para llamar a la función de productos mas vendidos
btnMasVendidos.addEventListener('click', (event) => {
    event.preventDefault();
    masVendidos(productos);
});

const todosLosProductos= document.querySelector('#btnTodos');
// Evento para volver llamar a la función original de cargarCatalogo
btnTodos.addEventListener('click',(event) =>{
    event.preventDefault();
    mostrarLoading();
    cargarCatalogo(productos)
});



