import { useState } from 'react'
import { TripFormData, ActivityType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Users, Compass } from '@phosphor-icons/react'

interface TripFormProps {
  onSubmit: (data: TripFormData) => void
  isLoading: boolean
}

const activityOptions: { value: ActivityType; label: string; description: string }[] = [
  { value: 'cultural', label: 'Cultural', description: 'Museums, history, local traditions' },
  { value: 'adventure', label: 'Adventure', description: 'Hiking, sports, outdoor thrills' },
  { value: 'relaxation', label: 'Relaxation', description: 'Spas, beaches, peaceful activities' },
  { value: 'food', label: 'Food & Drink', description: 'Restaurants, markets, culinary tours' },
  { value: 'nature', label: 'Nature', description: 'Parks, wildlife, natural attractions' },
  { value: 'urban', label: 'Urban', description: 'Shopping, nightlife, city experiences' }
]

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    days: 3,
    hasChildren: false,
    activityType: 'cultural'
  })

  const [errors, setErrors] = useState<Partial<TripFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<TripFormData> = {}
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination'
    }
    
    if (formData.days < 1 || formData.days > 14) {
      newErrors.days = 'Trip must be between 1-14 days'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Compass className="text-primary" />
          Plan Your Perfect Trip
        </CardTitle>
        <CardDescription>
          Tell us about your dream destination and we'll create a personalized itinerary just for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin size={16} />
              Destination
            </Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g., Paris, Tokyo, New York City"
              className={errors.destination ? 'border-destructive' : ''}
            />
            {errors.destination && (
              <p className="text-sm text-destructive">{errors.destination}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="days" className="flex items-center gap-2">
              <Calendar size={16} />
              Number of Days
            </Label>
            <Select
              value={formData.days.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, days: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day} {day === 1 ? 'day' : 'days'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.days && (
              <p className="text-sm text-destructive">{errors.days}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="children" className="flex items-center gap-2">
                <Users size={16} />
                Traveling with children
              </Label>
              <p className="text-sm text-muted-foreground">
                Include family-friendly activities and accommodations
              </p>
            </div>
            <Switch
              id="children"
              checked={formData.hasChildren}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasChildren: checked }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Activity Focus</Label>
            <div className="grid grid-cols-2 gap-3">
              {activityOptions.map(option => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    formData.activityType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, activityType: option.value }))}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{option.label}</span>
                    {formData.activityType === option.value && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Creating Your Itinerary...' : 'Generate Itinerary'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}