/* =========================================================
   A&M Universe · interacciones
   Tema (claro/oscuro), idioma (ES/EN), WhatsApp, menú, reveal
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "573215799683"; // +57 321 579 9683

  /* ---------- Traducciones ---------- */
  var I18N = {
    es: {
      "shop.size": "Talla", "nav.faq": "FAQ",
      "fit.regular": "Regular fit", "fit.oversized": "Oversized",
      "pay.label": "Método de pago", "pay.nequi": "Nequi", "pay.daviplata": "Daviplata",
      "pay.breb": "Bre-B", "pay.transfer": "Transferencia", "pay.cod": "Contra entrega",
      "faq.eyebrow": "Preguntas frecuentes", "faq.title": "Resolvemos tus dudas",
      "faq.q1": "¿Hacen envíos a toda Colombia?", "faq.a1": "Sí. Estamos en Calarcá, Quindío y enviamos a todas las ciudades del país. Coordinamos el envío contigo por WhatsApp.",
      "faq.q2": "¿Qué tallas manejan?", "faq.a2": "Nuestras camisetas están disponibles en tallas S, M, L y XL. Si tienes dudas con tu talla, escríbenos y te asesoramos.",
      "faq.q3": "¿Cómo pago mi pedido?", "faq.a3": "Aceptamos Nequi, Daviplata y Bre-B (al 321 579 9683), transferencia bancaria y contra entrega según tu ciudad. Eliges el método en el carrito y coordinamos todo por WhatsApp. Fácil y seguro.",
      "faq.q4": "¿Cómo ayuda mi compra a los animales?", "faq.a4": "Un porcentaje de cada venta se destina a fundaciones y a los animales de la calle: comida, cuidado y apoyo para su adopción.",
      "faq.q5": "¿De qué material son las camisetas?", "faq.a5": "Son de algodón suave y cómodo, con estampados originales de cada colección, pensados para durar.",
      "faq.q6": "¿Puedo cambiar la talla?", "faq.a6": "Claro. Escríbenos por WhatsApp y te ayudamos con el cambio de talla de la forma más sencilla.",
      "nav.shop": "Tienda", "hero.badge": "Colección Océano",
      "shop.eyebrow": "Colección Océano · Camisetas",
      "shop.lead": "Elige tu horma y talla. Cada camiseta de la colección Océano ayuda a proteger el mar y a los animalitos de la calle.",
      "shop.add": "Agregar",
      "oceano.eyebrow": "Colección · Disponible", "oceano.title": "Océano",
      "oceano.lead": "El mar que nos inspira. Muy pronto contaremos aquí la historia del mar en Colombia y lo que está sucediendo en él.",
      "oceano.back": "← Volver a la tienda",
      "size.title": "Guía de tallas", "size.note": "Medidas de referencia de la prenda (Regular fit). El Oversized queda más holgado. ¿Dudas con tu talla? Escríbenos.",
      "shop.note": "👕 Imágenes de referencia (mockups) — se reemplazan fácilmente cuando lleguen las fotos reales de las camisetas.",
      "shop.ocean.name": "Camiseta Océano", "shop.ocean.desc": "Estampado del mar y la vida que lo habita. Algodón suave, tallas S–XL.",
      "shop.animal.name": "Camiseta Coral", "shop.animal.desc": "Los arrecifes de coral y su color de vida. Algodón suave, tallas S–XL.",
      "shop.stars.name": "Camiseta Ballena", "shop.stars.desc": "Las ballenas jorobadas que visitan el Pacífico colombiano. Algodón suave, tallas S–XL.",
      "shop.origen.name": "Camiseta Tortuga", "shop.origen.desc": "Las tortugas marinas que anidan en nuestras costas. Algodón suave, tallas S–XL.",
      "cart.title": "Tu carrito", "cart.empty": "Tu carrito está vacío.", "cart.total": "Total",
      "cart.checkout": "Finalizar pedido por WhatsApp", "cart.continue": "Seguir comprando",
      "cart.note": "Coordinamos el pago y el envío contigo por WhatsApp.",
      "topbar": "🐾 Un porcentaje de cada venta ayuda a los animales de la calle · Envíos a toda Colombia",
      "nav.purpose": "Propósito", "nav.impact": "Impacto", "nav.contact": "Contacto",
      "cta.write": "Escríbenos",
      "hero.eyebrow": "Moda con propósito · Calarcá, Quindío",
      "hero.title": "Diseño con propósito.",
      "hero.sub": "Camisetas estampadas que cuentan historias. Un proyecto orgánico y diferente que viste tu piel mientras cuida la de los animales y la del planeta.",
      "hero.cta1": "Ver colección Océano",
      "hero.cta2": "Escríbenos por WhatsApp",
      "values.title": "Nuestros valores",
      "value.1.t": "Ayuda animal", "value.1.d": "Un porcentaje de cada venta va a fundaciones y animales de la calle.",
      "value.2.t": "Conciencia", "value.2.d": "Cada colección invita a cuidar el medio ambiente y a los animales.",
      "value.3.t": "Hecho con alma", "value.3.d": "Un proyecto orgánico y diferente, creado con cariño desde el Quindío.",
      "value.4.t": "Envíos nacionales", "value.4.d": "Desde Calarcá enviamos a todas las ciudades de Colombia.",
      "purpose.eyebrow": "Nuestro propósito",
      "purpose.title": "Vestir con conciencia, dejar huella",
      "purpose.lead": "A&M Universe nace de una idea sencilla: que lo que usas también pueda hacer el bien. Creamos camisetas estampadas que cuentan historias sobre la naturaleza y los animales que amamos, y con cada una ayudamos a quienes más lo necesitan.",
      "purpose.c1.t": "Animales de la calle", "purpose.c1.d": "Destinamos parte de cada venta a fundaciones y a los animalitos de la calle que buscan una segunda oportunidad.",
      "purpose.c2.t": "Adopción", "purpose.c2.d": "Impulsamos la adopción de animales sin hogar y visibilizamos a los que están buscando una familia.",
      "purpose.c3.t": "Medio ambiente", "purpose.c3.d": "Creamos conciencia sobre el cuidado del planeta con cada historia y cada colección que lanzamos.",
      "purpose.c4.t": "Marca con causa", "purpose.c4.d": "No es solo ropa: es un proyecto con propósito que crece contigo y suma personas que quieren un mundo mejor.",
      "collections.eyebrow": "Colecciones",
      "coll.index": "Colección",
      "collections.title": "Las camisetas de esta historia",
      "collections.lead": "Lanzamos por colecciones temáticas. Cada una nace de una historia real sobre la naturaleza y los animales, para que lleves contigo algo más que un diseño.",
      "tag.available": "Disponible", "tag.soon": "Próximamente",
      "portal.title": "Cada capítulo, una historia por descubrir",
      "portal.lead": "Lanzamos por colecciones temáticas. Cada una nace de una historia real sobre la naturaleza y los animales. Entra a una y descubre sus camisetas.",
      "portal.ocean.name": "Océano",
      "portal.ocean.desc": "Una oda al mar y a la vida que lo habita. Su historia, sus datos y sus camisetas.",
      "portal.ocean.cta": "Ver colección →",
      "portal.felina.tag": "Próximamente · en desarrollo",
      "portal.felina.name": "Felina",
      "portal.felina.desc": "Nuestra próxima historia, en construcción. Escríbenos y te avisamos cuando salga.",
      "portal.felina.cta": "Quiero enterarme →",
      "video.sound": "Activar sonido",
      "video.pause": "Pausar",
      "ocn.s1.eyebrow": "La historia de esta colección",
      "ocn.s1.title": "El mar de Colombia",
      "ocn.s1.p1": "Colombia es uno de los pocos países del mundo con dos litorales: el mar Caribe al norte y el océano Pacífico al occidente. Ese doble acceso al mar convierte a nuestras aguas en uno de los ecosistemas marinos más diversos del planeta.",
      "ocn.s1.p2": "Dos océanos, una sola riqueza. Del arrecife turquesa del Caribe a las aguas profundas y frías del Pacífico, cada camiseta de esta colección nace de ese mismo mar: el que nos rodea, nos alimenta y todavía tenemos la oportunidad de cuidar.",
      "ocn.stat1.num": "~8.000 km",
      "ocn.stat1": "recorren las ballenas jorobadas desde la Antártida hasta el Pacífico colombiano",
      "ocn.stat2": "de las áreas coralinas de Colombia están en la Reserva Seaflower",
      "ocn.stat3": "del territorio marino de Colombia protegido (2022)",
      "ocn.s2.eyebrow": "La gran migración",
      "ocn.s2.title": "Las ballenas del Pacífico",
      "ocn.s2.p1": "Cada año, las ballenas jorobadas (<em>Megaptera novaeangliae</em>) recorren cerca de 8.000 kilómetros desde las aguas antárticas hasta el Pacífico colombiano —una de las migraciones de mamíferos más largas de la naturaleza—. Aquí, en aguas más cálidas, las hembras dan a luz y enseñan a respirar a sus crías, mientras los machos cortejan con su canto.",
      "ocn.s2.p2": "La temporada de avistamiento va de julio a octubre, con su punto máximo en agosto. Miles de ballenas eligen destinos como el Parque Nacional Natural Uramba Bahía Málaga, la isla Gorgona y el Parque Nacional Natural Utría —además de Nuquí y Bahía Solano— para dar comienzo a una nueva generación.",
      "ocn.s3.eyebrow": "Refugios de vida",
      "ocn.s3.title": "Corales, tortugas y gigantes del mar",
      "ocn.s3.p1": "En el Caribe, la Reserva de Biosfera Seaflower concentra cerca del <strong>78 % de las áreas coralinas de Colombia</strong> y es uno de los refugios marinos más ricos del país: más de 2.564 especies registradas —entre ellas más de 400 especies de peces—, además de corales, tortugas, tiburones y rayas.",
      "ocn.s3.p2": "Nuestras playas también son cuna de vida: cinco especies de tortugas marinas —verde, carey, caná, cabezona y golfina— anidan en las costas del Caribe y del Pacífico. Y mar adentro, el Santuario de Fauna y Flora Malpelo, Patrimonio de la Humanidad de la UNESCO desde 2006, protege una de las mayores agregaciones de tiburones del mundo, con el tiburón martillo como especie icónica.",
      "ocn.s3.p3": "Pero estos refugios están bajo presión. Entre 2023 y 2025 ocurrió el <strong>cuarto evento mundial de blanqueamiento de corales</strong>, el más extenso documentado: afectó cerca del <strong>84 % de los arrecifes del planeta</strong> —incluidos los del Caribe— antes de que la NOAA lo diera por terminado a mediados de 2025. El calentamiento del mar es hoy la mayor amenaza para los corales.",
      "ocn.s4.eyebrow": "Lo que está en juego",
      "ocn.s4.title": "Un mar que podemos proteger",
      "ocn.s4.p1": "En 2022, Colombia dio un paso histórico: superó la meta del 30 % y pasó a proteger más del <strong>32 % de su territorio marino</strong>, convirtiéndose en el primer país del hemisferio occidental en alcanzar la meta 30x30, ocho años antes de lo previsto.",
      "ocn.s4.p2": "Es una noticia esperanzadora, pero la protección no termina en un mapa: se sostiene con decisiones cotidianas. Cada camiseta de la colección Océano es una forma de llevar ese mar contigo y de recordar que la vida que lo habita depende, también, de nosotros.",
      "ocn.s4.quote": "Proteger el mar no es cuidar un paisaje lejano: es cuidar la casa de la vida que nos rodea.",
      "ocn.s5.eyebrow": "Cómo ayudar",
      "ocn.s5.title": "Pequeñas acciones, grandes mareas",
      "ocn.s5.lead": "No hace falta vivir frente al mar para protegerlo.",
      "ocn.a1.t": "Reduce los plásticos de un solo uso",
      "ocn.a1.d": "Lleva siempre una botella reutilizable y una bolsa de tela, y evita los desechables cuando tengas alternativa.",
      "ocn.a2.t": "La basura que ves, no la ignores",
      "ocn.a2.d": "Si encuentras residuos en una caminata, recógelos con cuidado y deposítalos donde corresponde. Lo que termina en una calle puede llegar a un río, y lo que llega a un río puede terminar en el océano.",
      "ocn.a3.t": "Consume de forma responsable",
      "ocn.a3.d": "Infórmate sobre el origen de los productos marinos que consumes y apoya la pesca responsable.",
      "ocn.a4.t": "Aprende y comparte",
      "ocn.a4.d": "Hablar del océano también es protegerlo: lo que conocemos, lo valoramos; y lo que valoramos, queremos conservarlo.",
      "impact.eyebrow": "Tu compra deja huella",
      "impact.title": "Cada camiseta ayuda a un animalito",
      "impact.lead": "Un porcentaje de las ganancias de cada venta se destina a fundaciones y a los animales de la calle. Al vestir A&M Universe te unes a una causa que da de comer, protege y busca hogar para quienes no tienen voz.",
      "impact.cta": "Suma tu granito de arena",
      "impact.count.live": "🟢 En vivo", "impact.count.shirts": "camisetas vendidas", "impact.count.money": "apartado para los animalitos",
      "impact.quote": "“Queremos que la gente adopte, se concientice sobre el medio ambiente y los animales, y que cada compra se convierta en ayuda real.”",
      "rescue.eyebrow": "Nuestra causa",
      "rescue.title": "Ellos son la razón",
      "rescue.lead": "Cada camiseta ayuda a animales de la calle como estos a encontrar comida, cuidado y, ojalá, un hogar para siempre.",
      "rescue.note": "📸 Fotos de referencia temporales — pronto pondremos las historias reales de los animalitos que ayudamos.",
      "shipping.eyebrow": "Cómo comprar",
      "shipping.title": "Fácil, y con envíos a toda Colombia",
      "shipping.lead": "Estamos en Calarcá, Quindío, y enviamos a todo el país. Comprar es tan simple como escribirnos.",
      "step.1.t": "Elige tu diseño", "step.1.d": "Explora nuestras colecciones y encuentra la historia que más te representa.",
      "step.2.t": "Escríbenos por WhatsApp", "step.2.d": "Cuéntanos qué quieres, tu talla y tu ciudad. Te asesoramos con gusto.",
      "step.3.t": "Recíbelo en casa", "step.3.d": "Coordinamos el pago y el envío para que tu pedido llegue a tu puerta.",
      "contact.title": "Hagamos historia juntos",
      "contact.lead": "¿Lista o listo para vestir con propósito? Escríbenos por WhatsApp y con gusto te ayudamos a elegir.",
      "contact.cta": "Escríbenos: 321 579 9683",
      "contact.loc": "📍 Calarcá, Quindío · Colombia — envíos a todo el país",
      "footer.tag": "Diseño con propósito. Camisetas que cuentan historias y ayudan a los animales.",
      "footer.legal": "Políticas y términos",
      "footer.made": "Hecho con 💚 en el Quindío, Colombia"
    },
    en: {
      "shop.size": "Size", "nav.faq": "FAQ",
      "fit.regular": "Regular fit", "fit.oversized": "Oversized",
      "pay.label": "Payment method", "pay.nequi": "Nequi", "pay.daviplata": "Daviplata",
      "pay.breb": "Bre-B", "pay.transfer": "Bank transfer", "pay.cod": "Cash on delivery",
      "faq.eyebrow": "Frequently asked", "faq.title": "Your questions, answered",
      "faq.q1": "Do you ship across Colombia?", "faq.a1": "Yes. We're in Calarcá, Quindío and ship to every city in the country. We arrange delivery with you on WhatsApp.",
      "faq.q2": "What sizes do you offer?", "faq.a2": "Our t-shirts come in sizes S, M, L and XL. If you're unsure about your size, message us and we'll help.",
      "faq.q3": "How do I pay?", "faq.a3": "We accept Nequi, Daviplata and Bre-B (to 321 579 9683), bank transfer and cash on delivery depending on your city. Pick your method in the cart and we arrange everything on WhatsApp. Easy and secure.",
      "faq.q4": "How does my purchase help the animals?", "faq.a4": "A share of every sale goes to shelters and street animals: food, care and support for their adoption.",
      "faq.q5": "What are the t-shirts made of?", "faq.a5": "Soft, comfortable cotton with original prints from each collection, made to last.",
      "faq.q6": "Can I change the size?", "faq.a6": "Of course. Message us on WhatsApp and we'll help you exchange the size easily.",
      "nav.shop": "Shop", "hero.badge": "Ocean Collection",
      "shop.eyebrow": "Ocean collection · T-shirts",
      "shop.lead": "Choose your fit and size. Every Ocean collection t-shirt helps protect the sea and street animals.",
      "shop.add": "Add",
      "oceano.eyebrow": "Collection · Available", "oceano.title": "Ocean",
      "oceano.lead": "The sea that inspires us. Soon we'll share the story of the sea in Colombia and what's happening to it.",
      "oceano.back": "← Back to shop",
      "size.title": "Size guide", "size.note": "Reference garment measurements (Regular fit). Oversized is roomier. Not sure about your size? Message us.",
      "shop.note": "👕 Reference images (mockups) — easy to swap once you have the real product photos.",
      "shop.ocean.name": "Ocean Tee", "shop.ocean.desc": "A print of the sea and the life within it. Soft cotton, sizes S–XL.",
      "shop.animal.name": "Coral Tee", "shop.animal.desc": "The coral reefs and their living color. Soft cotton, sizes S–XL.",
      "shop.stars.name": "Whale Tee", "shop.stars.desc": "The humpback whales that visit the Colombian Pacific. Soft cotton, sizes S–XL.",
      "shop.origen.name": "Turtle Tee", "shop.origen.desc": "The sea turtles that nest on our coasts. Soft cotton, sizes S–XL.",
      "cart.title": "Your cart", "cart.empty": "Your cart is empty.", "cart.total": "Total",
      "cart.checkout": "Checkout on WhatsApp", "cart.continue": "Keep shopping",
      "cart.note": "We'll arrange payment and shipping with you on WhatsApp.",
      "topbar": "🐾 A share of every sale helps street animals · Shipping across Colombia",
      "nav.purpose": "Purpose", "nav.impact": "Impact", "nav.contact": "Contact",
      "cta.write": "Message us",
      "hero.eyebrow": "Fashion with purpose · Calarcá, Quindío",
      "hero.title": "Design with purpose.",
      "hero.sub": "Printed t-shirts that tell stories. An organic, different project that dresses your skin while caring for animals and the planet.",
      "hero.cta1": "View Ocean collection",
      "hero.cta2": "Message us on WhatsApp",
      "values.title": "Our values",
      "value.1.t": "Animal aid", "value.1.d": "A share of every sale goes to shelters and street animals.",
      "value.2.t": "Awareness", "value.2.d": "Every collection is an invitation to care for the planet and its animals.",
      "value.3.t": "Made with soul", "value.3.d": "An organic, different project, crafted with love from Quindío.",
      "value.4.t": "Nationwide shipping", "value.4.d": "From Calarcá we ship to every city in Colombia.",
      "purpose.eyebrow": "Our purpose",
      "purpose.title": "Wear with conscience, leave a mark",
      "purpose.lead": "A&M Universe was born from a simple idea: that what you wear can also do good. We create printed t-shirts that tell stories about the nature and animals we love, and with every one we help those who need it most.",
      "purpose.c1.t": "Street animals", "purpose.c1.d": "Part of every sale goes to shelters and the street animals looking for a second chance.",
      "purpose.c2.t": "Adoption", "purpose.c2.d": "We encourage adopting homeless animals and give visibility to those searching for a family.",
      "purpose.c3.t": "Environment", "purpose.c3.d": "We raise awareness about caring for the planet with every story and collection we release.",
      "purpose.c4.t": "A brand with a cause", "purpose.c4.d": "It's not just clothing: it's a purpose-driven project that grows with you and gathers people who want a better world.",
      "collections.eyebrow": "Collections",
      "coll.index": "Collection",
      "collections.title": "The t-shirts of this story",
      "collections.lead": "We release themed collections. Each one is born from a real story about nature and animals, so you carry more than just a design.",
      "tag.available": "Available", "tag.soon": "Coming soon",
      "portal.title": "Every chapter, a story to discover",
      "portal.lead": "We release themed collections. Each one is born from a real story about nature and animals. Step into one and discover its t-shirts.",
      "portal.ocean.name": "Ocean",
      "portal.ocean.desc": "An ode to the sea and the life within it. Its story, its facts and its t-shirts.",
      "portal.ocean.cta": "View collection →",
      "portal.felina.tag": "Coming soon · in the works",
      "portal.felina.name": "Felina",
      "portal.felina.desc": "Our next story, in the making. Message us and we'll let you know when it launches.",
      "portal.felina.cta": "Keep me posted →",
      "video.sound": "Sound on",
      "video.pause": "Pause",
      "ocn.s1.eyebrow": "The story of this collection",
      "ocn.s1.title": "The sea of Colombia",
      "ocn.s1.p1": "Colombia is one of the few countries in the world with two coastlines: the Caribbean Sea to the north and the Pacific Ocean to the west. That double access to the sea makes our waters one of the most diverse marine ecosystems on the planet.",
      "ocn.s1.p2": "Two oceans, a single richness. From the turquoise reefs of the Caribbean to the deep, cold waters of the Pacific, every t-shirt in this collection is born from that same sea: the one that surrounds us, feeds us and that we still have the chance to protect.",
      "ocn.stat1.num": "~8,000 km",
      "ocn.stat1": "traveled by humpback whales from Antarctica to the Colombian Pacific",
      "ocn.stat2": "of Colombia's coral areas lie within the Seaflower Reserve",
      "ocn.stat3": "of Colombia's marine territory protected (2022)",
      "ocn.s2.eyebrow": "The great migration",
      "ocn.s2.title": "The whales of the Pacific",
      "ocn.s2.p1": "Every year, humpback whales (<em>Megaptera novaeangliae</em>) travel nearly 8,000 kilometers from Antarctic waters to the Colombian Pacific —one of the longest mammal migrations in nature—. Here, in warmer waters, females give birth and teach their calves to breathe, while males court with their song.",
      "ocn.s2.p2": "The whale-watching season runs from July to October, peaking in August. Thousands of whales choose destinations such as Uramba Bahía Málaga National Natural Park, Gorgona Island and Utría National Natural Park —as well as Nuquí and Bahía Solano— to begin a new generation.",
      "ocn.s3.eyebrow": "Havens of life",
      "ocn.s3.title": "Corals, turtles and giants of the sea",
      "ocn.s3.p1": "In the Caribbean, the Seaflower Biosphere Reserve holds close to <strong>78% of Colombia's coral areas</strong> and is one of the country's richest marine havens: more than 2,564 recorded species —among them over 400 species of fish—, plus corals, turtles, sharks and rays.",
      "ocn.s3.p2": "Our beaches are also cradles of life: five species of sea turtle —green, hawksbill, leatherback, loggerhead and olive ridley— nest on the Caribbean and Pacific coasts. And offshore, the Malpelo Fauna and Flora Sanctuary, a UNESCO World Heritage Site since 2006, protects one of the largest shark aggregations in the world, with the hammerhead shark as its iconic species.",
      "ocn.s3.p3": "But these havens are under pressure. Between 2023 and 2025 the <strong>fourth global coral bleaching event</strong> took place, the most extensive on record: it affected close to <strong>84% of the planet's reefs</strong> —including those of the Caribbean— before NOAA declared it over in mid-2025. Warming seas are today the greatest threat to corals.",
      "ocn.s4.eyebrow": "What's at stake",
      "ocn.s4.title": "A sea we can protect",
      "ocn.s4.p1": "In 2022, Colombia took a historic step: it surpassed the 30% goal and now protects more than <strong>32% of its marine territory</strong>, becoming the first country in the Western Hemisphere to reach the 30x30 target, eight years ahead of schedule.",
      "ocn.s4.p2": "It's hopeful news, but protection doesn't end on a map: it's sustained by everyday decisions. Every t-shirt in the Ocean collection is a way to carry that sea with you and to remember that the life within it depends on us, too.",
      "ocn.s4.quote": "Protecting the sea isn't caring for a distant landscape: it's caring for the home of the life around us.",
      "ocn.s5.eyebrow": "How to help",
      "ocn.s5.title": "Small actions, big tides",
      "ocn.s5.lead": "You don't need to live by the sea to protect it.",
      "ocn.a1.t": "Cut down on single-use plastics",
      "ocn.a1.d": "Always carry a reusable bottle and a cloth bag, and skip disposables whenever you have an alternative.",
      "ocn.a2.t": "Don't ignore the litter you see",
      "ocn.a2.d": "If you come across waste on a walk, pick it up carefully and dispose of it properly. What ends up on a street can reach a river, and what reaches a river can end up in the ocean.",
      "ocn.a3.t": "Consume responsibly",
      "ocn.a3.d": "Learn about where the seafood you eat comes from and support responsible fishing.",
      "ocn.a4.t": "Learn and share",
      "ocn.a4.d": "Talking about the ocean is also protecting it: what we know, we value; and what we value, we want to preserve.",
      "impact.eyebrow": "Your purchase leaves a mark",
      "impact.title": "Every t-shirt helps an animal",
      "impact.lead": "A share of the profit from every sale goes to shelters and street animals. By wearing A&M Universe you join a cause that feeds, protects and finds homes for those without a voice.",
      "impact.cta": "Add your grain of sand",
      "impact.count.live": "🟢 Live", "impact.count.shirts": "t-shirts sold", "impact.count.money": "set aside for the animals",
      "impact.quote": "“We want people to adopt, to become aware of the environment and animals, and for every purchase to turn into real help.”",
      "rescue.eyebrow": "Our cause",
      "rescue.title": "They are the reason",
      "rescue.lead": "Every t-shirt helps street animals like these find food, care and, hopefully, a forever home.",
      "rescue.note": "📸 Temporary reference photos — soon we'll share the real stories of the animals we help.",
      "shipping.eyebrow": "How to buy",
      "shipping.title": "Easy, with shipping across Colombia",
      "shipping.lead": "We're in Calarcá, Quindío, and we ship nationwide. Buying is as simple as sending us a message.",
      "step.1.t": "Choose your design", "step.1.d": "Explore our collections and find the story that represents you most.",
      "step.2.t": "Message us on WhatsApp", "step.2.d": "Tell us what you want, your size and your city. We'll gladly help.",
      "step.3.t": "Get it at home", "step.3.d": "We arrange payment and shipping so your order arrives at your door.",
      "contact.title": "Let's make history together",
      "contact.lead": "Ready to wear with purpose? Message us on WhatsApp and we'll gladly help you choose.",
      "contact.cta": "Message us: 321 579 9683",
      "contact.loc": "📍 Calarcá, Quindío · Colombia — shipping across the country",
      "footer.tag": "Design with purpose. T-shirts that tell stories and help animals.",
      "footer.legal": "Policies & terms",
      "footer.made": "Made with 💚 in Quindío, Colombia"
    }
  };

  var WA_MSG = {
    es: "¡Hola A&M Universe! 🐘 Me encantó su propuesta y quiero más información sobre las camisetas.",
    en: "Hi A&M Universe! 🐘 I love what you do and I'd like more info about your t-shirts."
  };

  var root = document.documentElement;

  /* ---------- Idioma ---------- */
  function applyLang(lang) {
    if (!I18N[lang]) lang = "es";
    var dict = I18N[lang];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) {
        var v = dict[key];
        if (v.indexOf("<") !== -1) el.innerHTML = v; else el.textContent = v;
      }
    });
    root.setAttribute("lang", lang);
    var label = document.querySelector(".lang-label");
    if (label) label.textContent = lang.toUpperCase();
    updateWaLinks(lang);
    document.dispatchEvent(new Event("aym:langchange"));
    try { localStorage.setItem("aym-lang", lang); } catch (e) {}
  }

  /* ---------- WhatsApp ---------- */
  function updateWaLinks(lang) {
    var href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_MSG[lang] || WA_MSG.es);
    document.querySelectorAll(".js-wa").forEach(function (a) { a.setAttribute("href", href); });
  }

  /* ---------- Tema ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("aym-theme", theme); } catch (e) {}
  }

  /* ---------- Init ---------- */
  var savedLang, savedTheme;
  try { savedLang = localStorage.getItem("aym-lang"); } catch (e) {}
  try { savedTheme = localStorage.getItem("aym-theme"); } catch (e) {}

  if (!savedLang) {
    savedLang = (navigator.language || "es").toLowerCase().indexOf("en") === 0 ? "en" : "es";
  }
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(savedTheme);
  applyLang(savedLang);

  document.addEventListener("DOMContentLoaded", function () {
    // año
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    // toggle tema
    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    // toggle idioma
    var langBtn = document.getElementById("lang-toggle");
    if (langBtn) langBtn.addEventListener("click", function () {
      applyLang(root.getAttribute("lang") === "en" ? "es" : "en");
    });

    // header con sombra + botón "volver arriba"
    var header = document.querySelector(".site-header");
    var toTop = document.getElementById("to-top");
    var onScroll = function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
      if (toTop) toTop.classList.toggle("show", window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    // menú móvil
    var menuBtn = document.getElementById("menu-btn");
    var nav = document.getElementById("main-nav");
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);

    function closeMenu() {
      nav.classList.remove("open");
      scrim.classList.remove("show");
      document.body.classList.remove("nav-open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    }
    function toggleMenu() {
      var open = nav.classList.toggle("open");
      scrim.classList.toggle("show", open);
      document.body.classList.toggle("nav-open", open);
      if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", toggleMenu);
      scrim.addEventListener("click", closeMenu);
      nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    }

    // reveal al hacer scroll
    var targets = document.querySelectorAll(
      ".section-head, .card-purpose, .product, .value, .step, .impact-quote, .gallery-item, .faq-item, .contact-inner"
    );
    if ("IntersectionObserver" in window) {
      targets.forEach(function (el, i) {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 4) * 70 + "ms";
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      targets.forEach(function (el) { io.observe(el); });
    }
  });
})();
