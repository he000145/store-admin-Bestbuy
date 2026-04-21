<template>
  <section class="order-detail-page" v-if="orderExists">
    <div class="detail-actions">
      <button @click="refreshOrder">Refresh Order</button>
      <button
        v-if="canManuallyComplete"
        @click="completeOrder"
        class="secondary-button"
      >
        Mark Completed (Optional Override)
      </button>
    </div>

    <section class="detail-panel">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Best Buy Demo Admin</p>
          <h1>Order {{ order.orderId }}</h1>
          <p class="detail-copy">
            Use this page to inspect the order workflow while makeline-service updates status in the background.
          </p>
        </div>
        <span class="status-badge" :class="`status-badge--${statusVariant(order.statusKey)}`">
          {{ order.statusLabel }}
        </span>
      </div>

      <div class="detail-grid">
        <article>
          <span>Customer</span>
          <strong>{{ displayCustomer(order) }}</strong>
        </article>
        <article>
          <span>Items</span>
          <strong>{{ order.itemsCount }}</strong>
        </article>
        <article>
          <span>Total</span>
          <strong>{{ formatCurrency(order.total) }}</strong>
        </article>
        <article>
          <span>Updated</span>
          <strong>{{ formatDateTime(order.updatedAt) }}</strong>
        </article>
      </div>

      <div class="timeline-note">
        <strong>Workflow:</strong> pending -> processing -> completed
      </div>
    </section>

    <section class="detail-panel">
      <div class="panel-heading">
        <h2>Order Items</h2>
        <p>{{ formatDateTime(order.createdAt) }}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.productId">
            <td data-label="Product ID">
              <router-link :to="`/product/${item.productId}`">{{ item.productId }}</router-link>
            </td>
            <td data-label="Name">{{ productLookup(item) }}</td>
            <td data-label="Quantity">{{ item.quantity }}</td>
            <td data-label="Price">{{ formatCurrency(item.price) }}</td>
            <td data-label="Total">{{ formatCurrency(item.quantity * item.price) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td data-label="Summary" colspan="4"><strong>Order Total</strong></td>
            <td data-label="Total"><strong>{{ formatCurrency(order.total) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </section>
  </section>

  <section class="order-detail-page" v-else>
    <div class="detail-panel empty-state">
      <h3>Order not found yet</h3>
      <p>
        Refresh after a storefront order is created, or confirm that order-service and makeline-service are running.
      </p>
      <button @click="refreshOrder">Refresh Order</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'OrderDetail',
  props: ['orders', 'products'],
  emits: ['completeOrder', 'fetchOrders'],
  data() {
    return {
      fetchedOrder: null
    };
  },
  computed: {
    order() {
      return this.orders.find(order => order.orderId === this.$route.params.id) || this.fetchedOrder;
    },
    orderExists() {
      return !!this.order;
    },
    canManuallyComplete() {
      return this.order && this.order.statusKey !== 'completed';
    }
  },
  mounted() {
    this.refreshOrder();
  },
  methods: {
    refreshOrder() {
      this.$emit('fetchOrders');

      fetch(`/orders/${this.$route.params.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Order not found in order-service');
          }

          return response.text();
        })
        .then(rawOrder => {
          if (rawOrder) {
            this.fetchedOrder = this.normalizeOrder(JSON.parse(rawOrder));
          }
        })
        .catch(() => {
          this.fetchedOrder = null;
        });
    },
    normalizeOrder(order) {
      const items = Array.isArray(order.items) ? order.items : [];
      const status = order.status ?? order.orderStatus ?? order.state ?? 'unknown';
      const statusKey = this.normalizeStatusKey(status);

      return {
        ...order,
        orderId: String(order.orderId ?? order.id ?? order._id ?? ''),
        customerId: String(order.customerId ?? order.customer?.customerId ?? order.customer?.id ?? ''),
        customerName: order.customerName ?? order.customer?.name ?? order.customer?.fullName ?? '',
        items,
        itemsCount: order.itemsCount ?? items.reduce((count, item) => count + Number(item.quantity || 0), 0),
        total: this.orderTotal(items, order.total ?? order.amount ?? order.orderTotal),
        status,
        statusKey,
        statusLabel: this.statusLabel(status, statusKey),
        createdAt: order.createdAt ?? order.created_at ?? order.orderDate ?? order.timestamp ?? '',
        updatedAt: order.updatedAt ?? order.updated_at ?? order.lastUpdated ?? order.processedAt ?? ''
      };
    },
    normalizeStatusKey(status) {
      if (typeof status === 'number') {
        if (status === 0) {
          return 'pending';
        }

        if (status === 1) {
          return 'processing';
        }

        if (status === 2) {
          return 'completed';
        }
      }

      const normalized = String(status).trim().toLowerCase();

      if (normalized === '0') {
        return 'pending';
      }

      if (normalized === '1') {
        return 'processing';
      }

      if (normalized === '2') {
        return 'completed';
      }

      return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
    },
    statusLabel(status, statusKey) {
      const labels = {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        failed: 'Failed'
      };

      if (labels[statusKey]) {
        return labels[statusKey];
      }

      if (typeof status === 'number') {
        return `Status ${status}`;
      }

      return String(status)
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Unknown';
    },
    completeOrder() {
      this.$emit('completeOrder', this.order.orderId);
    },
    displayCustomer(order) {
      return order.customerName || order.customerId || 'Guest Customer';
    },
    productLookup(item) {
      const matchingProduct = this.products.find(product => String(product.id) === String(item.productId));

      return matchingProduct?.name || item.name || 'Electronics Product';
    },
    orderTotal(items, explicitTotal) {
      const total = Number(explicitTotal);

      if (Number.isFinite(total) && total >= 0) {
        return total;
      }

      return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
    },
    formatCurrency(value) {
      return Number(value || 0).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD'
      });
    },
    formatDateTime(value) {
      if (!value) {
        return 'Not available';
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString();
    },
    statusVariant(statusKey) {
      if (['pending', 'processing', 'completed', 'cancelled', 'failed'].includes(statusKey)) {
        return statusKey;
      }

      return 'unknown';
    }
  }
};
</script>

<style scoped>
.order-detail-page {
  display: grid;
  gap: 1.5rem;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.detail-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(216, 226, 239, 0.9);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--bb-shadow);
}

.detail-header,
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--bb-blue);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-header h1,
.panel-heading h2 {
  margin: 0;
}

.detail-copy,
.panel-heading p,
.empty-state p {
  color: var(--bb-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.detail-grid article {
  padding: 1rem;
  border-radius: 18px;
  background: var(--bb-surface-alt);
  border: 1px solid var(--bb-border);
}

.detail-grid span {
  display: block;
  color: var(--bb-muted);
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.detail-grid strong {
  font-size: 1.05rem;
}

.timeline-note {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 224, 0, 0.2);
  color: #705800;
}

.secondary-button {
  background: #0d6b4e;
}

.secondary-button:hover {
  background: #0a563e;
}

.empty-state {
  text-align: left;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-header,
  .panel-heading,
  .detail-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
