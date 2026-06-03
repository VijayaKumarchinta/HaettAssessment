<template>
  <section class="hero card">
    <div class="hero-content">
      <div class="hero-left">
        <span class="hero-badge"> 🚀 Haett Partner Program </span>

        <h1>Become a Haett Partner</h1>

        <p>
          Grow your audience, share exclusive discount codes, and earn rewards
          with every successful referral.
        </p>

        <div class="hero-actions">
          <button class="primary-btn" @click="$emit('login')">Apply Now</button>

          <button class="secondary-btn">Learn More</button>
        </div>
      </div>

      <div class="hero-right">🍱</div>
    </div>
  </section>

  <section class="feature-grid">
    <div class="card feature-card">
      <h3>Revenue Sharing</h3>
      <p>Earn commissions from successful referrals.</p>
    </div>

    <div class="card feature-card">
      <h3>Marketing Support</h3>
      <p>Exclusive campaigns and promotional assets.</p>
    </div>

    <div class="card feature-card">
      <h3>Performance Tracking</h3>
      <p>Monitor code usage and partner growth.</p>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 80px;
  margin-bottom: 40px;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-left {
  max-width: 600px;
}

.hero-right {
  font-size: 180px;
  opacity: 0.8;
}

.hero-badge {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 999px;
  background: #fff3ed;
  color: #ff6b35;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 64px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 20px;
  color: #64748b;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.secondary-btn {
  padding: 14px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  padding: 30px;
}
</style>
