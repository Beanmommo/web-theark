<script setup lang="ts">
import type { PackageDetails, Invoice } from '../../types/data'
import { usePresalesStore } from '../../stores/presales';
enum Step {
  SelectionPage = 1,
  AuthPage = 2,
  PaymentPage = 3,
  QRPage = 4
}

const route = useRoute()
const router = useRouter()
const user = useAuthUser()
const presalesStore = usePresalesStore()
const isLogin = computed(() => user.value !== null)

const packagesStore = usePackagesStore()
const packageConfig = computed(() => {
  return packagesStore.getPackagesBySport(route.params.sportSlug as string)
})

const step = ref(Step.SelectionPage)
const selectedPackage = ref<PackageDetails>()
const invoiceData = ref({} as Invoice)

onMounted(() => {
  if (route.query.package)
    initialisePackage(route.query.package as string)
})
watch(isLogin, (login: boolean) => {
  if (login && step.value === Step.AuthPage) step.value = Step.PaymentPage
  if (!login && step.value === Step.PaymentPage) step.value = Step.AuthPage
})

watch(() => route.query.package, (packageId) => {
  if (!packageId) step.value = Step.SelectionPage
  else {
    initialisePackage(packageId as string)
  }
})

const isSelectionPage = computed(() => step.value === Step.SelectionPage)
const isAuthPage = computed(() => step.value === Step.AuthPage)
const isPaymentPage = computed(() => step.value === Step.PaymentPage)
const isQRPage = computed(() => step.value === Step.QRPage)

function initialisePackage(packageId: string) {
  selectedPackage.value = packageConfig.value.find(pkg => pkg.id === packageId)
  if (selectedPackage.value)
    presalesStore.updatePackageDetails(selectedPackage.value)

  if (isLogin.value)
    step.value = Step.PaymentPage
  else
    step.value = Step.AuthPage
}

function updateHandler(packageSelected: PackageDetails) {
  selectedPackage.value = packageSelected
  if (selectedPackage.value)
    presalesStore.updatePackageDetails(selectedPackage.value)
  router.replace({ query: { package: packageSelected.id } })
  if (isLogin.value) step.value = Step.PaymentPage
  else step.value = Step.AuthPage
}

function backHandler() {
  router.replace({ query: { package: undefined } })
  step.value = Step.SelectionPage
}


function submitHandler(invoiceDetails: Invoice) {
  step.value = Step.QRPage
  invoiceData.value = invoiceDetails
}
</script>

<template>
  <PageBannerPackages />
  <PackagePurchasePage1 v-show="isSelectionPage" @update="updateHandler" />
  <PackagePurchasePage2 v-if="isAuthPage" />
  <PackagePurchasePage3 v-if="isPaymentPage && selectedPackage" @back="backHandler" :packageItem="selectedPackage"
    @submit="submitHandler" />
  <PackagePurchaseQRPayNow v-if="isQRPage" :invoiceData="invoiceData" />
</template>