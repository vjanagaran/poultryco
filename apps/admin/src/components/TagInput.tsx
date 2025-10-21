'use client'

import { useState, useRef, useEffect } from 'react'

interface Tag {
  id: string
  name: string
  slug: string
}

interface TagInputProps {
  availableTags: Tag[]
  selectedTags: string[]
  onChange: (tagIds: string[]) => void
  onCreateTag?: (name: string) => Promise<Tag>
}

export default function TagInput({ 
  availableTags, 
  selectedTags, 
  onChange,
  onCreateTag 
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input.trim()) {
      const filtered = availableTags.filter(
        tag => 
          tag.name.toLowerCase().includes(input.toLowerCase()) &&
          !selectedTags.includes(tag.id)
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [input, availableTags, selectedTags])

  const addTag = async (tag: Tag) => {
    if (!selectedTags.includes(tag.id)) {
      onChange([...selectedTags, tag.id])
    }
    setInput('')
    setShowSuggestions(false)
    setActiveSuggestion(0)
  }

  const createAndAddTag = async () => {
    if (!input.trim()) return
    
    if (onCreateTag) {
      try {
        const newTag = await onCreateTag(input.trim())
        addTag(newTag)
      } catch (error) {
        console.error('Error creating tag:', error)
        alert('Failed to create tag')
      }
    }
  }

  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0 && showSuggestions) {
        addTag(suggestions[activeSuggestion])
      } else if (input.trim() && onCreateTag) {
        createAndAddTag()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : 0)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  const getTagById = (id: string) => availableTags.find(t => t.id === id)

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(tagId => {
          const tag = getTagById(tagId)
          return tag ? (
            <span
              key={tagId}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tagId)}
                className="hover:text-green-900 focus:outline-none"
              >
                ×
              </button>
            </span>
          ) : null
        })}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => input && setShowSuggestions(true)}
        placeholder="Type to search or add new tags..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || (input.trim() && onCreateTag)) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                index === activeSuggestion ? 'bg-gray-50' : ''
              }`}
            >
              <div className="font-medium">{tag.name}</div>
              <div className="text-xs text-gray-500">/{tag.slug}</div>
            </button>
          ))}

          {/* Create New Tag Option */}
          {input.trim() && onCreateTag && !suggestions.some(t => t.name.toLowerCase() === input.toLowerCase()) && (
            <button
              type="button"
              onClick={createAndAddTag}
              className="w-full text-left px-4 py-2 border-t border-gray-200 hover:bg-green-50 text-green-700 font-medium"
            >
              + Create new tag: "{input}"
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-1">
        Type to search existing tags or press Enter to create a new one
      </p>
    </div>
  )
}

