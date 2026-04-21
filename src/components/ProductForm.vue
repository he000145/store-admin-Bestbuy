<template>
  <section class="product-form-page">
    <div class="action-button">
      <button @click="saveProduct" class="button">Save Product</button>
    </div>

    <section class="form-panel">
      <p class="eyebrow">{{ formModeLabel }}</p>
      <h1>{{ formTitle }}</h1>
      <p class="panel-copy">
        Keep product maintenance lightweight. This view is secondary to order monitoring, but it supports the demo.
      </p>

      <div v-if="showValidationErrors" class="error">
        <ul>
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <div class="product-form">
        <table>
          <tbody>
            <tr>
              <td><label for="product-name">Name</label></td>
              <td><input id="product-name" placeholder="e.g. Wireless Headphones" v-model="product.name"></td>
            </tr>
            <tr>
              <td><label for="product-price">Price</label></td>
              <td><input id="product-price" placeholder="e.g. 199.99" v-model="product.price" type="number" step="0.01"></td>
            </tr>
            <tr>
              <td><label for="product-tags">Keywords</label></td>
              <td><input id="product-tags" placeholder="audio, bluetooth, electronics" v-model="product.tags"></td>
            </tr>
            <tr>
              <td><label for="product-description">Description</label></td>
              <td>
                <textarea
                  rows="8"
                  id="product-description"
                  placeholder="Short demo-friendly description for the product"
                  v-model="product.description"
                ></textarea>
                <input type="hidden" id="product-id" v-model="product.id">
              </td>
            </tr>
            <tr>
              <td><label for="product-image-text">Image URL</label></td>
              <td><input id="product-image-text" placeholder="https://example.com/product-image.jpg" v-model="product.image"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<script>
const productServiceUrl = '/product/';

export default {
  name: 'ProductForm',
  props: ['products'],
  emits: ['addProductsToList', 'updateProductInList'],
  data() {
    return {
      product: {
        id: 0,
        name: '',
        image: '/placeholder.png',
        description: '',
        price: 0.00,
        tags: ''
      },
      showValidationErrors: false
    };
  },
  computed: {
    formTitle() {
      return this.$route.params.id ? 'Edit Electronics Product' : 'Add Electronics Product';
    },
    formModeLabel() {
      return this.$route.params.id ? 'Update Product' : 'Create Product';
    },
    validationErrors() {
      const errors = [];

      if (this.product.name.length === 0) {
        errors.push('Please enter a value for the name field');
      }

      if (this.product.description.length === 0) {
        errors.push('Please enter a value for the description field');
      }

      if (this.product.price <= 0) {
        errors.push('Please enter a value greater than 0 for the price field');
      }

      return errors;
    }
  },
  watch: {
    products: {
      handler() {
        this.loadProductForEdit();
      },
      immediate: true
    }
  },
  methods: {
    loadProductForEdit() {
      if (!this.$route.params.id) {
        return;
      }

      const product = this.products.find(existingProduct => existingProduct.id == this.$route.params.id);

      if (!product) {
        return;
      }

      this.product = {
        ...product,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '')
      };
    },
    saveProduct() {
      if (this.validationErrors.length > 0) {
        this.showValidationErrors = true;
        return;
      }

      let method = 'PUT';
      const path = this.$route.path;

      if (path.includes('add')) {
        method = 'POST';
      }

      const productPayload = {
        ...this.product,
        price: parseFloat(this.product.price),
        tags: this.normalizeTags(this.product.tags)
      };

      fetch(productServiceUrl, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      })
        .then(response => response.json())
        .then(product => {
          const savedProduct = {
            ...productPayload,
            ...product
          };

          alert('Product saved successfully');

          if (method === 'PUT') {
            this.$emit('updateProductInList', savedProduct);
          } else {
            this.$emit('addProductsToList', savedProduct);
          }

          this.$router.push(`/product/${savedProduct.id}`);
        })
        .catch(error => {
          console.log(error);
          alert('Error occurred while saving product');
        });
    },
    normalizeTags(tags) {
      if (Array.isArray(tags)) {
        return tags;
      }

      return String(tags || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
    }
  }
};
</script>

<style scoped>
.product-form-page {
  display: grid;
  gap: 1rem;
}

.form-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(216, 226, 239, 0.9);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: var(--bb-shadow);
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--bb-blue);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-panel h1 {
  margin: 0;
}

.panel-copy {
  color: var(--bb-muted);
  margin-bottom: 1.25rem;
}

.error {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(202, 33, 64, 0.08);
  border: 1px solid rgba(202, 33, 64, 0.16);
}

.error ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #8f1d33;
}

table {
  box-shadow: none;
  border-radius: 0;
}

td {
  vertical-align: top;
  border-bottom: none;
  background: transparent;
}

td:first-child {
  width: 9rem;
}
</style>
