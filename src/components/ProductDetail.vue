<template>
  <section class="product-detail-page" v-if="productExists">
    <div class="action-button">
      <router-link :to="`/product/${$route.params.id}/edit`">
        <button class="button">Edit Product</button>
      </router-link>
    </div>

    <section class="product-panel">
      <p class="eyebrow">Product Overview</p>
      <div class="product-detail">
        <div class="product-image">
          <img :src="product.image || '/placeholder.png'" :alt="product.name">
        </div>
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="price">{{ formatCurrency(product.price) }}</p>
          <small>Product ID: {{ product.id }}</small>
          <p>{{ product.description || 'No description provided for this product yet.' }}</p>
        </div>
      </div>
    </section>
  </section>

  <section class="product-detail-page" v-else>
    <div class="product-panel">
      <h3>Product not found</h3>
      <p>Return to the product catalog and refresh product-service data if needed.</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProductDetail',
  props: ['products'],
  computed: {
    product() {
      return this.products.find(product => product.id == this.$route.params.id);
    },
    productExists() {
      return !!this.product;
    }
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
.product-detail-page {
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

.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--bb-blue);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-image {
  flex: 1;
  margin-right: 20px;
}

.product-image img {
  width: 100%;
  max-width: 360px;
  height: auto;
  border-radius: 20px;
  border: 1px solid var(--bb-border);
  background: var(--bb-surface-alt);
}

.product-info {
  flex: 1;
  text-align: left;
}

.product-info h1 {
  margin: 0 0 0.5rem;
}

.price {
  margin: 0 0 0.5rem;
  color: var(--bb-blue);
  font-size: 1.4rem;
  font-weight: 800;
}
</style>
