// ===== DATOS DE EJEMPLO =====
const regionesData = {
    biobio: {
        name: "Región del Biobío",
        comunas: {
            concepcion: "Concepción",
            coronel: "Coronel",
            chiguayante: "Chiguayante",
            florida: "Florida",
            hualpen: "Hualpén",
            hualqui: "Hualqui",
            lota: "Lota",
            penco: "Penco",
            sanpedro: "San Pedro de la Paz",
            santajuana: "Santa Juana",
            talcahuano: "Talcahuano",
            tome: "Tomé"
        }
    }
};

let negociosData = [
        {
        id: 1,
        nombre: "Minimercado Mil",
        descripcion: "Panes artesanales, pastelería fina y café de especialidad.",
        categoria: "panaderia",
        comuna: "sanpedro",
        direccion: " Cangrejeras 1487, B, San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 6789 0123",
        horario: "Lun-Vie: 7:00-19:00, Sáb-Dom: 8:00-17:00",
        estado: "open",
        rating: 4.8,
        reviews: 94,
        imagen: "1mil.jpeg",
        tags: ["artesanal", "café", "repostería"],
        destacado: true
    },
    {
        id: 16,
        nombre: "Antojo Andino",
        descripcion: "Sabores andinos con preparaciones caseras y auténticas. Especialidad en masas y productos tradicionales.",
        categoria: "panaderia",
        comuna: "concepcion",
        direccion: "Hipólito Salas 570, Concepción, Chile",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Vie: 8:00-19:00, Sáb: 9:00-16:00",
        estado: "open",
        rating: 4.6,
        reviews: 89,
        imagen: "14CONCEantojoandino.jpeg",
        tags: ["pan andino", "empanadas", "dulces típicos"],
        destacado: true
    },
    {
        id: 17,
        nombre: "Tasty Market",
        descripcion: "Mercado local con productos frescos y preparados. Variedad en panadería, repostería y abarrotes.",
        categoria: "panaderia",
        comuna: "concepcion",
        direccion: "Barros Arana 255, 4030626 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Vie: 8:00-19:00, Sáb: 9:00-16:00",
        estado: "open",
        rating: 4.7,
        reviews: 54,
        imagen: "15CONCETASTYMK.jpeg",
        tags: ["pan fresco", "productos locales", "repostería"],
        destacado: true
    },
    {
        id: 2,
        nombre: "Farmacia SetopPharma",
        descripcion: "Farmacia local que ofrece medicamentos, productos de salud y atención personalizada.",
        categoria: "farmacia",
        comuna: "concepcion",
        direccion: "Barros Arana 289, 4030000 Concepción, Bío Bío",
        telefono: "(41) 252 2270",
        horario: "Lun-Jue: 9:00-18:30, Vie: 9:00-17:30, Sáb-Dom: Cerrado",
        estado: "open",
        rating: 4.4,
        reviews: 38,
        imagen: "17CONCEOPHARMA.jpeg",
        tags: ["medicamentos", "salud", "atención personalizada"],
        destacado: true
    },    
    {
        id: 3,
        nombre: "LOS HIDALGOS Mini Market",
        descripcion: "Mini market con productos de primera necesidad, abarrotes y snacks.",
        categoria: "supermercado",
        comuna: "concepcion",
        direccion: "Angol 452, 4070169 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 8:00-21:00",
        estado: "open",
        rating: 4.3,
        reviews: 22,
        imagen: "18CONCEHIDALGOS.jpeg",
        tags: ["abarrotes", "snacks", "productos frescos"],
        destacado: true
    },
    {
        id: 14,
        nombre: "FARMACIA MAICAO",
        descripcion: "Farmacia que ofrece medicamentos, productos de cuidado personal y atención personalizada.",
        categoria: "farmacia",
        comuna: "concepcion",
        direccion: "Barros Arana 419, 4030613 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Mar: 9:30-19:00, Mié-Vie: 9:30-19:00, Sáb: 10:00-15:00, Dom: Cerrado",
        estado: "open",
        rating: 4.4,
        reviews: 41,
        imagen: "25CONCEFARMACIAMAICAO.jpeg",
        tags: ["medicamentos", "cuidado personal", "farmacia"],
        destacado: true
    },
    {
    id: 15,
        nombre: "JJ CELL CONCEPCIÓN",
        descripcion: "Tienda especializada en venta y reparación de celulares, accesorios y tecnología móvil.",
        categoria: "tecnología",
        comuna: "concepcion",
        direccion: "Con carreras - Colo Colo 805, 4030000 Concepción, Bío Bío",
        telefono: "9 3126 6600",
        horario: "Lun-Mar: 10:00-20:00, Mié-Vie: 10:00-20:00, Sáb: 10:00-18:00, Dom: Cerrado",
        estado: "open",
        rating: 4.5,
        reviews: 37,
        imagen: "26CONCESERVICIOTECNICO.jpeg",
        tags: ["celulares", "accesorios", "reparación de móviles"],
        destacado: true
    },
    {
        id: 16,
        nombre: "FARMACIA CRUZ VERDE",
        descripcion: "Farmacia con amplia variedad de medicamentos, productos de cuidado personal y atención profesional.",
        categoria: "farmacia",
        comuna: "concepcion",
        direccion: "Barros Arana 472, 1111845 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Mar: 9:00-19:00, Mié-Sáb: 9:00-19:00, Dom: Cerrado",
        estado: "open",
        rating: 4.5,
        reviews: 58,
        imagen: "27CONCEFARMACIACRUZVERDE.jpeg",
        tags: ["medicamentos", "cuidado personal", "farmacia"],
        destacado: true
    },
    {
        id: 10,
        nombre: "NEW PLANET FAST FOOD",
        descripcion: "Comida rápida con variedad de hamburguesas, sándwiches y snacks, ubicada en Concepción.",
        categoria: "comida rápida",
        comuna: "concepcion",
        direccion: "Lincoyan 440, Concepción",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 10:00-18:00",
        estado: "open",
        rating: 4.4,
        reviews: 28,
        imagen: "21CONCENEWPLANET.jpeg",
        tags: ["comida rápida", "hamburguesas", "sándwiches", "snacks"],
        destacado: true
    },
    {
        id: 11,
        nombre: "Raíz Carnicería Congelados",
        descripcion: "Carnicería especializada en cortes frescos y productos congelados de calidad.",
        categoria: "carnicería",
        comuna: "concepcion",
        direccion: "Av. Los Carrera 670, 4030498 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 8:00-20:00",
        estado: "open",
        rating: 4.5,
        reviews: 40,
        imagen: "22CONCECARNICERIARAIZ.jpeg",
        tags: ["cortes frescos", "productos congelados", "carnicería"],
        destacado: true
    },
    {
        id: 12,
        nombre: "LOS PAISAS",
        descripcion: "Local de comida con variedad de platos típicos, ofreciendo sabor y tradición en Concepción.",
        categoria: "comida rápida",
        comuna: "concepcion",
        direccion: "Castellón 805, Concepción",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 10:00-22:00",
        estado: "open",
        rating: 4.4,
        reviews: 35,
        imagen: "23CONCELOSPAISAS.jpeg",
        tags: ["comida rápida", "platos típicos", "sabor local"],
        destacado: true
    },
    {
    id: 13,
        nombre: "FERRETERÍA JAZMÍN",
        descripcion: "Ferretería con amplia variedad de herramientas, materiales y productos para el hogar.",
        categoria: "ferretería",
        comuna: "concepcion",
        direccion: "Av. Los Carrera 777, 4030000 Concepción, Bío Bío",
        telefono: "9 7721 8658",
        horario: "Lun-Mar: 10:00-19:00, Mié-Vie: 10:00-19:00, Sáb: 10:00-15:00, Dom: Cerrado",
        estado: "open",
        rating: 4.5,
        reviews: 52,
        imagen: "24CONCEFERRETERIAJAZMIN.jpeg",
        tags: ["herramientas", "materiales", "ferretería"],
        destacado: true
    },
    {
        id: 4,
        nombre: "Farmacia Cruz Verde San Pedro",
        descripcion: "Farmacia de barrio con atención personalizada y productos de calidad.",
        categoria: "farmacia",
        comuna: "sanpedro",
        direccion: "Av. Padre Hurtado 890",
        telefono: "+56 9 3456 7890",
        horario: "Lun-Vie: 8:30-20:00, Sáb: 9:00-18:00",
        estado: "open",
        rating: 4.7,
        reviews: 89,
        imagen: "4farmaciacruzverdesp.jpg",
        tags: ["medicamentos", "cosmética", "cuidado personal"],
        destacado: false
    },
    {
        id: 5,
        nombre: "Veterinaria San Pedro",
        descripcion: "Atención veterinaria profesional, productos y accesorios para tus mascotas.",
        categoria: "veterinaria",
        comuna: "sanpedro",
        direccion: "Av. Los Carrera 1250",
        telefono: "+56 9 8765 4321",
        horario: "Lun-Vie: 9:00-19:00, Sáb: 10:00-14:00",
        estado: "open",
        rating: 4.8,
        reviews: 56,
        imagen: "3veterinariasp.jpeg",
        tags: ["veterinaria", "mascotas", "accesorios", "alimentos"],
        destacado: true
    },
    {
        id: 6,
        nombre: "EMPORIO AGRÍCOLA BOTILLERÍA",
        descripcion: "Botillería y emporio con gran variedad de bebidas, productos agrícolas y alimentos.",
        categoria: "supermercado",
        comuna: "concepcion",
        direccion: "Libertador Gral. Bernardo O'Higgins 302, 4030000 Concepción, Bío Bío",
        telefono: "9 8987 8105",
        horario: "Lun-Dom: 7:00-3:00",
        estado: "open",
        rating: 4.5,
        reviews: 46,
        imagen: "19CONCEEMPORIOAGRICOLA.jpeg",
        tags: ["bebidas", "alimentos", "productos agrícolas"],
        destacado: true
    },
    {
        id: 9,
        nombre: "DORI LOCURA",
        descripcion: "Comida rápida estilo mexicano: quesadillas, tacos, flautas y más, servido desde carrito en Concepción.",
        categoria: "comida rápida",
        comuna: "concepcion",
        direccion: "Concepción (Carrito Móvil)",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 11:00-22:00",
        estado: "open",
        rating: 4.6,
        reviews: 31,
        imagen: "20CONCEDORYLOCURA.jpeg",
        tags: ["comida rápida", "mexicana", "quesadillas", "tacos", "flautas"],
        destacado: true
    },
    {
        id: 7,
        nombre: "Supermercado El Sauco",
        descripcion: "Jugos naturales, bebidas heladas y alimentos para toda la familia. Calidad y frescura con la tradición de siempre.",
        categoria: "carniceria",
        comuna: "sanpedro",
        direccion: "El Sauco 1113, 4130476 San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 XXXXXX",
        horario: "Lun-Vie: :09-21:00, Dom: 10:00-19:00",
        estado: "open",
        rating: 4.9,
        reviews: 78,
        imagen: "2sauco.jpeg",
        tags: ["liquidos", "embutidos", "pollo"],     
        destacado: false
    },
    {
        id: 15,
        nombre: "Kamassu",
        descripcion: "Restaurante con especialidad en comida internacional y un ambiente acogedor.",
        categoria: "restaurante",
        comuna: "sanpedro",
        direccion: "Los Raulíes 1501, 4131129 San Pedro de la Paz, Bío Bío",
        telefono: null,
        horario: "Lun-Dom: 12:30-23:00",
        estado: "open",
        rating: 4.7,
        reviews: 62,
        imagen: "12kamasu.jpeg",
        tags: ["restaurante", "comida internacional", "cenas", "almuerzos"],
        destacado: true
    },
    {
        id: 16,
        nombre: "El Dinosaurio",
        descripcion: "Restaurante familiar con comidas rápidas, pizzas y platos para compartir.",
        categoria: "restaurante",
        comuna: "sanpedro",
        direccion: "Ambrosio O'Higgins 1521, 4130466 San Pedro de la Paz, Bío Bío",
        telefono: null,
        horario: "Lun-Dom: 12:00-23:00",
        estado: "open",
        rating: 4.5,
        reviews: 58,
        imagen: "13dinosaurio.png",
        tags: ["restaurante", "comida rápida", "pizzas", "familiar"],
        destacado: true
    },
    {
        id: 17,
        nombre: "Sultan Market",
        descripcion: "Mercado de especialidades con productos frescos y sabores internacionales.",
        categoria: "panaderia",
        comuna: "concepcion",
        direccion: "Barros Arana 288, 4030000 Concepción, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Mar: 8:00-21:00, Mié-Vie: 8:00-21:00, Sáb: 9:00-20:30, Dom: 11:00-20:00",
        estado: "open",
        rating: 4.5,
        reviews: 73,
        imagen: "16CONCESULTAN.jpeg",
        tags: ["productos internacionales", "mercado local", "panadería"],
        destacado: false
    },

    {
        id: 8,
        nombre: "Ferretería Ferremed",
        descripcion: "Todo en herramientas, materiales de construcción y artículos para el hogar.",
        categoria: "ferreteria",
        comuna: "sanpedro",
        direccion: "VILLA EL CONQUISTADOR - Las Torcazas 1992, San Pedro de la Paz, Bío Bío",
        telefono: "(41)237 2990",
        horario: "Lun-Vie: 9:30-18:30, Sáb: 9:30-14:00",
        estado: "open",
        rating: 4.6,
        reviews: 73,
        imagen: "5ferremed.png",
        tags: ["herramientas", "construcción", "hogar", "materiales"],
        destacado: false
    },
    {
        id: 9,
        nombre: "Minisupermercado La Pulpería Alemana",
        descripcion: "Variedad en alimentos, bebidas, abarrotes y productos importados.",
        categoria: "Minisupermercado",
        comuna: "sanpedro",
        direccion: "Los Mañíos 1778, 4130306 San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 6677 8899",
        horario: "Lun-Dom: 9:00-21:00",
        estado: "open",
        rating: 4.5,
        reviews: 64,
        imagen: "6minipulperia.jpeg",
        tags: ["alimentos", "bebidas", "abarrotes", "productos importados"],
        destacado: true
    },
    {
        id: 10,
        nombre: "Villa Market",
        descripcion: "Minimarket de barrio con abarrotes, bebidas y productos para el día a día.",
        categoria: "supermercado",
        comuna: "sanpedro",
        direccion: "Los Peumos 41, 4030000 San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 7699 0943",
        horario: "Lun-Dom: 9:00-21:00",
        estado: "open",
        rating: 4.4,
        reviews: 38,
        imagen: "7villamarket.jpeg",
        tags: ["abarrotes", "bebidas", "snacks", "productos de barrio"],
        destacado: false
    },
    {
        id: 11,
        nombre: "Peluquería Martel",
        descripcion: "Estilo, cuidado personal y atención profesional en peluquería y estética.",
        categoria: "peluqueria",
        comuna: "sanpedro",
        direccion: "Los Mañíos 1776, 4130306 Concepción, San Pedro de la Paz, Bío Bío",
        telefono: "+56 9 9152 0171",
        horario: "Lun-Sáb: 10:00-20:00",
        estado: "open",
        rating: 4.7,
        reviews: 45,
        imagen: "8peluqueriamartel.jpeg",
        tags: ["peluquería", "estética", "corte de cabello", "belleza"],
        destacado: true
    },
    {
        id: 12,
        nombre: "Farmacia La Pharma",
        descripcion: "Farmacia local con atención cercana y amplia variedad de medicamentos y productos de salud.",
        categoria: "farmacia",
        comuna: "sanpedro",
        direccion: "Los Benedictinos 57, 4030000 San Pedro de la Paz, Bío Bío",
        telefono: "(2) 2228 3415",
        horario: "Lun-Vie: 9:00-20:00, Sáb: 9:30-14:00",
        estado: "open",
        rating: 4.6,
        reviews: 51,
        imagen: "9lapharma.jpeg",
        tags: ["medicamentos", "salud", "cuidado personal", "bienestar"],
        destacado: false
    },
    {
        id: 13,
        nombre: "Panadería Los Ciervos",
        descripcion: "Pan fresco, pasteles y repostería artesanal todos los días.",
        categoria: "panaderia",
        comuna: "sanpedro",
        direccion: "Los Peumos 42, 4130288 San Pedro de la Paz, Bío Bío",
        telefono: null,
        horario: "Lun-Dom: 7:30-21:00",
        estado: "open",
        rating: 4.5,
        reviews: 34,
        imagen: "10panaderialosciervos.jpeg",
        tags: ["pan fresco", "pasteles", "repostería", "artesanal"],
        destacado: true
    },
    {
        id: 14,
        nombre: "Panadería Laguna",
        descripcion: "Pan, amasados y repostería fresca con sabor casero todos los días.",
        categoria: "panaderia",
        comuna: "sanpedro",
        direccion: "Pasaje Uno 6, San Pedro de la Paz, Bío Bío",
        telefono: null,
        horario: "Lun-Dom: 7:30-21:00",
        estado: "open",
        rating: 4.4,
        reviews: 27,
        imagen: "11panaderialaguna.jpeg",
        tags: ["pan", "amasados", "repostería", "fresco"],
        destacado: false
    },
        {
        id: 5,
        nombre: "Nafita",
        descripcion: "Restaurante local con un ambiente acogedor, ideal para disfrutar comidas caseras y reuniones familiares.",
        categoria: "restaurante",
        comuna: "chiguayante",
        direccion: "Los Aromos 598, 4111147 Chiguayante, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Sáb: 10:30-23:00, Dom: 10:30-15:00",
        estado: "open",
        rating: 4.6,
        reviews: 78,
        imagen: "31CHINAFITA.png",
        tags: ["comida casera", "almuerzos", "cenas", "familiar"],
        destacado: true
    },
    {
        id: 2,
        nombre: "Salón de Belleza Rossy",
        descripcion: "Servicios de peluquería, estética y cuidado personal en un ambiente acogedor y profesional.",
        categoria: "belleza",
        comuna: "chiguayante",
        direccion: "Av. Manuel Rodríguez 1898, 4110372 Chiguayante, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Sáb: 9:00-19:00",
        estado: "open",
        rating: 4.8,
        reviews: 120,
        imagen: "28CHISALONBELLEZAROSSY.png",
        tags: ["peluquería", "manicure", "tratamientos faciales", "estética"],
        destacado: true
    },
    {
        id: 3,
        nombre: "MEI",
        descripcion: "Restaurante con cocina tradicional y toques contemporáneos, ideal para compartir en familia o con amigos.",
        categoria: "restaurante",
        comuna: "chiguayante",
        direccion: "Av. O'Higgins 2362-2398, Chiguayante, Bío Bío",
        telefono: "+56 41 236 0582",
        horario: "Lun-Sáb: 9:00-20:30, Dom: 9:00-14:00",
        estado: "open",
        rating: 4.7,
        reviews: 95,
        imagen: "29CHIMEI.png",
        tags: ["cocina chilena", "almuerzos", "cena familiar"],
        destacado: true
    },
    {
        id: 4,
        nombre: "Minimarket Belén",
        descripcion: "Almacén de barrio con variedad de productos de abarrotes, bebidas, snacks y artículos de uso diario.",
        categoria: "minimarket",
        comuna: "chiguayante",
        direccion: "Central 2300-2386, Chiguayante, Bío Bío",
        telefono: "+56 9 0000 0000",
        horario: "Lun-Dom: 9:00-22:00",
        estado: "open",
        rating: 4.5,
        reviews: 60,
        imagen: "30CHIMINIBELEN.png",
        tags: ["abarrotes", "snacks", "bebidas", "productos de diario"],
        destacado: false
    },
    {
        id: 6,
        nombre: "Abarrotes Cobquecura",
        descripcion: "Minimarket de barrio con amplia variedad de abarrotes, frutas, verduras y productos de uso diario.",
        categoria: "minimarket",
        comuna: "talcahuano",
        direccion: "Dos Pte. 6344, 4300100 Talcahuano, Bío Bío",
        telefono: "+56 41 243 5289",
        horario: "Lun-Dom: 9:30-19:00",
        estado: "open",
        rating: 4.4,
        reviews: 52,
        imagen: "32TALCROSTISERIACOBQUECURA.png",
        tags: ["abarrotes", "frutas", "verduras", "productos de diario"],
        destacado: false
    },
    {
        id: 11,
        nombre: "Supermercado El Sauce",
        descripcion: "Supermercado local que ofrece abarrotes, frutas, verduras y productos esenciales con atención cercana al barrio.",
        categoria: "supermercado",
        comuna: "talcahuano",
        direccion: "Río Maule 5169, 4290298 Talcahuano, Bío Bío",
        telefono: "+56 41 297 3822",
        horario: "Lun-Sáb: 9:00-14:30, 16:30-23:00; Dom: 9:00-14:30",
        estado: "open",
        rating: 4.6,
        reviews: 73,
        imagen: "37TALELSAUCE.png",
        tags: ["abarrotes", "frutas", "verduras", "productos de diario"],
        destacado: true
    },
    {
        id: 7,
        nombre: "Supermercado Martita",
        descripcion: "Supermercado local con variedad de abarrotes, bebidas, productos de limpieza y artículos de uso diario.",
        categoria: "supermercado",
        comuna: "talcahuano",
        direccion: "Jaime Repullo 2513, 2493, Talcahuano, Bío Bío",
        telefono: "+56 9 7752 5247",
        horario: "Lun-Dom: 8:00-22:55",
        estado: "open",
        rating: 4.5,
        reviews: 110,
        imagen: "33TALCSUPERMARTITA.png",
        tags: ["abarrotes", "bebidas", "productos de limpieza", "uso diario"],
        destacado: true
    },
    {
        id: 8,
        nombre: "Comercializadora Matías",
        descripcion: "Local de distribución y venta de abarrotes, bebidas y productos básicos para el hogar.",
        categoria: "comercializadora",
        comuna: "talcahuano",
        direccion: "Juan Guillermo Sosa 777, Talcahuano, Bío Bío",
        telefono: "+56 41 328 9717",
        horario: "Lun-Dom: 8:00-21:00",
        estado: "open",
        rating: 4.3,
        reviews: 47,
        imagen: "34TALCCOMERCIALIZADORAMATIAS.png",
        tags: ["abarrotes", "bebidas", "productos básicos"],
        destacado: false
    },
    {
        id: 9,
        nombre: "Panadería y Abarrotes Las Canchas",
        descripcion: "Panadería tradicional con variedad de panes frescos, repostería y abarrotes para el día a día.",
        categoria: "panadería",
        comuna: "talcahuano",
        direccion: "Michimalongo 3155-3195, 4260126 Talcahuano, Bío Bío",
        telefono: "+56 41 227 3233",
        horario: "Lun-Sáb: 9:00-20:00, Dom: 9:00-18:30",
        estado: "open",
        rating: 4.5,
        reviews: 65,
        imagen: "35TALCLASCANCHAS.png",
        tags: ["pan fresco", "repostería", "abarrotes"],
        destacado: true
    },
    {
        id: 10,
        nombre: "Supermercado El Ahorro",
        descripcion: "Supermercado de barrio con abarrotes, frutas, verduras y productos de uso cotidiano a buen precio.",
        categoria: "supermercado",
        comuna: "talcahuano",
        direccion: "Río Nvo, Talcahuano, Bío Bío",
        telefono: "+56 9 5538 6400",
        horario: "Lun-Dom: 9:00-20:30",
        estado: "open",
        rating: 4.4,
        reviews: 88,
        imagen: "36TALCELAHORRO.png",
        tags: ["abarrotes", "frutas", "verduras", "productos de diario"],
        destacado: true
    },
    {
        id: 11,
        nombre: "Botillería y Abarrotes La Esquina S.O.S.",
        descripcion: "Botillería y almacén de barrio con abarrotes y bebidas para todo tipo de ocasiones.",
        categoria: "botillería",
        comuna: "coronel",
        direccion: "Calle Catapilco 4053, 4190000 Coronel, Bío Bío",
        telefono: "+56 9 9152 1146",
        horario: "Mié-Jue: 10:00-21:30, Vie-Sáb: 10:00-02:00, Dom: Cerrado, Lun-Mar: 10:00-21:30",
        estado: "open",
        rating: 4.5,
        reviews: 64,
        imagen: "38CORBOTILLERIALAESQUINA.png",
        tags: ["abarrotes", "bebidas", "botillería", "productos de diario"],
        destacado: true
    },
    {
        id: 12,
        nombre: "Guatón De La Fruta",
        descripcion: "Frutería y almacén de barrio con frutas frescas, abarrotes y productos variados para el hogar.",
        categoria: "frutería",
        comuna: "coronel",
        direccion: "Carlos Barrientos 1115, Coronel, Bío Bío",
        telefono: "+56 41 271 2434",
        horario: "Lun-Dom: 9:30-00:00",
        estado: "open",
        rating: 4.6,
        reviews: 72,
        imagen: "39CORGUATONDELAFRUTA.png",
        tags: ["frutas", "verduras", "abarrotes", "productos frescos"],
        destacado: true
    },
    {
        id: 13,
        nombre: "Provisiones Ignacia",
        descripcion: "Almacén de barrio con abarrotes y productos básicos disponible las 24 horas.",
        categoria: "almacén",
        comuna: "coronel",
        direccion: "4192285 Coronel, Bío Bío",
        telefono: "",
        horario: "Lun-Dom: Abierto 24 horas",
        estado: "open",
        rating: 4.3,
        reviews: 51,
        imagen: "40CORPROVICIONESIGNACIA.png",
        tags: ["abarrotes", "productos de diario", "24 horas"],
        destacado: true
    },
    {
        id: 14,
        nombre: "Negocio Don Gastón",
        descripcion: "Negocio de barrio con abarrotes, productos básicos y atención cercana a la comunidad.",
        categoria: "almacén",
        comuna: "coronel",
        direccion: "Av. Manuel Montt, Población Villa Alegre, 1400000 Coronel, Bío Bío",
        telefono: "+56 9 9053 4544",
        horario: "Lun: 9:00-00:00, Mar: 00:00-07:30 y 09:00-19:30, Mié-Sáb: 09:00-19:30, Dom: 09:00-17:00",
        estado: "open",
        rating: 4.4,
        reviews: 67,
        imagen: "41CORDONGASTON.png",
        tags: ["abarrotes", "productos de diario", "almacén"],
        destacado: true
    },
    {
        id: 15,
        nombre: "Minimarket Los Molineros",
        descripcion: "Minimarket de barrio con abarrotes, bebidas y productos básicos para el hogar.",
        categoria: "minimarket",
        comuna: "coronel",
        direccion: "Los Molineros 136, 4190133, Coronel, Bío Bío",
        telefono: "",
        horario: "No informado",
        estado: "open",
        rating: 4.2,
        reviews: 40,
        imagen: "42CORLOSMOLINEROS.png",
        tags: ["abarrotes", "minimarket", "productos de diario"],
        destacado: true
    },
    {
        id: 18,
        nombre: "La Negrita",
        descripcion: "Almacén de barrio con abarrotes, víveres y productos de uso diario.",
        categoria: "almacén",
        comuna: "santajuana",
        direccion: "José Cardenio Avello 298, Santa Juana, Bío Bío",
        telefono: "+56 41 277 9220",
        horario: "Lun-Sáb: 08:30-21:00, Dom: 09:00-12:00",
        estado: "open",
        rating: 4.5,
        reviews: 62,
        imagen: "43SANTALANEGRITA.png",
        tags: ["abarrotes", "víveres", "productos de diario"],
        destacado: true
    },
    {
        id: 17,
        nombre: "Tienda de abarrotes y víveres",
        descripcion: "Almacén de barrio con abarrotes, víveres y productos básicos para el hogar.",
        categoria: "almacén",
        comuna: "santajuana",
        direccion: "Aníbal Pinto, Santa Juana, Bío Bío",
        telefono: "",
        horario: "Lun-Dom: 09:00-21:00",
        estado: "open",
        rating: 4.4,
        reviews: 48,
        imagen: "43SANJALMACENSANTAELENA.png",
        tags: ["abarrotes", "víveres", "productos de diario"],
        destacado: true
    }

];

// ===== ESTADO DE LA APLICACIÓN =====
let currentComuna = null;
let filteredStores = [];
let currentView = 'grid'; // Nueva variable para la vista actual

// ===== ELEMENTOS DEL DOM =====
const regionSelect = document.getElementById('regionSelect');
const comunaSelect = document.getElementById('comunaSelect');
const findStoresBtn = document.getElementById('findStoresBtn');
const searchFilters = document.getElementById('searchFilters');
const searchInput = document.getElementById('searchInput');
const storesGrid = document.getElementById('storesGrid');
const emptyState = document.getElementById('emptyState');
const currentLocation = document.getElementById('currentLocation');
const storesTitle = document.getElementById('storesTitle');
const themeToggle = document.getElementById('themeToggle');
const filterTags = document.querySelectorAll('.filter-tag');
const viewBtns = document.querySelectorAll('.view-btn'); // Nuevos botones de vista

// ===== FUNCIONES DE INICIALIZACIÓN =====
function initializeApp() {
    setupEventListeners();
    loadTheme();
    loadStoredImages();
    loadPreferredView(); // Cargar la vista preferida del usuario
}

function setupEventListeners() {
    regionSelect.addEventListener('change', handleRegionChange);
    findStoresBtn.addEventListener('click', handleFindStores);
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => handleFilterChange(tag));
    });

    // Nuevos event listeners para los botones de vista
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => handleViewChange(btn));
    });
}

// ===== MANEJO DE VISTAS =====
function handleViewChange(clickedBtn) {
    // Remover active de todos los botones
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    // Agregar active al botón clickeado
    clickedBtn.classList.add('active');
    
    // Actualizar la vista actual
    currentView = clickedBtn.dataset.view;
    
    // Re-renderizar las tarjetas para la nueva vista
    if (filteredStores.length > 0) {
        displayStores(filteredStores);
    }
    
    // Guardar preferencia
    localStorage.setItem('preferredView', currentView);
}

function applyCurrentView() {
    // Remover todas las clases de vista
    storesGrid.classList.remove('list-view', 'compact-view');
    
    // Aplicar la clase de vista actual
    if (currentView === 'list') {
        storesGrid.classList.add('list-view');
    } else if (currentView === 'compact') {
        storesGrid.classList.add('compact-view');
    }
}

function loadPreferredView() {
    const savedView = localStorage.getItem('preferredView') || 'grid';
    currentView = savedView;
    
    // Actualizar botón activo
    viewBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === savedView) {
            btn.classList.add('active');
        }
    });
    
    // Aplicar vista si hay tiendas cargadas
    if (filteredStores.length > 0) {
        applyCurrentView();
    }
}

// ===== NUEVA FUNCIONALIDAD DE SUBIDA DE IMÁGENES =====
function createImageUploadInput(storeId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'image-file-input';
    input.onchange = (e) => handleImageUpload(e, storeId);
    return input;
}

function handleImageUpload(event, storeId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona solo archivos de imagen', 'error');
        return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen es muy grande. Máximo 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Actualizar el negocio con la nueva imagen
        const storeIndex = negociosData.findIndex(store => store.id === storeId);
        if (storeIndex !== -1) {
            negociosData[storeIndex].imagen = imageData;
            
            // Guardar en localStorage para persistencia
            saveImageToStorage(storeId, imageData);
            
            // Actualizar la visualización
            updateStoreImage(storeId, imageData);
            
            showToast('Imagen actualizada correctamente', 'success');
        }
    };
    
    reader.readAsDataURL(file);
}

function updateStoreImage(storeId, imageData) {
    const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
    if (storeCard) {
        const imageContainer = storeCard.querySelector('.store-image');
        imageContainer.innerHTML = `
            <img src="${imageData}" alt="Imagen del local">
            <div class="store-status ${getStoreById(storeId).estado}">
                ${getStoreById(storeId).estado === 'open' ? 'Abierto' : 'Cerrado'}
            </div>
            <div class="image-upload-overlay">
                <i class="fas fa-camera"></i>
                <div class="upload-text">Cambiar imagen</div>
            </div>
        `;
    }
}

function saveImageToStorage(storeId, imageData) {
    try {
        localStorage.setItem(`store_image_${storeId}`, imageData);
    } catch (error) {
        console.warn('No se pudo guardar la imagen en localStorage:', error);
    }
}

function loadStoredImages() {
    negociosData.forEach(store => {
        try {
            const storedImage = localStorage.getItem(`store_image_${store.id}`);
            if (storedImage) {
                store.imagen = storedImage;
            }
        } catch (error) {
            console.warn('Error cargando imagen almacenada:', error);
        }
    });
}

function getStoreById(storeId) {
    return negociosData.find(store => store.id === storeId);
}

// ===== MANEJO DE REGIONES Y COMUNAS =====
function handleRegionChange() {
    const selectedRegion = regionSelect.value;
    
    if (selectedRegion && regionesData[selectedRegion]) {
        populateComunaSelect(regionesData[selectedRegion].comunas);
        comunaSelect.disabled = false;
    } else {
        comunaSelect.innerHTML = '<option value="">Primero selecciona una región</option>';
        comunaSelect.disabled = true;
    }
}

function populateComunaSelect(comunas) {
    comunaSelect.innerHTML = '<option value="">Selecciona una comuna</option>';
    
    Object.entries(comunas).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = value;
        comunaSelect.appendChild(option);
    });
}

// ===== BÚSQUEDA DE NEGOCIOS =====
function handleFindStores() {
    const selectedRegion = regionSelect.value;
    const selectedComuna = comunaSelect.value;
    
    if (!selectedRegion || !selectedComuna) {
        showToast('Por favor selecciona región y comuna', 'warning');
        return;
    }
    
    currentComuna = selectedComuna;
    updateLocationIndicator(selectedRegion, selectedComuna);
    loadStores();
    showSearchFilters();
}

function updateLocationIndicator(region, comuna) {
    const regionName = regionesData[region].name;
    const comunaName = regionesData[region].comunas[comuna];
    currentLocation.textContent = `${comunaName}, ${regionName}`;
}

function showSearchFilters() {
    searchFilters.style.display = 'block';
    searchFilters.scrollIntoView({ behavior: 'smooth' });
}

// ===== CARGA Y FILTRADO DE NEGOCIOS =====
function loadStores() {
    filteredStores = negociosData.filter(negocio => negocio.comuna === currentComuna);
    displayStores(filteredStores);
    updateStoresTitle();
}

function displayStores(stores) {
    if (stores.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    storesGrid.innerHTML = stores.map(store => createStoreCard(store)).join('');
    
    // Aplicar la vista actual después de cargar las tiendas
    applyCurrentView();
    
    attachStoreEventListeners();
}

function createStoreCard(store) {
    const starsHtml = createStarsHTML(store.rating);
    const tagsHtml = store.tags.map(tag => `<span class="store-tag">${tag}</span>`).join('');
    
    // Generar overlay de imagen basado en si tiene imagen o no
    const imageOverlay = store.imagen ? 
        `<div class="image-upload-overlay">
            <i class="fas fa-camera"></i>
            <div class="upload-text">Cambiar imagen</div>
            <div class="image-actions">
                <button class="btn-image-action" onclick="event.stopPropagation(); triggerImageUpload(${store.id})">
                    <i class="fas fa-upload"></i>
                    Cambiar
                </button>
                <button class="btn-image-action btn-delete-image" onclick="event.stopPropagation(); deleteStoreImage(${store.id})">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>` :
        `<div class="image-upload-overlay">
            <i class="fas fa-camera"></i>
            <div class="upload-text">Subir imagen</div>
        </div>`;

    // Estructura base para vista compacta
    if (currentView === 'compact') {
        return `
            <div class="store-card" data-store-id="${store.id}">
                <div class="store-image" onclick="triggerImageUpload(${store.id})">
                    ${store.imagen ? 
                        `<img src="${store.imagen}" alt="${store.nombre}">` : 
                        '<i class="fas fa-store"></i>'
                    }
                    ${imageOverlay}
                </div>
                <div class="store-info">
                    <div class="store-main-info">
                        <h3 class="store-name">${store.nombre}</h3>
                        <p class="store-description">${store.descripcion}</p>
                        <div class="store-rating">
                            ${starsHtml}
                            <span>${store.rating}</span>
                            <span>(${store.reviews})</span>
                        </div>
                    </div>
                    <div class="store-meta">
                        <div class="store-status ${store.estado}">
                            ${store.estado === 'open' ? 'Abierto' : 'Cerrado'}
                        </div>
                    </div>
                    <div class="store-actions">
                        <button class="btn-view-store" onclick="viewStore(${store.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Ver Tienda
                        </button>
                        <button class="btn-favorite" onclick="toggleFavorite(${store.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Estructura para vistas grid y lista (similar layout)
    return `
        <div class="store-card" data-store-id="${store.id}">
            <div class="store-image" onclick="triggerImageUpload(${store.id})">
                ${store.imagen ? 
                    `<img src="${store.imagen}" alt="${store.nombre}">` : 
                    '<i class="fas fa-store"></i>'
                }
                <div class="store-status ${store.estado}">
                    ${store.estado === 'open' ? 'Abierto' : 'Cerrado'}
                </div>
                ${imageOverlay}
            </div>
            <div class="store-info">
                <div class="store-header">
                    <div>
                        <h3 class="store-name">${store.nombre}</h3>
                        <div class="store-rating">
                            ${starsHtml}
                            <span>${store.rating}</span>
                            <span>(${store.reviews})</span>
                        </div>
                    </div>
                </div>
                <p class="store-description">${store.descripcion}</p>
                <div class="store-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${store.direccion}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${store.horario}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${store.telefono}</span>
                    </div>
                </div>
                <div class="store-tags">
                    ${tagsHtml}
                </div>
                <div class="store-actions">
                    <button class="btn-view-store" onclick="viewStore(${store.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Ver Tienda
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${store.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function triggerImageUpload(storeId) {
    // Crear y activar input de archivo
    const input = createImageUploadInput(storeId);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function deleteStoreImage(storeId) {
    // Confirmar antes de eliminar
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        return;
    }

    // Actualizar el negocio removiendo la imagen
    const storeIndex = negociosData.findIndex(store => store.id === storeId);
    if (storeIndex !== -1) {
        negociosData[storeIndex].imagen = null;
        
        // Remover de localStorage
        removeImageFromStorage(storeId);
        
        // Actualizar la visualización
        resetStoreImage(storeId);
        
        showToast('Imagen eliminada correctamente', 'success');
    }
}

function resetStoreImage(storeId) {
    const storeCard = document.querySelector(`[data-store-id="${storeId}"]`);
    if (storeCard) {
        const imageContainer = storeCard.querySelector('.store-image');
        imageContainer.innerHTML = `
            <i class="fas fa-store"></i>
            <div class="store-status ${getStoreById(storeId).estado}">
                ${getStoreById(storeId).estado === 'open' ? 'Abierto' : 'Cerrado'}
            </div>
            <div class="image-upload-overlay">
                <i class="fas fa-camera"></i>
                <div class="upload-text">Subir imagen</div>
            </div>
        `;
    }
}

function removeImageFromStorage(storeId) {
    try {
        localStorage.removeItem(`store_image_${storeId}`);
    } catch (error) {
        console.warn('No se pudo eliminar la imagen de localStorage:', error);
    }
}

function createStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    return starsHTML;
}

function attachStoreEventListeners() {
    // Los event listeners se manejan con onclick en el HTML para simplificar
}

// ===== FUNCIONES DE INTERACCIÓN =====
// **FUNCIÓN MODIFICADA PRINCIPAL** 
function viewStore(storeId) {
    // Buscar la información del negocio seleccionado
    const negocio = negociosData.find(store => store.id === storeId);
    
    if (!negocio) {
        console.error('Negocio no encontrado:', storeId);
        showToast('Error: No se pudo encontrar la información del negocio', 'error');
        return;
    }
    
    // Guardar información del negocio en localStorage para persistencia
    const negocioInfo = {
        id: negocio.id,
        nombre: negocio.nombre,
        descripcion: negocio.descripcion,
        categoria: negocio.categoria,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        horario: negocio.horario,
        rating: negocio.rating,
        reviews: negocio.reviews
    };
    
    try {
        localStorage.setItem('negocioSeleccionado', JSON.stringify(negocioInfo));
        console.log('✅ Información del negocio guardada:', negocioInfo);
    } catch (error) {
        console.warn('⚠️ No se pudo guardar en localStorage:', error);
    }
    
    // Redirigir a negocio-index.html con parámetros en la URL como respaldo
    const params = new URLSearchParams({
        storeId: negocio.id,
        storeName: negocio.nombre,
        storeCategory: negocio.categoria
    });
    
    // Mostrar feedback al usuario
    showToast(`Accediendo a ${negocio.nombre}...`, 'info');
    
    // Pequeño delay para que el usuario vea el feedback
    setTimeout(() => {
        window.location.href = `negocio-index.html?${params.toString()}`;
    }, 800);
}

function toggleFavorite(storeId) {
    const btn = event.target.closest('.btn-favorite');
    btn.classList.toggle('active');
    
    const action = btn.classList.contains('active') ? 'agregado a' : 'removido de';
    showToast(`Negocio ${action} favoritos`, 'success');
}

// ===== BÚSQUEDA Y FILTROS =====
function handleSearch() {
    displayStores(getFilteredStores());
}

function handleFilterChange(clickedTag) {
    // Remover active de todos los tags
    filterTags.forEach(tag => tag.classList.remove('active'));
    
    // Agregar active al tag clickeado
    clickedTag.classList.add('active');
    
    // Ejecutar búsqueda con nuevo filtro
    handleSearch();
}

function getFilteredStores() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-tag.active').dataset.category;
    
    return filteredStores.filter(store => {
        const matchesSearch = store.nombre.toLowerCase().includes(searchTerm) ||
                            store.descripcion.toLowerCase().includes(searchTerm) ||
                            store.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesCategory = activeCategory === 'all' || store.categoria === activeCategory;
        
        return matchesSearch && matchesCategory;
    });
}

// ===== UTILIDADES =====
function showEmptyState() {
    storesGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

function hideEmptyState() {
    storesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
}

function updateStoresTitle() {
    const comunaName = regionesData.biobio.comunas[currentComuna];
    storesTitle.textContent = `Negocios en ${comunaName}`;
}

function showToast(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${getToastIcon(type)}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };
    return icons[type] || icons.info;
}

// ===== TEMA OSCURO/CLARO =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizar icono
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initializeApp);
// En la función setupEventListeners(), agregar:
let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    const header = document.querySelector('.main-header');
    
    if (window.innerWidth <= 768) { // Solo en móvil
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
            // Scrolling hacia abajo - ocultar cabecera
            header.classList.add('hidden');
        } else {
            // Scrolling hacia arriba - mostrar cabecera
            header.classList.remove('hidden');
        }
    } else {
        // En desktop, siempre mostrar
        header.classList.remove('hidden');
    }
    
    lastScrollY = window.scrollY;
    ticking = false;
}

function onScroll() {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll);
function miFuncionLocal() {
    console.log("versión local");
}
function miFuncionRemota() {
    console.log("versión remota");
}

