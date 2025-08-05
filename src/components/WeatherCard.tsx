import { WeatherData } from '@/lib/types'
import { formatTemperature } from '@/lib/weather-service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Thermometer, Droplets, Wind } from '@phosphor-icons/react'

interface WeatherCardProps {
  weather: WeatherData
  compact?: boolean
  className?: string
}

export function WeatherCard({ weather, compact = false, className = '' }: WeatherCardProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <span className="text-lg">{weather.icon}</span>
        <span className="font-medium">{formatTemperature(weather.temperature)}</span>
        <span className="text-muted-foreground">{weather.condition}</span>
      </div>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <div className="text-2xl font-bold">{formatTemperature(weather.temperature)}</div>
              <div className="text-sm text-muted-foreground">{weather.condition}</div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {weather.description}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" />
            <span className="text-muted-foreground">Humidity</span>
            <span className="font-medium ml-auto">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-gray-500" />
            <span className="text-muted-foreground">Wind</span>
            <span className="font-medium ml-auto">{weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}