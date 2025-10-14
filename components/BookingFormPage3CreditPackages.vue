<script setup lang="ts">
import type { CreditPackage, CreditRefund } from '~/types/data';

const creditsStore = useCreditsStore()
const { 
  currentUserPackages, 
  currentCreditRefunds,
  purchasedCreditsLeft,
  refundCreditsLeft,
  totalCreditsLeft 
} = storeToRefs(creditsStore)

const dayjs = useDayjs()

// Combine and sort: refunds first (by expiry), then purchased (by expiry)
const allCredits = computed(() => {
  const purchased = currentUserPackages.value.map(pkg => ({
    ...pkg,
    isRefund: false,
    type: 'Purchased'
  }))
  
  const refunds = currentCreditRefunds.value.map(refund => ({
    ...refund,
    isRefund: true,
    type: 'Refund'
  }))
  
  // Sort refunds by expiry
  const sortedRefunds = refunds.sort((a, b) => 
    dayjs(a.expiryDate).diff(dayjs(b.expiryDate))
  )
  
  // Sort purchased by expiry
  const sortedPurchased = purchased.sort((a, b) => 
    dayjs(a.expiryDate).diff(dayjs(b.expiryDate))
  )
  
  // Refunds first, then purchased
  return [...sortedRefunds, ...sortedPurchased]
})

// Check if credit is expiring soon (within 7 days)
const isExpiringSoon = (expiryDate: string) => {
  return dayjs(expiryDate).diff(dayjs(), 'days') <= 7
}

// Format expiry date
const formatExpiryDate = (expiryDate: string) => {
  return dayjs(expiryDate).format('DD MMM YYYY')
}

// Calculate days until expiry
const daysUntilExpiry = (expiryDate: string) => {
  const days = dayjs(expiryDate).diff(dayjs(), 'days')
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `Expires in ${days} days`
}
</script>

<template>
  <div class="bookingFormPage3CreditPackages">
    <h5>Your Available Credits</h5>
    
    <!-- Summary -->
    <div class="credits-summary">
      <div class="summary-row total">
        <span class="label">Total Credits:</span>
        <span class="amount">${{ totalCreditsLeft }}</span>
      </div>
      <div class="summary-row purchased">
        <VIcon icon="mdi-cash-multiple" size="small" color="green" />
        <span class="label">Purchased:</span>
        <span class="amount">${{ purchasedCreditsLeft }}</span>
      </div>
      <div class="summary-row refund">
        <VIcon icon="mdi-cash-refund" size="small" color="orange" />
        <span class="label">Refund (1 month expiry):</span>
        <span class="amount">${{ refundCreditsLeft }}</span>
      </div>
    </div>
    
    <!-- Credit Packages List -->
    <div class="credits-list">
      <div class="list-header">
        <span>Credits will be deducted in this order (refunds first, then by expiry date):</span>
      </div>
      
      <div 
        v-for="(credit, index) in allCredits" 
        :key="credit.key"
        class="credit-item"
        :class="{ 
          'is-refund': credit.isRefund,
          'is-expiring': isExpiringSoon(credit.expiryDate)
        }"
      >
        <div class="credit-order">{{ index + 1 }}</div>
        
        <div class="credit-info">
          <div class="credit-title">
            <VIcon 
              :icon="credit.isRefund ? 'mdi-cash-refund' : 'mdi-cash-multiple'" 
              size="small"
              :color="credit.isRefund ? 'orange' : 'green'"
            />
            <span class="credit-type">{{ credit.type }} Credit</span>
            <VChip 
              v-if="credit.isRefund" 
              size="x-small" 
              color="orange"
              variant="flat"
            >
              1 Month Expiry
            </VChip>
          </div>
          
          <div class="credit-details">
            <span class="credit-package-name">{{ credit.creditPackage.title }}</span>
          </div>
        </div>
        
        <div class="credit-amount">
          <div class="amount-value">${{ credit.creditsLeft }}</div>
          <div 
            class="expiry-date"
            :class="{ 'expiring-soon': isExpiringSoon(credit.expiryDate) }"
          >
            <VIcon 
              icon="mdi-clock-outline" 
              size="x-small"
              :color="isExpiringSoon(credit.expiryDate) ? 'error' : 'grey'"
            />
            {{ daysUntilExpiry(credit.expiryDate) }}
          </div>
          <div class="expiry-full-date">{{ formatExpiryDate(credit.expiryDate) }}</div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="allCredits.length === 0" class="empty-state">
        <VIcon icon="mdi-wallet-outline" size="large" color="grey" />
        <p>No credits available</p>
      </div>
    </div>
    
    <!-- Warning for Refund Credits -->
    <VAlert 
      v-if="refundCreditsLeft > 0"
      type="warning"
      variant="tonal"
      density="compact"
      icon="mdi-alert-circle"
    >
      <strong>Reminder:</strong> Refund credits expire in 1 month and will be used first. Use them before they expire!
    </VAlert>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3CreditPackages {
  display: flex;
  flex-direction: column;
  gap: $margin;
  padding: $margin;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.credits-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: $unit;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .summary-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &.total {
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .label {
      flex: 1;
      color: rgba(0, 0, 0, 0.7);
    }
    
    .amount {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }
  }
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  .list-header {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 500;
  }
  
  .credit-item {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: $unit;
    background: white;
    border-radius: 8px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    
    &.is-refund {
      border-color: #FF9800;
      background: #FFF3E0;
    }
    
    &.is-expiring {
      border-color: #F44336;
      background: #FFEBEE;
      animation: pulse 2s infinite;
    }
    
    .credit-order {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .credit-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      .credit-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        
        .credit-type {
          font-size: 0.95rem;
        }
      }
      
      .credit-details {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        
        .credit-package-name {
          font-style: italic;
        }
      }
    }
    
    .credit-amount {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      
      .amount-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #0A8A44;
      }
      
      .expiry-date {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 500;
        
        &.expiring-soon {
          color: #F44336;
          font-weight: 600;
        }
      }
      
      .expiry-full-date {
        font-size: 0.7rem;
        color: rgba(0, 0, 0, 0.5);
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: rgba(0, 0, 0, 0.4);
    
    p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
  }
}
</style>

