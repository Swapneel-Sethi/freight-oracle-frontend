import { useQuery } from '@tanstack/react-query'

interface KpiData {
  freightQ50: number  // Normalized 0-1
  overhangScore: number  // 0-100
  bunkerVlsfo: number
  avgRate: number
}

export function useKpi() {
  const { data, isLoading } = useQuery<KpiData>({
    queryKey: ['kpi'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/v1/dashboard/summary')
        if (!response.ok) throw new Error('Failed to fetch KPI')
        return response.json()
      } catch {
        return { freightQ50: 0.5, overhangScore: 50, bunkerVlsfo: 550, avgRate: 25 }
      }
    },
    refetchInterval: 30000,
  })
  
  // Normalize freight Q50 to 0-1 range (base ~25, cap ~60)
  const freightQ50 = data ? Math.min(1, ((data.avgRate ?? 25) - 15) / 45) : 0.5
  
  return {
    freightQ50: isLoading ? 0.5 : freightQ50,
    overhangScore: data?.overhangScore ?? 50,
    bunkerVlsfo: data?.bunkerVlsfo ?? 550,
    avgRate: data?.avgRate ?? 25,
    isLoading,
  }
}