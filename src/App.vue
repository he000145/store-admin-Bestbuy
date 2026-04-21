<template>
  <TopNav />
  <main class="app-shell">
    <router-view
      :orders="orders"
      :products="products"
      @fetchOrders="fetchOrders"
      @completeOrder="completeOrder"
      @addProductsToList="addProductsToList"
      @updateProductInList="updateProductInList"
      @getProduct="getProduct"
      @getProducts="getProducts"
    />
  </main>
</template>

<script>
import TopNav from './components/TopNav.vue';

const orderServiceUrl = '/orders';
const productServiceUrl = '/products';
const singleProductServiceUrl = '/product/';
const makelineServiceUrl = '/makeline/';

export default {
  name: 'App',
  components: {
    TopNav
  },
  data() {
    return {
      orders: [],
      products: []
    };
  },
  mounted() {
    this.getProducts();
    this.fetchOrders();
  },
  methods: {
    async addProductsToList(newProduct) {
      this.products.push(newProduct);
    },
    async updateProductInList(updatedProduct) {
      const index = this.products.findIndex(product => product.id === updatedProduct.id);

      if (index >= 0) {
        this.products[index] = updatedProduct;
        return;
      }

      this.products.push(updatedProduct);
    },
    async getProduct(id) {
      fetch(`${singleProductServiceUrl}${id}`)
        .then(response => response.json())
        .then(product => {
          const index = this.products.findIndex(existingProduct => existingProduct.id === product.id);

          if (index >= 0) {
            this.products[index] = product;
          } else {
            this.products.push(product);
          }
        })
        .catch(error => {
          console.log(error);
          alert('Error occurred while fetching product');
        });
    },
    async getProducts() {
      fetch(productServiceUrl)
        .then(response => response.json())
        .then(products => {
          this.products = Array.isArray(products) ? products : [];
        })
        .catch(error => {
          console.log(error);
          alert('Error occurred while fetching products');
        });
    },
    async fetchOrders() {
      try {
        this.orders = await this.fetchOrderSource(orderServiceUrl);
      } catch (error) {
        console.log(error);
        this.orders = [];
      }
    },
    async fetchOrderSource(url) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Request failed for ${url}`);
      }

      const rawResponse = await response.text();
      let payload = [];

      if (rawResponse) {
        payload = JSON.parse(rawResponse);
      }

      return this.extractCollection(payload).map(order => this.normalizeOrder(order));
    },
    extractCollection(payload) {
      if (Array.isArray(payload)) {
        return payload;
      }

      if (payload && Array.isArray(payload.orders)) {
        return payload.orders;
      }

      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }

      if (payload && typeof payload === 'object' && (payload.orderId || payload.id || payload._id)) {
        return [payload];
      }

      return [];
    },
    mergeOrders(primaryOrders, secondaryOrders) {
      const mergedOrders = new Map();

      [...primaryOrders, ...secondaryOrders].forEach(order => {
        if (!order.orderId) {
          return;
        }

        const existing = mergedOrders.get(order.orderId);
        mergedOrders.set(order.orderId, existing ? this.mergeOrderData(existing, order) : order);
      });

      return Array.from(mergedOrders.values()).sort((leftOrder, rightOrder) => {
        const leftTimestamp = Date.parse(leftOrder.updatedAt || leftOrder.createdAt || '') || 0;
        const rightTimestamp = Date.parse(rightOrder.updatedAt || rightOrder.createdAt || '') || 0;

        if (rightTimestamp !== leftTimestamp) {
          return rightTimestamp - leftTimestamp;
        }

        return rightOrder.orderId.localeCompare(leftOrder.orderId);
      });
    },
    mergeOrderData(existingOrder, newOrder) {
      return {
        ...existingOrder,
        ...newOrder,
        items: newOrder.items.length ? newOrder.items : existingOrder.items,
        itemsCount: newOrder.itemsCount ?? existingOrder.itemsCount,
        total: newOrder.total ?? existingOrder.total,
        customerId: newOrder.customerId || existingOrder.customerId,
        customerName: newOrder.customerName || existingOrder.customerName,
        createdAt: newOrder.createdAt || existingOrder.createdAt,
        updatedAt: newOrder.updatedAt || existingOrder.updatedAt,
        status: newOrder.status ?? existingOrder.status,
        statusKey: newOrder.statusKey || existingOrder.statusKey,
        statusLabel: newOrder.statusLabel || existingOrder.statusLabel
      };
    },
    normalizeOrder(order) {
      const items = Array.isArray(order.items) ? order.items : [];
      const orderId = order.orderId ?? order.id ?? order._id ?? '';
      const customerId = order.customerId ?? order.customer?.customerId ?? order.customer?.id ?? '';
      const customerName = order.customerName ?? order.customer?.name ?? order.customer?.fullName ?? '';
      const statusValue = order.status ?? order.orderStatus ?? order.state ?? '';
      const normalizedStatus = this.normalizeStatus(statusValue);

      return {
        ...order,
        orderId: orderId !== null && orderId !== undefined ? String(orderId) : '',
        customerId: customerId !== null && customerId !== undefined ? String(customerId) : '',
        customerName,
        items,
        itemsCount: order.itemsCount ?? items.reduce((count, item) => count + Number(item.quantity || 0), 0),
        total: this.calculateOrderTotal(items, order.total ?? order.amount ?? order.orderTotal),
        status: statusValue,
        statusKey: normalizedStatus.key,
        statusLabel: normalizedStatus.label,
        createdAt: order.createdAt ?? order.created_at ?? order.orderDate ?? order.timestamp ?? '',
        updatedAt: order.updatedAt ?? order.updated_at ?? order.lastUpdated ?? order.processedAt ?? ''
      };
    },
    normalizeStatus(status) {
      if (status === null || status === undefined || status === '') {
        return {
          key: 'unknown',
          label: 'Unknown'
        };
      }

      if (typeof status === 'number') {
        if (status === 0) {
          return { key: 'pending', label: 'Pending' };
        }

        if (status === 1) {
          return { key: 'processing', label: 'Processing' };
        }

        if (status === 2) {
          return { key: 'completed', label: 'Completed' };
        }

        return {
          key: `status-${status}`,
          label: `Status ${status}`
        };
      }

      const normalizedValue = String(status).trim().toLowerCase();
      const statusMap = {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        failed: 'Failed'
      };

      if (statusMap[normalizedValue]) {
        return {
          key: normalizedValue,
          label: statusMap[normalizedValue]
        };
      }

      if (normalizedValue === '0') {
        return { key: 'pending', label: 'Pending' };
      }

      if (normalizedValue === '1') {
        return { key: 'processing', label: 'Processing' };
      }

      if (normalizedValue === '2') {
        return { key: 'completed', label: 'Completed' };
      }

      const key = normalizedValue.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';

      return {
        key,
        label: this.toTitleCase(normalizedValue)
      };
    },
    calculateOrderTotal(items, explicitTotal) {
      const total = Number(explicitTotal);

      if (Number.isFinite(total) && total >= 0) {
        return total;
      }

      return items.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);

        return sum + (price * quantity);
      }, 0);
    },
    toTitleCase(value) {
      return value
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    async completeOrder(orderId) {
      const order = this.orders.find(existingOrder => existingOrder.orderId === orderId);

      if (!order) {
        return;
      }

      const updatedOrder = {
        ...order,
        status: typeof order.status === 'number' ? 2 : 'completed'
      };

      await fetch(`${makelineServiceUrl}order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedOrder)
      })
        .then(response => {
          if (!response.ok) {
            alert('Error occurred while updating the order status');
            return;
          }

          alert('Order status override saved');
          return this.fetchOrders();
        })
        .catch(error => {
          console.log(error);
          alert('Error occurred while updating the order status');
        });
    }
  }
};
</script>

<style>
:root {
  --bb-blue: #0046be;
  --bb-blue-dark: #00318a;
  --bb-yellow: #ffe000;
  --bb-surface: #ffffff;
  --bb-surface-alt: #f3f7fc;
  --bb-border: #d8e2ef;
  --bb-text: #16324f;
  --bb-muted: #5b7083;
  --bb-shadow: 0 16px 36px rgba(0, 70, 190, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top right, rgba(255, 224, 0, 0.18), transparent 22rem),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  color: var(--bb-text);
  font-family: 'Trebuchet MS', 'Segoe UI', sans-serif;
}

#app {
  min-height: 100vh;
  color: var(--bb-text);
  text-align: left;
}

.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 7.5rem 1rem 2rem;
}

a {
  color: var(--bb-blue);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  padding: 0.75rem 1rem;
  background-color: var(--bb-blue);
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

button:hover {
  background-color: var(--bb-blue-dark);
  box-shadow: 0 12px 24px rgba(0, 70, 190, 0.2);
  transform: translateY(-1px);
}

button:disabled {
  cursor: default;
  opacity: 0.6;
  box-shadow: none;
  transform: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bb-surface);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--bb-shadow);
}

th,
td {
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--bb-border);
}

th {
  background: #eaf1fb;
  color: var(--bb-muted);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: none;
}

.action-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.product-detail {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.5rem;
  margin: 0 auto;
}

.product-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  width: min(100%, 760px);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

textarea,
select,
input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--bb-border);
  background: #fff;
  color: var(--bb-text);
  font: inherit;
}

label {
  margin-right: 10px;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 7.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-badge--pending {
  background: rgba(255, 224, 0, 0.28);
  color: #7a5d00;
}

.status-badge--processing {
  background: rgba(0, 70, 190, 0.14);
  color: var(--bb-blue);
}

.status-badge--completed {
  background: rgba(20, 148, 96, 0.14);
  color: #176b45;
}

.status-badge--cancelled,
.status-badge--failed,
.status-badge--unknown {
  background: rgba(202, 33, 64, 0.12);
  color: #8f1d33;
}

@media (max-width: 768px) {
  .app-shell {
    padding-top: 8.5rem;
  }

  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: 1rem;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: var(--bb-shadow);
  }

  td {
    background: #fff;
  }

  td::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 0.35rem;
    color: var(--bb-muted);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .product-detail {
    flex-direction: column;
  }
}
</style>
