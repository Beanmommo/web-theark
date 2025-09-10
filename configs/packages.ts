import { type PackageDetails } from '../types/data'

export const packagesConfig: PackageDetails[] = [{
  title: 'Package A',
  amount: '1000',
  expiryPeriod: 6,
  type: "Discounted",
  unit: "month",
  value: '1100',
  id: 'packagea'
},
{
  title: 'Package B',
  amount: '2000',
  expiryPeriod: 6,
  type: "Discounted",
  unit: "month",
  value: '2250',
  id: 'packageb'
}]