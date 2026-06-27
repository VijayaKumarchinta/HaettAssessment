<template>
  <section class="hero card" aria-labelledby="hero-title">
    <div class="hero-content">
      <div class="hero-left">
        <span class="hero-badge" aria-hidden="true"> 🚀 Haett Partner Program </span>

        <h1 id="hero-title">Become a Haett Partner</h1>

        <p>
          Grow your audience, share exclusive discount codes, and earn rewards
          with every successful referral.
        </p>

        <div class="hero-actions">
          <button class="primary-btn" @click="$emit('login')" aria-label="Apply to become a partner">
            Apply Now
          </button>

          <button class="secondary-btn" aria-label="Learn more about the partner program">
            Learn More
          </button>
        </div>
      </div>

      <div class="hero-right" aria-hidden="true">🍱</div>
    </div>
  </section>

  <section class="feature-grid" aria-label="Program features">
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
  padding: clamp(24px, 6vw, 80px);
  margin-bottom: clamp(24px, 4vw, 40px);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.hero-left {
  max-width: 600px;
  flex: 1;
}

.hero-right {
  font-size: clamp(80px, 15vw, 180px);
  opacity: 0.8;
  flex-shrink: 0;
}

.hero-badge {
  display: inline-block;
  padding: clamp(6px, 1vw, 10px) clamp(12px, 2vw, 16px);
  border-radius: 999px;
  background: #fff3ed;
  color: #ff6b35;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: clamp(12px, 1.5vw, 14px);
}

.hero h1 {
  font-size: clamp(32px, 6vw, 64px);
  margin-bottom: 16px;
  line-height: 1.15;
}

.hero p {
  font-size: clamp(16px, 2vw, 20px);
  color: #64748b;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.secondary-btn {
  padding: 14px 24px;
  border-radius: var(--radius-btn);
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.2s, border-color 0.2s;
}

.secondary-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: clamp(20px, 3vw, 30px);
}

.feature-card h3 {
  font-size: clamp(16px, 2vw, 18px);
  margin-bottom: 8px;
}

.feature-card p {
  font-size: clamp(13px, 1.5vw, 14px);
  color: #64748b;
  line-height: 1.6;
}

/* ── Mobile: stack hero vertically ── */
@media (max-width: 640px) {
  .hero-content {
    flex-direction: column-reverse;
    text-align: center;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-left {
    max-width: 100%;
  }

  .hero-right {
    margin-bottom: -16px;
  }
}
</style>
