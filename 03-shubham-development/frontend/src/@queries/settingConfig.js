import { useQuery } from "@tanstack/react-query";
import { settingsConfigFetcher } from "@api/setting/settings-config-fetcher";

export function useQuerySettingsConfig(options) {
  return useQuery({
    queryKey: ["admin-settings-config"],
    queryFn: async () => settingsConfigFetcher(),
    ...options,
  });
}
