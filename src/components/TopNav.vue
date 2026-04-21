<template>
  <nav class="top-nav">
    <router-link class="brand" to="/" @click="closeNav">
      <span class="brand-mark">BB</span>
      <div class="brand-copy">
        <span class="brand-title">Best Buy Admin Dashboard</span>
        <small>Monitor orders and products for the CST8915 final project</small>
      </div>
    </router-link>

    <ul class="nav-links" :class="{ 'nav-links--open': isNavOpen }">
      <li><router-link to="/orders" @click="closeNav">Orders</router-link></li>
      <li><router-link to="/products" @click="closeNav">Products</router-link></li>
    </ul>

    <button class="hamburger" @click="toggleNav" aria-label="Toggle navigation">
      <span class="hamburger-icon"></span>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'TopNav',
  data() {
    return {
      isNavOpen: false
    };
  },
  methods: {
    toggleNav() {
      this.isNavOpen = !this.isNavOpen;
    },
    closeNav() {
      this.isNavOpen = false;
    }
  }
};
</script>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, var(--bb-blue) 0%, #0b5bda 100%);
  color: #fff;
  padding: 1rem 1.25rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  box-shadow: 0 16px 36px rgba(0, 49, 138, 0.28);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  color: inherit;
}

.brand:hover {
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 16px;
  background: var(--bb-yellow);
  color: var(--bb-blue);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 800;
}

.brand-copy small {
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.8rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
}

.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.14);
  text-decoration: none;
}

.hamburger {
  display: none;
  background: transparent;
  box-shadow: none;
}

.hamburger:hover {
  background: transparent;
  box-shadow: none;
}

.hamburger-icon {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #fff;
  position: relative;
}

.hamburger-icon::before,
.hamburger-icon::after {
  content: '';
  display: block;
  width: 22px;
  height: 2px;
  background-color: #fff;
  position: absolute;
  left: 0;
}

.hamburger-icon::before {
  top: -6px;
}

.hamburger-icon::after {
  bottom: -6px;
}

@media (max-width: 768px) {
  .top-nav {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .nav-links {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding-top: 0.75rem;
  }

  .nav-links--open {
    display: flex;
  }

  .hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3rem;
    padding: 0.85rem;
  }
}
</style>
