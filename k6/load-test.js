import http from "k6/http";
import { sleep, check } from "k6";
import { CookieJar } from "k6/http";

const BASE_URL = "https://sige-erp-vendas-api-production.up.railway.app";

export const options = {
  scenarios: {
    carga_base: {
      executor: "constant-vus",
      vus: 3,
      duration: "10m",
    },
    pico: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 10 },
        { duration: "3m", target: 10 },
        { duration: "2m", target: 0 },
      ],
      startTime: "5m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

const ADMIN = { email: "admin@erp.com", password: "admin123" };
const USERS = [
  ADMIN,
  { email: "joao@erp.com", password: "senha123" },
  { email: "maria@erp.com", password: "senha123" },
];

const REGIONS = ["Norte", "Sul", "Leste", "Oeste", "Centro"];
const CATEGORIES = ["Eletrônicos", "Alimentos", "Vestuário", "Ferramentas", "Informática", "Limpeza"];

const COMPANY_PREFIX = ["Norte", "Sul", "Global", "Prime", "Max", "Central", "Nacional", "Alpha", "Mega", "Ultra", "Ágil", "Verde", "Nova", "Forte"];
const COMPANY_NOUN = ["Comércio", "Indústria", "Serviços", "Soluções", "Distribuidora", "Atacado", "Varejo", "Logística", "Tecnologia", "Consultoria"];
const COMPANY_SUFFIX = ["Ltda", "S.A.", "ME", "EIRELI", "& Cia"];

const PRODUCT_ADJ = ["Premium", "Pro", "Plus", "Ultra", "Max", "Basic", "Standard", "Elite", "Light", "Turbo"];
const PRODUCT_NOUN = ["Notebook", "Monitor", "Teclado", "Mouse", "Headset", "Cabo", "Adaptador", "Carregador", "Roteador", "Switch", "Impressora", "Scanner", "Webcam", "Microfone"];

function randomLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 3 }, () => letters[randomInt(0, 25)]).join("");
}

function randomCompanyName() {
  return `${randomLetters()} ${randomItem(COMPANY_PREFIX)} ${randomItem(COMPANY_NOUN)} ${randomItem(COMPANY_SUFFIX)}`;
}

function randomProductName() {
  return `${randomLetters()} ${randomItem(PRODUCT_NOUN)} ${randomItem(PRODUCT_ADJ)}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid() {
  return `${Date.now()}-${randomInt(1000, 9999)}`;
}

function jsonOrNull(res) {
  try {
    return res.json();
  } catch (_) {
    return null;
  }
}

function login(jar) {
  const user = randomItem(USERS);
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { "Content-Type": "application/json" }, jar },
  );
  check(res, { "POST /auth/login": (r) => r.status === 200 });
  return res.status === 200;
}

export default function () {
  const jar = new CookieJar();
  const p = { jar, headers: { "Content-Type": "application/json" } };

  // POST /auth/login
  if (!login(jar)) {
    sleep(2);
    return;
  }
  sleep(0.5);

  // GET /auth/me
  check(http.get(`${BASE_URL}/auth/me`, p), {
    "GET /auth/me": (r) => r.status === 200,
  });
  sleep(0.5);

  // GET /dashboard/kpis + /dashboard/chart
  check(http.get(`${BASE_URL}/dashboard/kpis`, p), {
    "GET /dashboard/kpis": (r) => r.status === 200,
  });
  sleep(0.3);
  check(http.get(`${BASE_URL}/dashboard/chart`, p), {
    "GET /dashboard/chart": (r) => r.status === 200,
  });
  sleep(0.5);

  // GET /products
  const productsRes = http.get(`${BASE_URL}/products`, p);
  check(productsRes, { "GET /products": (r) => r.status === 200 });
  const productsBody = jsonOrNull(productsRes);
  const products = productsBody?.items || [];
  sleep(0.5);

  // GET /clients
  const clientsRes = http.get(`${BASE_URL}/clients`, p);
  check(clientsRes, { "GET /clients": (r) => r.status === 200 });
  const clientsBody = jsonOrNull(clientsRes);
  const clients = clientsBody?.items || [];
  sleep(0.3);

  // GET /clients/:id
  if (clients.length > 0) {
    const client = randomItem(clients);
    check(http.get(`${BASE_URL}/clients/${client.id}`, p), {
      "GET /clients/:id": (r) => r.status === 200,
    });
    sleep(0.3);
  }

  // POST /clients (40% de chance)
  if (Math.random() < 0.4) {
    check(
      http.post(
        `${BASE_URL}/clients`,
        JSON.stringify({
          name: randomCompanyName(),
          email: `cliente${uid()}@teste.com`,
          phone: `119${randomInt(10000000, 99999999)}`,
          region: randomItem(REGIONS),
        }),
        p
      ),
      { "POST /clients": (r) => r.status === 201 }
    );
    sleep(0.3);
  }

  // GET /stock
  const stockRes = http.get(`${BASE_URL}/stock`, p);
  check(stockRes, { "GET /stock": (r) => r.status === 200 });
  const stockItems = jsonOrNull(stockRes) || [];
  sleep(0.3);

  // GET /stock/:productId
  if (products.length > 0) {
    const product = randomItem(products);
    check(http.get(`${BASE_URL}/stock/${product.id}`, p), {
      "GET /stock/:productId": (r) => r.status === 200,
    });
    sleep(0.3);
  }

  // PUT /stock/:productId — admin repõe estoque baixo (<= 20 unidades)
  if (stockItems.length > 0) {
    const meForStock = jsonOrNull(http.get(`${BASE_URL}/auth/me`, p));
    if (meForStock?.role === "ADMIN") {
      for (const s of stockItems) {
        if ((s.physical - s.reserved) <= 20) {
          check(
            http.put(
              `${BASE_URL}/stock/${s.product.id}`,
              JSON.stringify({ physical: 500 }),
              p
            ),
            { "PUT /stock (repõe)": (r) => r.status === 200 }
          );
          sleep(0.2);
        }
      }
    }
  }

  // GET /activities
  check(http.get(`${BASE_URL}/activities`, p), {
    "GET /activities": (r) => r.status === 200,
  });
  sleep(0.3);

  // GET /goals
  check(http.get(`${BASE_URL}/goals`, p), {
    "GET /goals": (r) => r.status === 200,
  });
  sleep(0.3);

  // POST /goals — só admin, 20% de chance
  // Busca vendedores para associar a meta
  if (Math.random() < 0.6) {
    const meRes = http.get(`${BASE_URL}/auth/me`, p);
    const me = jsonOrNull(meRes);
    if (me?.role === "ADMIN") {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const period = `${now.getFullYear()}-${month}`;
      const sellers = USERS.filter((u) => u.email !== ADMIN.email);
      const sellerEmail = randomItem(sellers).email;
      // sellerId precisa do UUID real — buscamos via /auth/me do vendedor
      const sellerJar = new CookieJar();
      http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({ email: sellerEmail, password: "senha123" }),
        { headers: { "Content-Type": "application/json" }, jar: sellerJar },
      );
      const sellerMe = jsonOrNull(
        http.get(`${BASE_URL}/auth/me`, {
          jar: sellerJar,
          headers: { "Content-Type": "application/json" },
        }),
      );
      if (sellerMe?.id) {
        const goal = http.post(
          `${BASE_URL}/goals`,
          JSON.stringify({
            sellerId: sellerMe.id,
            period,
            targetAmount: Math.floor(Math.random() * 50000) + 10000,
          }),
          p,
        );
        check(goal, { "POST /goals": (r) => r.status === 201 });
      }
      sleep(0.3);

      // POST /products — só admin, 30% de chance
      if (Math.random() < 0.3) {
        const id = uid();
        check(
          http.post(
            `${BASE_URL}/products`,
            JSON.stringify({
              sku: `SKU-${id}`,
              name: randomProductName(),
              costPrice: randomInt(10, 500),
              salePrice: randomInt(501, 1000),
              category: randomItem(CATEGORIES),
              initialStock: randomInt(50, 200),
            }),
            p
          ),
          { "POST /products": (r) => r.status === 201 }
        );
        sleep(0.3);
      }
    }
  }

  // GET /orders
  const ordersRes = http.get(`${BASE_URL}/orders`, p);
  check(ordersRes, { "GET /orders": (r) => r.status === 200 });
  const ordersBody = jsonOrNull(ordersRes);
  const orders = ordersBody?.items || [];
  sleep(0.3);

  // GET /orders/:id
  if (orders.length > 0) {
    const order = randomItem(orders);
    check(http.get(`${BASE_URL}/orders/${order.id}`, p), {
      "GET /orders/:id": (r) => r.status === 200,
    });
    sleep(0.3);
  }

  // POST /orders (40% de chance)
  let newOrderId = null;
  if (Math.random() < 0.8 && products.length > 0 && clients.length > 0) {
    const orderRes = http.post(
      `${BASE_URL}/orders`,
      JSON.stringify({
        clientId: randomItem(clients).id,
        items: [
          {
            productId: randomItem(products).id,
            quantity: Math.floor(Math.random() * 3) + 1,
          },
        ],
      }),
      p,
    );
    check(orderRes, {
      "POST /orders": (r) => r.status === 201 || r.status === 200,
    });
    const orderBody = jsonOrNull(orderRes);
    newOrderId = orderBody?.id || orderBody?.order?.id;
    sleep(0.5);

    // PATCH /orders/:id/confirm (70% dos pedidos criados)
    if (newOrderId && Math.random() < 0.7) {
      check(http.patch(`${BASE_URL}/orders/${newOrderId}/confirm`, null, p), {
        "PATCH /orders/:id/confirm": (r) => r.status === 200,
      });
      sleep(0.3);
      // PATCH /orders/:id/cancel (30% dos pedidos criados)
    } else if (newOrderId) {
      check(http.patch(`${BASE_URL}/orders/${newOrderId}/cancel`, null, p), {
        "PATCH /orders/:id/cancel": (r) => r.status === 200,
      });
      sleep(0.3);
    }
  }

  // GET /reports/sales
  check(http.get(`${BASE_URL}/reports/sales`, p), {
    "GET /reports/sales": (r) => r.status === 200,
  });
  sleep(0.5);

  // POST /auth/logout
  check(http.post(`${BASE_URL}/auth/logout`, null, p), {
    "POST /auth/logout": (r) => r.status === 200,
  });
  sleep(2);
}
