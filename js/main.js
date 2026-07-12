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
      "topbar": "🐾 Un porcentaje de cada venta ayuda a los animales de la calle · Envíos a toda Colombia",
      "nav.purpose": "Propósito", "nav.collections": "Colecciones", "nav.products": "Productos",
      "nav.impact": "Impacto", "nav.shipping": "Envíos", "nav.contact": "Contacto",
      "cta.write": "Escríbenos",
      "hero.eyebrow": "Moda con propósito · Calarcá, Quindío",
      "hero.title": "Diseño con propósito.",
      "hero.sub": "Camisetas estampadas que cuentan historias. Un proyecto orgánico y diferente que viste tu piel mientras cuida la de los animales y la del planeta.",
      "hero.cta1": "Ver colecciones",
      "hero.cta2": "Escríbenos por WhatsApp",
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
      "collections.title": "Cada capítulo tiene una historia por descubrir",
      "collections.lead": "Lanzamos por colecciones temáticas. Cada una nace de una historia real sobre la naturaleza y los animales, para que lleves contigo algo más que un diseño.",
      "tag.available": "Disponible", "tag.soon": "Próximamente",
      "col.ocean.t": "Océano", "col.ocean.d": "Una oda al mar y a la vida que lo habita. Azules profundos y criaturas que nos recuerdan por qué cuidarlo.",
      "col.animals.t": "Reino animal", "col.animals.d": "Homenaje a los animales de la tierra: fuerza, ternura y libertad estampadas para llevarlas siempre contigo.",
      "col.soon.t": "Nuevas historias", "col.soon.d": "Estamos preparando los próximos capítulos. Síguenos por WhatsApp y sé la primera persona en conocerlos.",
      "col.cta": "Pregunta por esta colección →",
      "col.soon.cta": "Quiero enterarme →",
      "products.eyebrow": "Productos",
      "products.title": "Lo que estamos creando",
      "products.lead": "Empezamos con nuestras camisetas y, poco a poco, sumamos más productos hechos con la misma dedicación y propósito.",
      "prod.tee.t": "Camisetas estampadas", "prod.tee.d": "Prendas cómodas con arte original que cuenta una historia. El corazón de A&M Universe.",
      "prod.candle.t": "Velas para masaje", "prod.candle.d": "Velas para masajes corporales, en desarrollo con una fórmula pensada para consentir tu piel.",
      "prod.butter.t": "Mantequilla corporal", "prod.butter.d": "Mantequilla corporal artesanal para nutrir e hidratar, hecha con ingredientes elegidos con cariño.",
      "impact.eyebrow": "Tu compra deja huella",
      "impact.title": "Cada camiseta ayuda a un animalito",
      "impact.lead": "Un porcentaje de las ganancias de cada venta se destina a fundaciones y a los animales de la calle. Al vestir A&M Universe te unes a una causa que da de comer, protege y busca hogar para quienes no tienen voz.",
      "impact.cta": "Suma tu granito de arena",
      "impact.quote": "“Queremos que la gente adopte, se concientice sobre el medio ambiente y los animales, y que cada compra se convierta en ayuda real.”",
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
      "footer.made": "Hecho con 💚 en el Quindío, Colombia"
    },
    en: {
      "topbar": "🐾 A share of every sale helps street animals · Shipping across Colombia",
      "nav.purpose": "Purpose", "nav.collections": "Collections", "nav.products": "Products",
      "nav.impact": "Impact", "nav.shipping": "Shipping", "nav.contact": "Contact",
      "cta.write": "Message us",
      "hero.eyebrow": "Fashion with purpose · Calarcá, Quindío",
      "hero.title": "Design with purpose.",
      "hero.sub": "Printed t-shirts that tell stories. An organic, different project that dresses your skin while caring for animals and the planet.",
      "hero.cta1": "See collections",
      "hero.cta2": "Message us on WhatsApp",
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
      "collections.title": "Every chapter has a story to discover",
      "collections.lead": "We release themed collections. Each one is born from a real story about nature and animals, so you carry more than just a design.",
      "tag.available": "Available", "tag.soon": "Coming soon",
      "col.ocean.t": "Ocean", "col.ocean.d": "An ode to the sea and the life within it. Deep blues and creatures that remind us why to protect it.",
      "col.animals.t": "Animal kingdom", "col.animals.d": "A tribute to the animals of the earth: strength, tenderness and freedom, printed to carry with you always.",
      "col.soon.t": "New stories", "col.soon.d": "We're preparing the next chapters. Follow us on WhatsApp and be the first to know.",
      "col.cta": "Ask about this collection →",
      "col.soon.cta": "Keep me posted →",
      "products.eyebrow": "Products",
      "products.title": "What we're creating",
      "products.lead": "We start with our t-shirts and, step by step, add more products made with the same care and purpose.",
      "prod.tee.t": "Printed t-shirts", "prod.tee.d": "Comfortable garments with original art that tells a story. The heart of A&M Universe.",
      "prod.candle.t": "Massage candles", "prod.candle.d": "Candles for body massage, in development with a formula designed to pamper your skin.",
      "prod.butter.t": "Body butter", "prod.butter.d": "Handmade body butter to nourish and hydrate, made with lovingly chosen ingredients.",
      "impact.eyebrow": "Your purchase leaves a mark",
      "impact.title": "Every t-shirt helps an animal",
      "impact.lead": "A share of the profit from every sale goes to shelters and street animals. By wearing A&M Universe you join a cause that feeds, protects and finds homes for those without a voice.",
      "impact.cta": "Add your grain of sand",
      "impact.quote": "“We want people to adopt, to become aware of the environment and animals, and for every purchase to turn into real help.”",
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

    // header con sombra al scroll
    var header = document.querySelector(".site-header");
    var onScroll = function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

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
      ".section-head, .card-purpose, .collection-card, .product-card, .value, .step, .impact-quote, .contact-inner"
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
