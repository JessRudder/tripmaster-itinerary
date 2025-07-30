import { useState } from 'react'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PackingItem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  CaretDown, 
  CaretUp, 
  Backpack, 
  Tshirt, 
  Wrench, 
  Sunglasses, 
  IdentificationCard, 
  Heart, 
  Laptop 
} from '@phosphor-icons/react'

interface PackingSuggestionsProps {
  packingList: PackingItem[]
}

const categoryIcons = {
  clothing: Tshirt,
  gear: Wrench,
  accessories: Sunglasses,
  documents: IdentificationCard,
  personal: Heart,
  electronics: Laptop
}

const categoryLabels = {
  clothing: 'Clothing',
  gear: 'Gear & Equipment',
  accessories: 'Accessories',
  documents: 'Documents',
  personal: 'Personal Items',
  electronics: 'Electronics'
}

const priorityColors = {
  essential: 'destructive',
  recommended: 'secondary',
  optional: 'outline'
} as const

const priorityLabels = {
  essential: 'Essential',
  recommended: 'Recommended',
  optional: 'Optional'
}

export function PackingSuggestions({ packingList }: PackingSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Group items by category
  const itemsByCategory = packingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, PackingItem[]>)

  // Sort categories by priority (essential items first)
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const aHasEssential = itemsByCategory[a].some(item => item.priority === 'essential')
    const bHasEssential = itemsByCategory[b].some(item => item.priority === 'essential')
    
    if (aHasEssential && !bHasEssential) return -1
    if (!aHasEssential && bHasEssential) return 1
    return 0
  })

  const totalItems = packingList.length
  const essentialItems = packingList.filter(item => item.priority === 'essential').length

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Backpack className="text-accent" size={20} />
                Packing Suggestions
                <Badge variant="secondary" className="text-xs">
                  {totalItems} items
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Smart packing suggestions based on your activities and weather conditions
              {essentialItems > 0 && ` • ${essentialItems} essential items`}
            </p>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <CardContent className="pt-0">
                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs"
                    >
                      All Categories
                    </Button>
                    {sortedCategories.map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons]
                      const hasEssential = itemsByCategory[category].some(item => item.priority === 'essential')
                      
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Icon size={12} />
                          {categoryLabels[category as keyof typeof categoryLabels]}
                          {hasEssential && (
                            <Badge variant="destructive" className="text-xs px-1 py-0 ml-1">
                              !
                            </Badge>
                          )}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Items list */}
                  <div className="space-y-4">
                    {(selectedCategory ? [selectedCategory] : sortedCategories).map((category) => {
                      const items = itemsByCategory[category]
                      if (!items || items.length === 0) return null

                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2"
                        >
                          {!selectedCategory && (
                            <h4 className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
                              {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { size: 14 })}
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </h4>
                          )}
                          
                          <div className="grid gap-2">
                            {items
                              .sort((a, b) => {
                                // Sort by priority: essential, recommended, optional
                                const priorityOrder = { essential: 0, recommended: 1, optional: 2 }
                                return priorityOrder[a.priority] - priorityOrder[b.priority]
                              })
                              .map((item, index) => (
                                <motion.div
                                  key={`${category}-${index}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">{item.item}</span>
                                      <Badge 
                                        variant={priorityColors[item.priority]}
                                        className="text-xs"
                                      >
                                        {priorityLabels[item.priority]}
                                      </Badge>
                                    </div>
                                    {item.reason && (
                                      <p className="text-xs text-muted-foreground">
                                        {item.reason}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total items:</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Essential items:</span>
                      <span className="font-medium text-destructive">{essentialItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Categories:</span>
                      <span className="font-medium">{sortedCategories.length}</span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}