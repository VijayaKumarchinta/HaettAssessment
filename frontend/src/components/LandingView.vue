<template>
  <div class="card hero">
    <h1>Grow With Haett</h1>

    <p>
      Become an approved partner and unlock exclusive discount codes, marketing
      support, and commission opportunities.
    </p>

    <p>
      Join the Haett partner ecosystem and earn commissions through referrals,
      marketing campaigns and audience engagement.
    </p>

    <br />

    <button class="btn btn-primary" @click="$emit('login')">Get Started</button>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Revenue Sharing</h3>
      <p>Earn commissions for every successful referral.</p>
    </div>

    <div class="card">
      <h3>Marketing Support</h3>
      <p>Access banners, campaigns and promotions.</p>
    </div>

    <div class="card">
      <h3>Performance Tracking</h3>
      <p>Monitor partner performance and codes.</p>
    </div>
  </div>
</template>
