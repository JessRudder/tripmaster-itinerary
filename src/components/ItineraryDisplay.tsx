import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TripItinerary } from '@/lib/types'
import { DayCard } from './DayCard'
import { WeatherCard } from './WeatherCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, Users, Sparkle, CaretLeft, CaretRight } from '@phosphor-icons/react'

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
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const handlePreviousDay = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(-1)
    setCurrentDayIndex(prev => prev > 0 ? prev - 1 : itinerary.activities.length - 1)
    setTimeout(() => setIsTransitioning(false), 300)
  }
  
  const handleNextDay = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(1)
    setCurrentDayIndex(prev => prev < itinerary.activities.length - 1 ? prev + 1 : 0)
    setTimeout(() => setIsTransitioning(false), 300)
  }
  
  const handleDaySelect = (index: number) => {
    if (isTransitioning || index === currentDayIndex) return
    setIsTransitioning(true)
    setDirection(index > currentDayIndex ? 1 : -1)
    setCurrentDayIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning) return
      if (event.key === 'ArrowLeft') {
        handlePreviousDay()
      } else if (event.key === 'ArrowRight') {
        handleNextDay()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTransitioning])
  
  const currentActivity = itinerary.activities[currentDayIndex]
  
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
            {itinerary.startDate && itinerary.endDate && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
              </Badge>
            )}
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
          
          {/* Weather Information */}
          {itinerary.weather && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Weather</h3>
              <WeatherCard weather={itinerary.weather} />
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {/* Day Navigation Header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousDay}
                disabled={isTransitioning}
                className="flex items-center gap-2 transition-opacity"
              >
                <CaretLeft size={16} />
                Previous Day
              </Button>
              
              <div className="text-center">
                <motion.h2 
                  key={`title-${currentDayIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-semibold"
                >
                  Day {currentActivity.day} of {itinerary.activities.length}
                </motion.h2>
                <motion.p 
                  key={`subtitle-${currentDayIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-muted-foreground"
                >
                  {currentActivity.title}
                </motion.p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
                disabled={isTransitioning}
                className="flex items-center gap-2 transition-opacity"
              >
                Next Day
                <CaretRight size={16} />
              </Button>
            </div>
            
            {/* Day indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {itinerary.activities.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDaySelect(index)}
                  disabled={isTransitioning}
                  whileHover={{ scale: index !== currentDayIndex ? 1.1 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentDayIndex 
                      ? 'bg-primary scale-110' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  aria-label={`Go to day ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Day Card */}
        <motion.div 
          className="flex justify-center"
          animate={{ 
            backgroundColor: isTransitioning ? 'var(--muted)' : 'transparent'
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full max-w-2xl relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentDayIndex}
                custom={direction}
                initial={{ 
                  x: direction > 0 ? '100%' : '-100%', 
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  scale: 1
                }}
                exit={{ 
                  x: direction > 0 ? '-100%' : '100%', 
                  opacity: 0,
                  scale: 0.95
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  mass: 0.8,
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.3 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(event, info) => {
                  const swipeThreshold = 50
                  if (info.offset.x > swipeThreshold && !isTransitioning) {
                    handlePreviousDay()
                  } else if (info.offset.x < -swipeThreshold && !isTransitioning) {
                    handleNextDay()
                  }
                }}
                className="w-full cursor-grab active:cursor-grabbing"
              >
                <DayCard activity={currentActivity} />
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation hint with fade animation */}
            <motion.p 
              className="text-xs text-muted-foreground text-center mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              Use arrow keys ← → or swipe left/right to navigate between days
            </motion.p>
          </div>
        </motion.div>
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