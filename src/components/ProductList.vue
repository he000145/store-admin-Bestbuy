<template>
  <section class="product-page">
    <div class="action-button">
      <router-link to="/product/add">
        <button class="button">Add Product</button>
      </router-link>
    </div>

    <section class="product-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Product Visibility</p>
          <h1>Electronics Catalog</h1>
          <p>
            This secondary view helps the admin team confirm which products are available for storefront orders.
          </p>
        </div>
        <strong>{{ products.length }} products</strong>
      </div>

      <div class="product-list" v-if="products.length">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td data-label="Product ID"><router-link :to="`/product/${product.id}`">{{ product.id }}</router-link></td>
              <td data-label="Name">{{ product.name }}</td>
              <td data-label="Description">{{ product.description || 'No description provided' }}</td>
              <td data-label="Price">{{ formatCurrency(product.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else>
        <h3>No products available</h3>
        <p>Add a demo electronics product or confirm that product-service is running.</p>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'ProductList',
  props: ['products'],
  mounted() {
    this.$emit('getProducts');
  },
  methods: {
    formatCurrency(value) {
      return Number(value || 0).toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD'
      });
    }
  }
};
</script>

<style scoped>
.product-page {
  display: grid;
  gap: 1rem;
}

.product-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(216, 226, 239, 0.9);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--bb-shadow);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-heading h1 {
  margin: 0;
}

.panel-heading p,
.empty-state p {
  color: var(--bb-muted);
}

.panel-heading strong {
  font-size: 1.1rem;
  color: var(--bb-blue);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--bb-blue);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .panel-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
