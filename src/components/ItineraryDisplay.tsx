import { TripItinerary } from '@/lib/types'
import { DayCard } from './DayCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, Users, Sparkle } from '@phosphor-icons/react'

interface ItineraryDisplayProps {
  itinerary: TripItinerary
  onBack: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

const activityTypeLabels = {
  cultural: 'Cultural',
  adventure: 'Adventure',
  relaxation: 'Relaxation',
  food: 'Food & Drink',
  nature: 'Nature',
  urban: 'Urban'
}

export function ItineraryDisplay({ itinerary, onBack, onRegenerate, isRegenerating }: ItineraryDisplayProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hero Photo Section - only show if hero photo exists */}
      {itinerary.heroPhoto && (
        <Card className="overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img
              src={itinerary.heroPhoto.url}
              alt={itinerary.heroPhoto.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for hero image
                const target = e.target as HTMLImageElement
                if (!target.src.includes('via.placeholder.com')) {
                  target.src = `https://via.placeholder.com/1200x800/e2e8f0/64748b?text=${encodeURIComponent(itinerary.destination)}`
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {itinerary.destination}
              </h1>
              <p className="text-lg opacity-90">
                {itinerary.heroPhoto.caption}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-2"
            >
              <ArrowLeft className="mr-2" />
              Plan New Trip
            </Button>
            <Button 
              variant="outline" 
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <Sparkle className="mr-2" />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
          
          <CardTitle className="text-2xl font-bold">
            Your {itinerary.days}-Day {itinerary.destination} Adventure
          </CardTitle>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin size={14} />
              {itinerary.destination}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar size={14} />
              {itinerary.days} {itinerary.days === 1 ? 'day' : 'days'}
            </Badge>
            {itinerary.hasChildren && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users size={14} />
                Family-friendly
              </Badge>
            )}
            <Badge variant="default">
              {activityTypeLabels[itinerary.activityType]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itinerary.activities.map((activity) => (
          <DayCard key={activity.day} activity={activity} />
        ))}
      </div>
      
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            ✨ This itinerary was generated on {new Date(itinerary.createdAt).toLocaleDateString()} 
            and is saved for your future reference. Happy travels!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}