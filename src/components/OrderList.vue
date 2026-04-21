<template>
  <section class="order-dashboard">
    <header class="dashboard-hero">
      <div>
        <p class="eyebrow">Electronics Store Admin Panel</p>
        <h1>Order Status Monitoring</h1>
        <p class="hero-copy">
          Track new storefront orders and watch them move through the final-project workflow.
          This view refreshes automatically and keeps the latest order state front and center.
        </p>
      </div>
      <div class="hero-actions">
        <button @click="refreshOrders">Refresh Now</button>
        <p>Auto-refresh: every 15 seconds</p>
      </div>
    </header>

    <section class="summary-grid">
      <article class="summary-card">
        <span>Total Orders</span>
        <strong>{{ orders.length }}</strong>
      </article>
      <article class="summary-card">
        <span>Pending</span>
        <strong>{{ statusCounts.pending }}</strong>
      </article>
      <article class="summary-card">
        <span>Processing</span>
        <strong>{{ statusCounts.processing }}</strong>
      </article>
      <article class="summary-card">
        <span>Completed</span>
        <strong>{{ statusCounts.completed }}</strong>
      </article>
    </section>

    <section class="dashboard-panel">
      <div class="panel-toolbar">
        <div>
          <h2>Orders</h2>
          <p>
            Filter by status to focus on pending, processing, or completed orders during your demo.
          </p>
        </div>
        <div class="toolbar-controls">
          <label for="status-filter">Status Filter</label>
          <select id="status-filter" v-model="selectedStatus">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <p class="refresh-note" v-if="lastRefreshedAt">
        Last refreshed: {{ formatDateTime(lastRefreshedAt) }}
      </p>

      <div class="order-list" v-if="hasOrders">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td data-label="Order ID">
                <router-link :to="`/order/${order.orderId}`">{{ order.orderId }}</router-link>
              </td>
              <td data-label="Customer">{{ displayCustomer(order) }}</td>
              <td data-label="Items">{{ order.itemsCount }}</td>
              <td data-label="Total">{{ formatCurrency(order.total) }}</td>
              <td data-label="Status">
                <span class="status-badge" :class="`status-badge--${statusVariant(order.statusKey)}`">
                  {{ order.statusLabel }}
                </span>
              </td>
              <td data-label="Created">{{ formatDate(order.createdAt) }}</td>
              <td data-label="Updated">{{ formatDate(order.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else>
        <h3>No matching orders yet</h3>
        <p>
          New orders from the storefront will appear here. Use refresh if makeline-service is updating
          status in the background during your demo.
        </p>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'OrderList',
  props: ['orders'],
  emits: ['fetchOrders'],
  data() {
    return {
      selectedStatus: 'all',
      lastRefreshedAt: null,
      autoRefreshId: null
    };
  },
  computed: {
    filteredOrders() {
      if (this.selectedStatus === 'all') {
        return this.orders;
      }

      if (this.selectedStatus === 'other') {
        return this.orders.filter(order => !['pending', 'processing', 'completed'].includes(order.statusKey));
      }

      return this.orders.filter(order => order.statusKey === this.selectedStatus);
    },
    hasOrders() {
      return this.filteredOrders.length > 0;
    },
    statusCounts() {
      return this.orders.reduce((counts, order) => {
        if (counts[order.statusKey] !== undefined) {
          counts[order.statusKey] += 1;
        } else {
          counts.other += 1;
        }

        return counts;
      }, {
        pending: 0,
        processing: 0,
        completed: 0,
        other: 0
      });
    }
  },
  watch: {
    orders: {
      handler() {
        this.lastRefreshedAt = new Date();
      },
      deep: true
    }
  },
  mounted() {
    if (!this.orders.length) {
      this.refreshOrders();
    } else {
      this.lastRefreshedAt = new Date();
    }

    this.autoRefreshId = window.setInterval(() => {
      this.refreshOrders();
    }, 15000);
  },
  beforeUnmount() {
    window.clearInterval(this.autoRefreshId);
  },
  methods: {
    refreshOrders() {
      this.$emit('fetchOrders');
      this.lastRefreshedAt = new Date();
    },
    displayCustomer(order) {
      return order.customerName || order.customerId || 'Guest Customer';
    },
    formatCurrency(value) {
      const amount = Number(value || 0);

      return amount.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD'
      });
    },
    formatDate(value) {
      if (!value) {
        return 'Not available';
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString();
    },
    formatDateTime(value) {
      if (!value) {
        return 'Not available';
      }

      return new Date(value).toLocaleString();
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
.order-dashboard {
  display: grid;
  gap: 1.5rem;
}

.dashboard-hero,
.dashboard-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(216, 226, 239, 0.9);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--bb-shadow);
}

.dashboard-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--bb-blue);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-hero h1,
.dashboard-panel h2 {
  margin: 0;
}

.hero-copy,
.panel-toolbar p,
.hero-actions p,
.empty-state p,
.refresh-note {
  color: var(--bb-muted);
  line-height: 1.6;
}

.hero-copy {
  max-width: 50rem;
  margin: 0.75rem 0 0;
}

.hero-actions {
  text-align: right;
}

.hero-actions p {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card {
  padding: 1.25rem;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border: 1px solid var(--bb-border);
  box-shadow: var(--bb-shadow);
}

.summary-card span {
  display: block;
  color: var(--bb-muted);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-card strong {
  font-size: 2rem;
  color: var(--bb-blue);
}

.panel-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 18rem;
}

.toolbar-controls label {
  margin: 0;
  white-space: nowrap;
}

.refresh-note {
  margin: 0.75rem 0 1rem;
}

.empty-state {
  padding: 1rem 0 0.5rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-hero,
  .panel-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    width: 100%;
    text-align: left;
  }

  .toolbar-controls {
    min-width: 0;
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
