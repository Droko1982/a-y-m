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
      if (dict[key] != null) el.textContent = dict[key];
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
