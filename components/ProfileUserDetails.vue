<script setup lang="ts">
const creditsStore = useCreditsStore();
const { totalCreditsLeft, purchasedCreditsLeft, refundCreditsLeft } =
  storeToRefs(creditsStore);
const user = useAuthUser();

// Edit mode state
const isEditMode = ref(false);
const isLoading = ref(false);
const updateSuccess = ref(false);
const updateError = ref(false);
const errorMessage = ref("");

// Form fields
const displayName = ref("");
const phoneNumber = ref("");

// Detect sign-in provider
const isEmailProvider = computed(() => {
  if (!user.value) return false;
  return (
    user.value.providerData?.some(
      (provider: any) => provider.providerId === "password"
    ) ?? false
  );
});

// Initialize form fields when entering edit mode
function enterEditMode() {
  displayName.value = user.value?.displayName || "";
  // Remove +65 prefix if present
  const phone = user.value?.phoneNumber || "";
  phoneNumber.value = phone.startsWith("+65") ? phone.substring(3) : phone;
  isEditMode.value = true;
  updateSuccess.value = false;
  updateError.value = false;
}

function cancelEdit() {
  isEditMode.value = false;
  updateSuccess.value = false;
  updateError.value = false;
  errorMessage.value = "";
}

async function saveProfile() {
  // Validation
  if (!displayName.value || displayName.value.trim() === "") {
    updateError.value = true;
    errorMessage.value = "Display name is required";
    return;
  }

  const phoneRegex = /^(6|8|9)\d{7}$/;
  if (phoneNumber.value && !phoneRegex.test(phoneNumber.value)) {
    updateError.value = true;
    errorMessage.value =
      "Invalid phone number format (must be 8 digits starting with 6, 8, or 9)";
    return;
  }

  if (!user.value?.uid) return;

  isLoading.value = true;
  updateError.value = false;
  updateSuccess.value = false;

  try {
    const finalNumber = phoneNumber.value ? "+65" + phoneNumber.value : "";

    // Call the update API directly instead of using useAuth composable
    const error = await $fetch("/api/auth/update", {
      method: "POST",
      body: JSON.stringify({
        uid: user.value.uid,
        data: {
          phoneNumber: finalNumber,
          displayName: displayName.value,
        },
      }),
    }).catch((err) => err);

    if (error && error.statusCode) {
      updateError.value = true;
      if (error.data?.message === "auth/phone-number-already-exists") {
        errorMessage.value = "Phone number already exists";
      } else {
        errorMessage.value = error.data?.message || "Failed to update profile";
      }
    } else {
      // Update local user state
      if (user.value) {
        user.value = {
          ...user.value,
          phoneNumber: finalNumber,
          displayName: displayName.value,
        };
      }

      updateSuccess.value = true;
      setTimeout(() => {
        isEditMode.value = false;
        updateSuccess.value = false;
      }, 2000);
    }
  } catch (error) {
    updateError.value = true;
    errorMessage.value = "An error occurred while updating profile";
  } finally {
    isLoading.value = false;
  }
}

async function sendPasswordReset() {
  if (!user.value?.email) return;

  try {
    const response = await $fetch<{ success: boolean; message: string }>(
      "/api/auth/password-reset",
      {
        method: "POST",
        body: { email: user.value.email },
      }
    );

    if (response.success) {
      alert("Password reset email sent! Please check your inbox.");
    }
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    const errorMessage =
      error.data?.statusMessage ||
      "Failed to send password reset email. Please try again.";
    alert(errorMessage);
  }
}
</script>
<template>
  <div class="profileUserDetails">
    <img src="/Icon/user_profile.svg" alt="User Profile" class="icon" />

    <!-- View Mode / Edit Mode -->
    <ClientOnly>
      <div v-if="!isEditMode" class="profile__details">
        <div class="details-header">
          <h3>{{ user?.displayName }}</h3>
          <VBtn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="enterEditMode"
            title="Edit Profile"
          />
        </div>
        <p>{{ user?.phoneNumber }}</p>
        <p class="email-field">
          {{ user?.email }}
          <VTooltip activator="parent" location="bottom">
            Email cannot be changed as it's used to identify your bookings
          </VTooltip>
        </p>

        <!-- Password Change Button (Email users only) -->
        <VBtn
          v-if="isEmailProvider"
          variant="outlined"
          size="small"
          prepend-icon="mdi-lock-reset"
          @click="sendPasswordReset"
          class="password-reset-btn"
        >
          Change Password
        </VBtn>
        <p v-else class="google-account-info">
          <VIcon icon="mdi-google" size="small" />
          Account managed by Google
        </p>
      </div>

      <!-- Edit Mode -->
      <div v-else class="profile__details profile__details--edit">
        <h3>Edit Profile</h3>

        <VTextField
          v-model="displayName"
          label="Display Name"
          variant="outlined"
          density="compact"
          :error="updateError && !displayName"
          required
        />

        <VTextField
          v-model="phoneNumber"
          label="Phone Number"
          variant="outlined"
          density="compact"
          prefix="+65"
          :error="
            !!(
              updateError &&
              phoneNumber &&
              !/^(6|8|9)\d{7}$/.test(phoneNumber)
            )
          "
          hint="8 digits starting with 6, 8, or 9"
          persistent-hint
        />

        <div class="email-readonly">
          <label>Email (cannot be changed)</label>
          <p>{{ user?.email }}</p>
        </div>

        <!-- Error/Success Messages -->
        <VAlert
          v-if="updateError"
          type="error"
          density="compact"
          closable
          @click:close="updateError = false"
        >
          {{ errorMessage }}
        </VAlert>

        <VAlert v-if="updateSuccess" type="success" density="compact">
          Profile updated successfully!
        </VAlert>

        <!-- Action Buttons -->
        <div class="edit-actions">
          <VBtn variant="outlined" @click="cancelEdit" :disabled="isLoading">
            Cancel
          </VBtn>
          <VBtn color="primary" @click="saveProfile" :loading="isLoading">
            Save Changes
          </VBtn>
        </div>
      </div>
    </ClientOnly>
    <ClientOnly>
      <div class="profile__credits">
        <h6>Total Credits</h6>
        <h5>${{ totalCreditsLeft }}</h5>

        <!-- Credits Breakdown -->
        <div class="credits-breakdown">
          <div class="credit-row">
            <VIcon icon="mdi-cash-multiple" size="small" color="green" />
            <span class="credit-label">Purchased:</span>
            <span class="credit-amount">${{ purchasedCreditsLeft }}</span>
          </div>
          <div class="credit-row">
            <VIcon icon="mdi-cash-refund" size="small" color="orange" />
            <span class="credit-label">Refund:</span>
            <span class="credit-amount">${{ refundCreditsLeft }}</span>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.profileUserDetails {
  display: grid;
  align-items: start;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  box-shadow: $box-shadow;
  padding: $p-margin;

  .icon {
    width: 4rem;
    height: 4rem;
  }

  // Mobile responsive layout
  @media (max-width: 768px) {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 1.5rem;

    .icon {
      grid-row: 1;
      grid-column: 1;
    }

    .profile__details {
      grid-row: 1;
      grid-column: 2;
    }

    .profile__credits {
      grid-row: 2;
      grid-column: 1 / -1;
      justify-self: stretch;
      width: 100% !important;
      max-width: 400px;
      margin: 0 auto;
    }
  }
}

.profile {
  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 300px;

    .details-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h3 {
        margin: 0;
      }
    }

    .email-field {
      cursor: help;
      color: rgba(0, 0, 0, 0.6);
    }

    .password-reset-btn {
      margin-top: 0.5rem;
      align-self: flex-start;
    }

    .google-account-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 0.5rem;
    }

    &--edit {
      gap: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.01);
      border-radius: 8px;

      h3 {
        margin-bottom: 0.5rem;
      }

      .email-readonly {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px;

        label {
          font-size: 0.75rem;
          color: rgba(0, 0, 0, 0.6);
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.87);
        }
      }

      .edit-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }
    }
  }

  &__credits {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: $unit;
    align-items: flex-end;
    justify-self: self-end;

    .credits-breakdown {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      font-size: 0.875rem;

      .credit-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .credit-label {
          flex: 1;
          color: rgba(0, 0, 0, 0.6);
        }

        .credit-amount {
          font-weight: 600;
          color: rgba(0, 0, 0, 0.87);
        }
      }
    }
  }
}
</style>
