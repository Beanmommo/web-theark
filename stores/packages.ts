import type { PackageDetails } from "~/types/data";

export const usePackagesStore = defineStore("packages", () => {
  const packages = ref<PackageDetails[]>([] as PackageDetails[]);

  const getPackagesBySport = (sportSlug: string) => {
    return packages.value.filter(
      (pkg) => (pkg.typeOfSports?.toLowerCase() ?? "futsal") === sportSlug
    );
  };
  const fetchPackages = async () => {
    const { data } = await useFetch("/api/packages");
    if (!data.value) return;
    const packageList: PackageDetails[] = Object.keys(data.value).map((key) => {
      return {
        key,
        ...data.value[key],
      };
    });
    packages.value = packageList;
    return packageList;
  };

  return {
    packages,
    fetchPackages,
    getPackagesBySport,
  };
});
