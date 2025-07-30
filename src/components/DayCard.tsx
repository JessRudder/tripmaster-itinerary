import { DayActivity } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhotoGallery } from '@/components/PhotoGallery'
import { WeatherCard } from '@/components/WeatherCard'
import { Clock, DollarSign, Plus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <CardTitle className="text-lg font-semibold">
                Day {activity.day}
              </CardTitle>
              {activity.date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
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
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h3 className="font-medium text-base text-primary mb-2">
              {activity.mainActivity}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          </motion.div>

          {/* Weather Information */}
          {activity.weather && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <h4 className="text-sm font-medium mb-2 text-foreground">Weather</h4>
              <WeatherCard weather={activity.weather} compact />
            </motion.div>
          )}

          {/* Photo Gallery */}
          {activity.photos && activity.photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <PhotoGallery photos={activity.photos} />
            </motion.div>
          )}
          
          {activity.addOns && activity.addOns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              <h4 className="flex items-center gap-1 text-sm font-medium mb-2 text-foreground">
                <Plus size={14} />
                Add-on Suggestions
              </h4>
              <ul className="space-y-1">
                {activity.addOns.map((addOn, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.05), duration: 0.2 }}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-accent mt-1">•</span>
                    <span className="flex-1">{addOn}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}