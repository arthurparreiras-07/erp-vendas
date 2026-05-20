// Schemas OpenAPI compartilhados entre as rotas.
// Registrados via app.addSchema() no swagger.plugin.ts e referenciados
// nas rotas com { $ref: 'NomeDoSchema#' }.
// Orval lê esses schemas do /docs/json e gera os tipos TypeScript no frontend.

const productEmbed = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    sku: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    costPrice: { type: 'number' },
    salePrice: { type: 'number' },
    category: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'sku', 'name', 'costPrice', 'salePrice'],
};

const stockEmbed = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    physical: { type: 'integer' },
    reserved: { type: 'integer' },
    available: { type: 'integer' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'physical', 'reserved', 'available'],
};

const orderItemEmbed = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    quantity: { type: 'integer' },
    unitPrice: { type: 'number' },
    subtotal: { type: 'number' },
    product: productEmbed,
  },
  required: ['id', 'quantity', 'unitPrice', 'subtotal'],
};

export const authUserSchema = {
  $id: 'AuthUser',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'vendedor'] },
  },
  required: ['id', 'name', 'email', 'role'],
} as const;

export const clientSchema = {
  $id: 'Client',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    cnpj: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    region: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'name', 'createdAt'],
} as const;

export const productSchema = {
  $id: 'Product',
  type: 'object',
  properties: {
    id: { type: 'string' },
    sku: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    costPrice: { type: 'number' },
    salePrice: { type: 'number' },
    category: { type: 'string' },
    createdAt: { type: 'string' },
    stock: stockEmbed,
  },
  required: ['id', 'sku', 'name', 'costPrice', 'salePrice', 'createdAt'],
} as const;

export const stockSchema = {
  $id: 'Stock',
  type: 'object',
  properties: {
    id: { type: 'string' },
    physical: { type: 'integer' },
    reserved: { type: 'integer' },
    available: { type: 'integer' },
    updatedAt: { type: 'string' },
    product: productEmbed,
  },
  required: ['id', 'physical', 'reserved', 'available', 'updatedAt', 'product'],
} as const;

export const orderSchema = {
  $id: 'Order',
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
    subtotal: { type: 'number' },
    discount: { type: 'number' },
    tax: { type: 'number' },
    total: { type: 'number' },
    createdAt: { type: 'string' },
    client: { $ref: 'Client#' },
    seller: { $ref: 'AuthUser#' },
    items: { type: 'array', items: orderItemEmbed },
  },
  required: ['id', 'status', 'subtotal', 'discount', 'tax', 'total', 'createdAt'],
} as const;

export const activitySchema = {
  $id: 'Activity',
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string', enum: ['new_order', 'stock_alert', 'new_client', 'stock_update'] },
    description: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'type', 'description', 'createdAt'],
} as const;

export const goalSchema = {
  $id: 'Goal',
  type: 'object',
  properties: {
    id: { type: 'string' },
    period: { type: 'string' },
    targetAmount: { type: 'number' },
    seller: { $ref: 'AuthUser#' },
  },
  required: ['id', 'period', 'targetAmount'],
} as const;

export const kpisSchema = {
  $id: 'Kpis',
  type: 'object',
  properties: {
    totalSales: { type: 'integer' },
    newClients: { type: 'integer' },
    lowStockItems: { type: 'integer' },
    monthlyRevenue: { type: 'number' },
  },
  required: ['totalSales', 'newClients', 'lowStockItems', 'monthlyRevenue'],
} as const;

export const chartSchema = {
  $id: 'Chart',
  type: 'object',
  properties: {
    labels: { type: 'array', items: { type: 'string' } },
    values: { type: 'array', items: { type: 'number' } },
  },
  required: ['labels', 'values'],
} as const;

export const salesReportRowSchema = {
  $id: 'SalesReportRow',
  type: 'object',
  properties: {
    sellerId: { type: 'string' },
    sellerName: { type: 'string' },
    totalAmount: { type: 'number' },
    orderCount: { type: 'integer' },
    avgMargin: { type: 'number' },
  },
  required: ['sellerId', 'sellerName', 'totalAmount', 'orderCount', 'avgMargin'],
} as const;

// Wrappers paginados para uso direto nas rotas
export const paginatedClients = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: 'Client#' } },
    total: { type: 'integer' },
    page: { type: 'integer' },
  },
  required: ['items', 'total', 'page'],
} as const;

export const paginatedProducts = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: 'Product#' } },
    total: { type: 'integer' },
    page: { type: 'integer' },
  },
  required: ['items', 'total', 'page'],
} as const;

export const paginatedOrders = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: 'Order#' } },
    total: { type: 'integer' },
    page: { type: 'integer' },
  },
  required: ['items', 'total', 'page'],
} as const;
