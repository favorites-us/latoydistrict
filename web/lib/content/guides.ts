// Guide copy for both locales, committed and human-editable. Facts here are
// research-based but unverified on the ground — keep hedged wording ("most",
// "typically") until Phase 3 field checks replace it with confirmed detail.

import type { Locale } from "../i18n";

export interface GuideSection {
  h: string;
  ps: string[];
  bullets?: string[];
}

export interface Guide {
  title: string;
  description: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
}

export const visiting: Record<Locale, Guide> = {
  en: {
    title: "Visiting the Toy District: parking, hours, safety & cash",
    description:
      "Practical guide to visiting LA's Toy District in Downtown Los Angeles — where to park, when stores are open, how safe it is, and why you should bring cash.",
    sections: [
      {
        h: "Where exactly is it?",
        ps: [
          "The Toy District covers roughly 12 blocks of Downtown Los Angeles: E 3rd St to E 5th St, between S Los Angeles St and S San Pedro St (ZIP 90013). The densest wholesale blocks are Wall St, Winston St and Boyd St. Little Tokyo is immediately north across 3rd St.",
          "If you're navigating by GPS, aim for the corner of 4th St & Wall St and walk from there — the district is compact and best covered on foot.",
        ],
      },
      {
        h: "Hours: go on a weekday morning",
        ps: [
          "Most wholesalers here keep daytime hours, typically opening mid-morning and closing by late afternoon. Many are open Saturdays (often the busiest retail day) and closed or limited on Sundays.",
          "If you're buying wholesale quantities, weekday mornings are the practical choice: staff have time to quote case prices, and stock is easiest to pull. Exact hours vary store to store and aren't published anywhere reliable — that's a gap this directory is working through block by block.",
        ],
      },
      {
        h: "Parking",
        ps: [
          "There is no dedicated district parking. Your options are paid surface lots scattered along the edges of the district (expect a flat daytime rate), metered street parking that fills early, and the public garages in Little Tokyo a couple of blocks north.",
          "If you're loading bulk purchases, note where your car is before you start buying — vendors generally won't hold goods, and hand-trucking boxes several blocks gets old fast. Some buyers park close, buy heavy, and move the car between stops.",
        ],
      },
      {
        h: "Is the Toy District safe?",
        ps: [
          "Honest answer: the district borders Skid Row, and you will see street homelessness, especially along 5th St and toward San Pedro St. During business hours the commercial blocks are busy with buyers, hand trucks and delivery traffic, and daytime visits are routine for thousands of shoppers.",
          "Sensible rules: go during business hours, keep to the active commercial blocks, don't leave anything visible in your car, and carry cash securely. If you're uneasy, start from the 3rd St side near Little Tokyo and work south.",
        ],
      },
      {
        h: "Bring cash",
        ps: [
          "Many stalls are cash-preferred; some take cards with a minimum purchase or a fee. Wholesale deals in particular tend to be cash transactions. There are ATMs in convenience stores around the district, but fees add up — bring what you plan to spend.",
          "Ask for a receipt/invoice if you're buying for resale; you'll want it for your books, and legitimate wholesalers expect the request.",
        ],
      },
    ],
    faq: [
      {
        q: "Where is the Toy District in Los Angeles?",
        a: "Downtown LA, between E 3rd St and E 5th St from S Los Angeles St to S San Pedro St, ZIP 90013. The core blocks are Wall St, Winston St and Boyd St.",
      },
      {
        q: "What time do Toy District stores open?",
        a: "Most stores keep daytime hours, roughly mid-morning to late afternoon, Monday through Saturday. Many are closed or limited on Sundays. Hours vary by store.",
      },
      {
        q: "Is the Toy District safe to visit?",
        a: "Daytime visits during business hours are routine. The district borders Skid Row, so stay on the active commercial blocks, visit during business hours, and don't leave valuables in your car.",
      },
      {
        q: "Do Toy District stores take credit cards?",
        a: "Some do, often with minimums or fees, but many stalls prefer cash — especially for wholesale pricing. Bring cash.",
      },
      {
        q: "Can anyone buy in the Toy District, or is it wholesale only?",
        a: "Both. Roughly 90% of merchants sell at wholesale prices, but most also sell to walk-in retail customers. For true wholesale pricing and bulk orders, bringing a California resale certificate helps.",
      },
    ],
  },
  es: {
    title: "Visitar el Toy District: estacionamiento, horarios, seguridad y efectivo",
    description:
      "Guía práctica para visitar el Toy District en el centro de Los Ángeles — dónde estacionar, horarios de las tiendas, qué tan seguro es y por qué conviene llevar efectivo.",
    sections: [
      {
        h: "¿Dónde queda exactamente?",
        ps: [
          "El Toy District abarca unas 12 cuadras del centro de Los Ángeles: de E 3rd St a E 5th St, entre S Los Angeles St y S San Pedro St (código postal 90013). Las cuadras con más mayoristas son Wall St, Winston St y Boyd St. Little Tokyo queda justo al norte, cruzando 3rd St.",
          "Si usa GPS, ponga como destino la esquina de 4th St y Wall St y recorra a pie desde ahí — el distrito es compacto y se camina fácil.",
        ],
      },
      {
        h: "Horarios: vaya entre semana por la mañana",
        ps: [
          "La mayoría de los mayoristas abren de día, normalmente a media mañana y cierran a media tarde. Muchos abren los sábados (suele ser el día de más venta al menudeo) y cierran o limitan horario los domingos.",
          "Si compra por mayoreo, lo práctico es ir entre semana por la mañana: el personal tiene tiempo de cotizar precios por caja y es más fácil sacar mercancía. Los horarios exactos varían por tienda y no están publicados en ningún lado confiable — es justo el hueco que este directorio está llenando cuadra por cuadra.",
        ],
      },
      {
        h: "Estacionamiento",
        ps: [
          "No hay estacionamiento propio del distrito. Las opciones son: lotes de pago en los bordes del distrito (tarifa fija de día), parquímetros en la calle que se llenan temprano, y los estacionamientos públicos de Little Tokyo a un par de cuadras al norte.",
          "Si va a cargar compras en volumen, ubique bien su carro antes de empezar a comprar — los vendedores normalmente no apartan mercancía, y cargar cajas varias cuadras cansa rápido. Algunos compradores estacionan cerca, compran lo pesado y mueven el carro entre paradas.",
        ],
      },
      {
        h: "¿Es seguro el Toy District?",
        ps: [
          "Respuesta honesta: el distrito colinda con Skid Row y verá personas sin hogar en la calle, sobre todo por 5th St y hacia San Pedro St. En horario comercial las cuadras están llenas de compradores, diablitos y camiones de entrega, y miles de personas lo visitan de día sin problema.",
          "Reglas de sentido común: vaya en horario comercial, quédese en las cuadras comerciales activas, no deje nada visible en el carro y cargue el efectivo de forma segura. Si le da pendiente, empiece por el lado de 3rd St junto a Little Tokyo y avance hacia el sur.",
        ],
      },
      {
        h: "Lleve efectivo",
        ps: [
          "Muchos locales prefieren efectivo; algunos aceptan tarjeta con compra mínima o comisión. Las ventas de mayoreo en particular suelen ser en efectivo. Hay cajeros en las tienditas de la zona, pero las comisiones suman — lleve lo que planea gastar.",
          "Pida recibo o factura si compra para revender; la necesita para su contabilidad y los mayoristas serios están acostumbrados a darla.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Dónde está el Toy District de Los Ángeles?",
        a: "En el centro de LA, entre E 3rd St y E 5th St, de S Los Angeles St a S San Pedro St, código postal 90013. Las cuadras principales son Wall St, Winston St y Boyd St.",
      },
      {
        q: "¿A qué hora abren las tiendas del Toy District?",
        a: "La mayoría abre de día, más o menos de media mañana a media tarde, de lunes a sábado. Muchas cierran o limitan horario los domingos. Varía por tienda.",
      },
      {
        q: "¿Es seguro visitar el Toy District?",
        a: "Visitar de día en horario comercial es lo normal. El distrito colinda con Skid Row, así que quédese en las cuadras comerciales activas, vaya en horario comercial y no deje objetos de valor en el carro.",
      },
      {
        q: "¿Aceptan tarjeta en el Toy District?",
        a: "Algunas tiendas sí, a veces con mínimo de compra o comisión, pero muchos locales prefieren efectivo — sobre todo para precio de mayoreo. Lleve efectivo.",
      },
      {
        q: "¿Cualquiera puede comprar en el Toy District o es solo mayoreo?",
        a: "Ambos. Cerca del 90% de los comerciantes vende a precio de mayoreo, pero la mayoría también atiende al público. Para precio de mayoreo real y pedidos grandes, ayuda llevar un resale certificate de California.",
      },
    ],
  },
};

export const wholesaleBasics: Record<Locale, Guide> = {
  en: {
    title: "Buying wholesale in California: seller's permits & resale certificates",
    description:
      "What you need to buy wholesale in LA's Toy District — California seller's permit, resale certificate, MOQs, and what wholesalers actually ask for.",
    sections: [
      {
        h: "Do I need a permit to buy wholesale?",
        ps: [
          "Strictly speaking, no — anyone can walk into most Toy District stores and buy. But if you're buying for resale and want to skip California sales tax on your purchase, you need to give the seller a resale certificate, and to issue one you need a California seller's permit.",
          "The seller's permit is issued by the CDTFA (California Department of Tax and Fee Administration) and is free. You register once for your business, then you can issue resale certificates to any wholesaler you buy from.",
        ],
      },
      {
        h: "How the resale certificate works at the counter",
        ps: [
          "A resale certificate is a short form (CDTFA-230 is the standard template) stating that you're buying the goods to resell them. You give it to the wholesaler; they keep it on file and don't charge you sales tax. You then collect sales tax from your own customers when you sell.",
          "In practice, Toy District wholesalers vary: some ask for your resale number before quoting wholesale prices, others just sell at wholesale to anyone buying by the case. Having the certificate ready marks you as a trade buyer and usually gets you better treatment.",
        ],
        bullets: [
          "Register for a seller's permit at cdtfa.ca.gov (free).",
          "Print or save a filled resale certificate (CDTFA-230) with your permit number.",
          "Out-of-state resellers: many CA wholesalers accept your home-state resale documentation, but policies vary — ask.",
          "Buying for your own use (parties, events) is not resale — you pay sales tax, no permit needed.",
        ],
      },
      {
        h: "MOQs: how much do you have to buy?",
        ps: [
          "Minimum order quantities in the district are usually small compared to importing: by the dozen, by the case, or a dollar minimum per order. Many stores sell single pieces at a retail markup and only apply wholesale pricing from a threshold (\"minimum 6 pieces\" is a common pattern).",
          "MOQs are store-by-store and rarely posted. This directory tracks MOQ per store as we verify listings in person — where you see it on a store page, it came from a field check.",
        ],
      },
      {
        h: "A caution on branded goods",
        ps: [
          "Licensed and brand-name items (popular character plush, collectible figures) sold far below normal wholesale can be counterfeit. Selling counterfeits exposes you, not just the wholesaler, to platform bans and legal risk — TikTok Shop and Amazon both enforce actively.",
          "Ask for the licensed distributor's invoice on branded goods, and be skeptical of prices that are too good. Generic and unbranded toys avoid the problem entirely.",
        ],
      },
      {
        h: "Not legal or tax advice",
        ps: [
          "This page summarizes public CDTFA guidance for orientation. Rules change and situations differ — confirm specifics with the CDTFA or a tax professional.",
        ],
      },
    ],
  },
  es: {
    title: "Comprar al por mayor en California: seller's permit y resale certificate",
    description:
      "Lo que necesita para comprar al por mayor en el Toy District de LA — seller's permit de California, resale certificate, pedidos mínimos y qué piden realmente los mayoristas.",
    sections: [
      {
        h: "¿Necesito permiso para comprar al por mayor?",
        ps: [
          "Estrictamente, no — cualquiera puede entrar y comprar en la mayoría de las tiendas del Toy District. Pero si compra para revender y quiere no pagar el impuesto de venta de California en su compra, debe entregar al vendedor un resale certificate, y para emitirlo necesita un seller's permit de California.",
          "El seller's permit lo emite el CDTFA (Departamento de Administración de Impuestos y Cuotas de California) y es gratuito. Se registra una vez con su negocio y después puede emitir resale certificates a cualquier mayorista al que le compre.",
        ],
      },
      {
        h: "Cómo funciona el resale certificate en el mostrador",
        ps: [
          "El resale certificate es un formulario corto (el modelo estándar es el CDTFA-230) que declara que compra la mercancía para revenderla. Se lo entrega al mayorista; él lo archiva y no le cobra impuesto de venta. Usted después cobra el impuesto a sus propios clientes al vender.",
          "En la práctica, los mayoristas del Toy District varían: algunos piden su número de resale antes de dar precio de mayoreo, otros venden a mayoreo a cualquiera que compre por caja. Llevar el certificado listo lo identifica como comprador de comercio y normalmente le atienden mejor.",
        ],
        bullets: [
          "Registre su seller's permit en cdtfa.ca.gov (gratis).",
          "Imprima o guarde un resale certificate lleno (CDTFA-230) con su número de permiso.",
          "Revendedores de otros estados: muchos mayoristas de CA aceptan la documentación de reventa de su estado, pero las políticas varían — pregunte.",
          "Comprar para uso propio (fiestas, eventos) no es reventa — paga el impuesto y no necesita permiso.",
        ],
      },
      {
        h: "Pedidos mínimos (MOQ): ¿cuánto hay que comprar?",
        ps: [
          "Los mínimos en el distrito suelen ser bajos comparados con importar: por docena, por caja, o un mínimo en dólares por pedido. Muchas tiendas venden pieza suelta a precio de menudeo y aplican precio de mayoreo a partir de cierto volumen (\"mínimo 6 piezas\" es un patrón común).",
          "El MOQ es de cada tienda y casi nunca está publicado. Este directorio registra el MOQ por tienda conforme verificamos las fichas en persona — si lo ve en la página de una tienda, viene de una verificación en el lugar.",
        ],
      },
      {
        h: "Cuidado con la mercancía de marca",
        ps: [
          "Los artículos con licencia y de marca (peluches de personajes populares, figuras coleccionables) que se venden muy por debajo del mayoreo normal pueden ser falsificaciones. Vender falsificaciones lo expone a usted, no solo al mayorista, a bloqueos de plataforma y riesgo legal — TikTok Shop y Amazon lo aplican activamente.",
          "Pida la factura del distribuidor autorizado en mercancía de marca y desconfíe de precios demasiado buenos. Los juguetes genéricos y sin marca evitan el problema por completo.",
        ],
      },
      {
        h: "No es asesoría legal ni fiscal",
        ps: [
          "Esta página resume orientación pública del CDTFA. Las reglas cambian y cada caso es distinto — confirme los detalles con el CDTFA o con un profesional de impuestos.",
        ],
      },
    ],
  },
};

export type BuyerSlug = "party-planners" | "store-owners" | "resellers";

export const buyerGuides: Record<BuyerSlug, Record<Locale, Guide>> = {
  "party-planners": {
    en: {
      title: "Toy District guide for party planners",
      description:
        "How party planners buy piñatas, balloons, party favors and quinceañera supplies wholesale in LA's Toy District.",
      sections: [
        {
          h: "Why planners buy here",
          ps: [
            "Party favors, piñata fillers, balloons, themed toys and goody-bag stock are the district's bread and butter, sold by the dozen or gross at prices that make per-guest math work. For quinceañeras, birthday parties and corporate events, one morning here replaces a week of online ordering.",
          ],
        },
        {
          h: "How to work the district",
          ps: [
            "Come with your headcount and theme, not a rigid shopping list — assortments change constantly and the deals are on what's in stock. Prices drop at dozen/case thresholds, so consolidate: one store for favors, one for balloons and decor, one for filler toys.",
            "Most planners don't need a resale certificate (buying for an event is use, not resale), so expect to pay sales tax. If you invoice clients for goods, talk to your accountant about whether reselling applies to you.",
          ],
          bullets: [
            "Bring cash — party-goods stalls are among the most cash-preferred.",
            "Saturday is crowded with retail shoppers; weekday mornings are calmer for bulk orders.",
            "Spanish is widely spoken on the party-supply blocks.",
          ],
        },
        {
          h: "Where to start",
          ps: [
            "Filter the directory for Party supplies and start on the Los Angeles St and Wall St blocks, then branch out. The visiting guide covers parking and logistics for hauling bulky items like piñatas.",
          ],
        },
      ],
    },
    es: {
      title: "Guía del Toy District para organizadores de fiestas",
      description:
        "Cómo compran los organizadores de fiestas piñatas, globos, recuerdos y artículos para quinceañeras al por mayor en el Toy District de LA.",
      sections: [
        {
          h: "Por qué los organizadores compran aquí",
          ps: [
            "Recuerdos de fiesta, relleno de piñata, globos, juguetitos temáticos y bolsitas sorpresa son el pan de cada día del distrito, vendidos por docena o gruesa a precios que hacen rendir el presupuesto por invitado. Para quinceañeras, cumpleaños y eventos corporativos, una mañana aquí reemplaza una semana de pedidos en línea.",
          ],
        },
        {
          h: "Cómo recorrer el distrito",
          ps: [
            "Venga con su número de invitados y su tema, no con una lista rígida — el surtido cambia constantemente y las ofertas están en lo que hay en existencia. Los precios bajan por docena o caja, así que concentre: una tienda para recuerdos, otra para globos y decoración, otra para juguetes de relleno.",
            "La mayoría de los organizadores no necesita resale certificate (comprar para un evento es uso, no reventa), así que pagará impuesto de venta. Si factura mercancía a sus clientes, consulte con su contador si le aplica la reventa.",
          ],
          bullets: [
            "Lleve efectivo — los locales de fiesta son de los que más lo prefieren.",
            "El sábado se llena de compradores al menudeo; entre semana por la mañana es más tranquilo para pedidos grandes.",
            "En las cuadras de artículos de fiesta se habla mucho español.",
          ],
        },
        {
          h: "Por dónde empezar",
          ps: [
            "Filtre el directorio por Artículos de fiesta y empiece por las cuadras de Los Angeles St y Wall St, y de ahí siga. La guía de visita cubre estacionamiento y logística para cargar cosas voluminosas como piñatas.",
          ],
        },
      ],
    },
  },
  "store-owners": {
    en: {
      title: "Toy District guide for dollar store & discount store owners",
      description:
        "How dollar store and discount retail owners restock toys, novelty and general merchandise from LA Toy District wholesalers.",
      sections: [
        {
          h: "The district as your restock route",
          ps: [
            "For dollar stores, discount stores and swap-meet retailers across Southern California, the Toy District works as a same-day restock route: case-packed toys, novelty, gifts and seasonal goods at import prices, without container commitments or freight lead times.",
          ],
        },
        {
          h: "Buying like a trade customer",
          ps: [
            "Bring your California seller's permit and a filled resale certificate — most wholesalers here will file it and skip the sales tax, and it signals you buy in volume. Ask for case prices and per-piece breaks; quotes move when you consolidate an order.",
            "Get invoices for everything: you need them for your books, and an invoice trail matters if a licensed-looking product ever gets questioned. See our note on branded goods in the wholesale basics guide.",
          ],
          bullets: [
            "Weekday mornings: easiest time to pull case quantities and talk numbers.",
            "Seasonal resets (Halloween, Christmas, back-to-school) land months early — buy ahead.",
            "Many wholesalers here also run cash-and-carry: no accounts, no minimum relationship.",
          ],
        },
        {
          h: "Where to start",
          ps: [
            "Filter the directory for General merchandise and Toys, and walk Wall St and Winston St first — the highest density of cash-and-carry wholesalers is there.",
          ],
        },
      ],
    },
    es: {
      title: "Guía del Toy District para dueños de tiendas de descuento",
      description:
        "Cómo los dueños de dollar stores y tiendas de descuento se surten de juguetes, novedades y mercancía general con los mayoristas del Toy District de LA.",
      sections: [
        {
          h: "El distrito como su ruta de resurtido",
          ps: [
            "Para dollar stores, tiendas de descuento y comerciantes de swap meet del sur de California, el Toy District funciona como ruta de resurtido el mismo día: juguetes por caja, novedades, regalos y mercancía de temporada a precio de importación, sin comprometerse a contenedores ni esperar fletes.",
          ],
        },
        {
          h: "Comprar como cliente de comercio",
          ps: [
            "Lleve su seller's permit de California y un resale certificate lleno — la mayoría de los mayoristas lo archivan y no cobran impuesto de venta, y además indica que usted compra por volumen. Pida precio por caja y descuentos por pieza; la cotización mejora cuando junta un pedido grande.",
            "Pida factura de todo: la necesita para su contabilidad, y el historial de facturas importa si algún producto con apariencia de licencia llega a cuestionarse. Vea la nota sobre mercancía de marca en la guía de compra al por mayor.",
          ],
          bullets: [
            "Entre semana por la mañana: el mejor momento para sacar cajas y negociar números.",
            "Lo de temporada (Halloween, Navidad, regreso a clases) llega con meses de anticipación — compre antes.",
            "Muchos mayoristas aquí operan cash-and-carry: sin cuentas ni relación mínima.",
          ],
        },
        {
          h: "Por dónde empezar",
          ps: [
            "Filtre el directorio por Mercancía general y Juguetes, y recorra primero Wall St y Winston St — ahí está la mayor densidad de mayoristas cash-and-carry.",
          ],
        },
      ],
    },
  },
  resellers: {
    en: {
      title: "Toy District guide for TikTok Shop & online resellers",
      description:
        "Sourcing toys and trend items in LA's Toy District for TikTok Shop, Amazon, eBay and swap meets — what works, what to avoid.",
      sections: [
        {
          h: "Why resellers film here",
          ps: [
            "The district has become a sourcing stop for TikTok Shop and marketplace resellers: trend toys, plush, blind-box style items and novelty at cash-and-carry prices, in quantities small enough to test (a dozen units) before committing to more. The same aisles double as content — wholesale-haul videos from these blocks pull real views.",
          ],
        },
        {
          h: "The counterfeit trap (read this)",
          ps: [
            "The biggest risk for online resellers here is not price — it's authenticity. Popular licensed characters sold cheap from unmarked boxes are often counterfeit, and platforms enforce hard: TikTok Shop and Amazon suspend sellers and hold funds over IP complaints.",
            "Rules of thumb: unbranded and generic items are safe; for anything licensed, ask for the authorized distributor's invoice and walk away if the price seems impossible. Your account is worth more than one hot SKU.",
          ],
        },
        {
          h: "Practical sourcing loop",
          ps: [
            "Test small (most stores will sell a dozen), list, watch sell-through for a week, then come back and buy depth on winners — the district's advantage over importing is exactly this same-week reorder loop.",
            "Bring a resale certificate to skip sales tax on inventory purchases (see the wholesale basics guide), pay cash for better quotes, and keep every invoice for your records and platform disputes.",
          ],
          bullets: [
            "Filter the directory for Toys, Plush and Figures & collectibles to plan a route.",
            "Weekday mornings beat Saturdays for talking quantity prices.",
            "Ask stores about restock days so your reorder loop matches their container schedule.",
          ],
        },
      ],
    },
    es: {
      title: "Guía del Toy District para revendedores en línea y TikTok Shop",
      description:
        "Cómo surtirse de juguetes y artículos de tendencia en el Toy District de LA para TikTok Shop, Amazon, eBay y swap meets — qué funciona y qué evitar.",
      sections: [
        {
          h: "Por qué los revendedores graban aquí",
          ps: [
            "El distrito se volvió parada de surtido para revendedores de TikTok Shop y marketplaces: juguetes de tendencia, peluches, artículos tipo blind box y novedades a precio cash-and-carry, en cantidades pequeñas para probar (una docena) antes de comprometerse a más. Los mismos pasillos sirven de contenido — los videos de compras al mayoreo en estas cuadras jalan vistas reales.",
          ],
        },
        {
          h: "La trampa de las falsificaciones (lea esto)",
          ps: [
            "El mayor riesgo para el revendedor en línea aquí no es el precio — es la autenticidad. Los personajes con licencia que se venden baratos en cajas sin marcar suelen ser falsificados, y las plataformas lo castigan duro: TikTok Shop y Amazon suspenden vendedores y retienen fondos por quejas de propiedad intelectual.",            "Reglas prácticas: lo genérico y sin marca es seguro; para cualquier cosa con licencia, pida la factura del distribuidor autorizado y aléjese si el precio parece imposible. Su cuenta vale más que un SKU de moda.",
          ],
        },
        {
          h: "Ciclo práctico de surtido",
          ps: [
            "Pruebe en pequeño (la mayoría vende por docena), publique, mida la venta una semana y regrese a comprar fondo en lo que funcionó — la ventaja del distrito sobre importar es justo ese ciclo de resurtido en la misma semana.",
            "Lleve resale certificate para no pagar impuesto en compras de inventario (vea la guía de compra al por mayor), pague en efectivo para mejores cotizaciones y guarde toda factura para su contabilidad y disputas de plataforma.",
          ],
          bullets: [
            "Filtre el directorio por Juguetes, Peluches y Figuras y coleccionables para planear su ruta.",
            "Entre semana por la mañana es mejor que el sábado para negociar precios por cantidad.",
            "Pregunte en las tiendas qué días reciben mercancía para empatar su ciclo de resurtido con sus contenedores.",
          ],
        },
      ],
    },
  },
};
