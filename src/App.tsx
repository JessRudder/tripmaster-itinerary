import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { TripFormData, TripItinerary } from '@/lib/types'
import { generateItinerary } from '@/lib/trip-generator'
import { TripForm } from '@/components/TripForm'
import { ItineraryDisplay } from '@/components/ItineraryDisplay'
import { LoadingState } from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plane, MapPin, Calendar, Sparkle } from '@phosphor-icons/react'

type AppState = 'form' | 'loading' | 'itinerary'

function App() {
  const [appState, setAppState] = useState<AppState>('form')
  const [currentItinerary, setCurrentItinerary] = useState<TripItinerary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedItineraries, setSavedItineraries] = useKV<TripItinerary[]>('trip-itineraries', [])

  const handleFormSubmit = async (formData: TripFormData) => {
    setIsLoading(true)
    setAppState('loading')
    
    try {
      const itinerary = await generateItinerary(formData)
      setCurrentItinerary(itinerary)
      
      // Save to persistent storage
      setSavedItineraries(prev => [itinerary, ...prev.slice(0, 9)]) // Keep last 10
      
      setAppState('itinerary')
      toast.success('Your itinerary is ready!')
    } catch (error) {
      console.error('Error generating itinerary:', error)
      toast.error('Failed to generate itinerary. Please try again.')
      setAppState('form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!currentItinerary) return
    
    const formData: TripFormData = {
      destination: currentItinerary.destination,
      days: currentItinerary.days,
      hasChildren: currentItinerary.hasChildren,
      activityType: currentItinerary.activityType
    }
    
    setIsLoading(true)
    
    try {
      const newItinerary = await generateItinerary(formData)
      setCurrentItinerary(newItinerary)
      
      // Update saved itineraries
      setSavedItineraries(prev => [newItinerary, ...prev.filter(it => it.id !== currentItinerary.id)])
      
      toast.success('Your itinerary has been refreshed!')
    } catch (error) {
      console.error('Error regenerating itinerary:', error)
      toast.error('Failed to regenerate itinerary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setAppState('form')
    setCurrentItinerary(null)
  }

  const loadItinerary = (itinerary: TripItinerary) => {
    setCurrentItinerary(itinerary)
    setAppState('itinerary')
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  if (appState === 'itinerary' && currentItinerary) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <ItineraryDisplay
            itinerary={currentItinerary}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            isRegenerating={isLoading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Plane className="text-primary" size={32} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TripCraft
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-2">
            AI-powered trip planning made simple
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <TripForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          
          {savedItineraries.length > 0 && (
            <div className="w-full lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkle className="text-accent" />
                    Previous Trips
                  </CardTitle>
                  <CardDescription>
                    Your recently generated itineraries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {savedItineraries.slice(0, 5).map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => loadItinerary(itinerary)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate flex-1">
                          {itinerary.destination}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {itinerary.days}d
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {new Date(itinerary.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App