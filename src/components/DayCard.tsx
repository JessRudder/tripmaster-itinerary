import { DayActivity } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhotoGallery } from '@/components/PhotoGallery'
import { Clock, DollarSign, Plus } from '@phosphor-icons/react'

interface DayCardProps {
  activity: DayActivity
}

const costColors = {
  budget: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  expensive: 'bg-red-100 text-red-800 border-red-200'
}

const timeIcons = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌅',
  'full-day': '🌍'
}

export function DayCard({ activity }: DayCardProps) {
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Day {activity.day}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activity.timeOfDay && (
              <Badge variant="outline" className="text-xs">
                <Clock size={12} className="mr-1" />
                {timeIcons[activity.timeOfDay]} {activity.timeOfDay}
              </Badge>
            )}
            {activity.estimatedCost && (
              <Badge 
                variant="outline" 
                className={`text-xs ${costColors[activity.estimatedCost as keyof typeof costColors] || 'bg-gray-100 text-gray-800'}`}
              >
                <DollarSign size={12} className="mr-1" />
                {activity.estimatedCost}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-base text-primary mb-2">
            {activity.mainActivity}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Photo Gallery */}
        {activity.photos && activity.photos.length > 0 && (
          <PhotoGallery photos={activity.photos} />
        )}
        
        {activity.addOns && activity.addOns.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1 text-sm font-medium mb-2 text-foreground">
              <Plus size={14} />
              Add-on Suggestions
            </h4>
            <ul className="space-y-1">
              {activity.addOns.map((addOn, index) => (
                <li 
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-accent mt-1">•</span>
                  <span className="flex-1">{addOn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}